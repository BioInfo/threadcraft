import { NextRequest, NextResponse } from 'next/server';

// Lightweight PDF parsing using pdf-parse. If not installed, add to package.json: pdf-parse
// We use a dynamic import so build won't crash if not present locally yet.
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // @ts-ignore
    const pdfParse = (await import('pdf-parse')).default ?? (await import('pdf-parse'));
    const data = await pdfParse(buffer);
    return data.text ?? '';
  } catch (err) {
    console.error('PDF parse error:', err);
    throw new Error('Failed to parse PDF');
  }
}

function isArxivUrl(url: string): boolean {
  return /arxiv\.org\/(abs|pdf)\//i.test(url);
}

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { headers: { 'user-agent': 'ThreadCraft/1.0' } });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }
  return await res.arrayBuffer();
}

function bufferFromArrayBuffer(ab: ArrayBuffer): Buffer {
  return Buffer.from(new Uint8Array(ab));
}

// Minimal OpenRouter call wrapper
async function callOpenRouter({
  apiKey,
  model,
  prompt,
}: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<any> {
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  // We request JSON output; instruct model strictly
  const system = `You are an expert AI researcher and critical analyst. Be pragmatic, incisive, and objective. Ground all claims in specific evidence from the provided paper text. Return ONLY valid JSON according to the user-provided schema. If incomplete text, state limitations.`;
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: prompt },
  ];

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error: ${res.status} ${res.statusText} - ${text}`);
  }

  const json = await res.json();
  // OpenRouter returns choices with message.content
  const content = json?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No content from OpenRouter');
  }

  // Try parse JSON
  try {
    return JSON.parse(content);
  } catch (_e) {
    // If model wrapped JSON in code fences, strip fences
    const stripped = String(content).replace(/```json|```/g, '').trim();
    return JSON.parse(stripped);
  }
}

function buildUserPrompt(paperText: string, link?: string) {
  // Mirrors docs/advanced/research_papers_feature_spec.md schema
  return `
Analyze the following paper and produce a report with exactly these sections and constraints. Return valid JSON following this schema:

{
  "metadata": {
    "title": "",
    "authors": [],
    "venue_year": "",
    "link": "",
    "code_or_data": ""
  },
  "core_contribution": "",
  "innovations_methodology": [],
  "significance": {
    "classification": "Fundamental Advance | Significant Increment | Niche Contribution",
    "justification": ""
  },
  "limitations": [],
  "open_questions": [],
  "plain_english_summary": ""
}

Paper text (UTF-8):
---
${paperText}
---

Hint: If a link is known, include it in metadata.link: ${link ?? ''}

Rules:
- Keep JSON valid and minimal, no extra keys.
- Bullet arrays must be concise strings.
- classification must be one of the three allowed values.
- If information is missing, leave the field empty string or [] and mention limitation in the summary justification where applicable.
`.trim();
}

export const runtime = 'nodejs'; // ensure Node APIs for Buffer

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const contentType = req.headers.get('content-type') || '';
    let openrouterApiKey = '';
    let openrouterModel = '';
    let url: string | undefined;
    let paperText = '';
    let linkForMeta: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      // Multipart with file upload
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      openrouterApiKey = String(formData.get('openrouterApiKey') || '');
      openrouterModel = String(formData.get('openrouterModel') || '');
      url = (formData.get('url') as string) || undefined;

      if (!file || file.size === 0) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }
      if (!openrouterApiKey || !openrouterModel) {
        return NextResponse.json({ error: 'Missing OpenRouter credentials' }, { status: 400 });
      }
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF uploads are supported' }, { status: 400 });
      }
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: 'PDF too large (max 20MB)' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = bufferFromArrayBuffer(arrayBuffer);
      paperText = await extractPdfText(buffer);
      linkForMeta = url;
    } else {
      // JSON body with url OR direct text (future)
      const body = await req.json().catch(() => ({}));
      url = body?.url;
      openrouterApiKey = String(body?.openrouterApiKey || '');
      openrouterModel = String(body?.openrouterModel || '');

      if (!openrouterApiKey || !openrouterModel) {
        return NextResponse.json({ error: 'Missing OpenRouter credentials' }, { status: 400 });
      }

      if (!url) {
        return NextResponse.json({ error: 'Provide a PDF or arXiv URL or upload a PDF via multipart/form-data' }, { status: 400 });
      }

      // Resolve URL
      let targetUrl = url;
      if (isArxivUrl(url) && !/\.pdf(\?|$)/i.test(url)) {
        // Convert arXiv abs link to pdf
        // e.g., https://arxiv.org/abs/XXXX -> https://arxiv.org/pdf/XXXX.pdf
        const idMatch = url.match(/arxiv\.org\/abs\/([^?#]+)/i);
        if (idMatch?.[1]) {
          targetUrl = `https://arxiv.org/pdf/${idMatch[1]}.pdf`;
        }
      }

      const ab = await fetchArrayBuffer(targetUrl);
      const buffer = bufferFromArrayBuffer(ab);
      paperText = await extractPdfText(buffer);
      linkForMeta = url;
    }

    if (!paperText || paperText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Failed to extract sufficient text from PDF' },
        { status: 422 }
      );
    }

    const prompt = buildUserPrompt(paperText, linkForMeta);
    const result = await callOpenRouter({
      apiKey: openrouterApiKey,
      model: openrouterModel,
      prompt,
    });

    // Basic shape validation
    const shape = {
      metadata: {
        title: '',
        authors: [] as string[],
        venue_year: '',
        link: linkForMeta ?? '',
        code_or_data: '',
      },
      core_contribution: '',
      innovations_methodology: [] as string[],
      significance: {
        classification: '',
        justification: '',
      },
      limitations: [] as string[],
      open_questions: [] as string[],
      plain_english_summary: '',
    };

    // Merge defaults with model output
    const response = {
      ...shape,
      ...(typeof result === 'object' ? result : {}),
      metadata: {
        ...shape.metadata,
        ...(result?.metadata ?? {}),
        link: linkForMeta ?? result?.metadata?.link ?? '',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    console.error('Analyze error:', err);
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';