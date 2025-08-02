import { NextRequest, NextResponse } from 'next/server';

/**
 * NOTE: Local PDF parsing removed per product direction.
 * We now send either the URL or the uploaded PDF (as base64) directly to the LLM.
 */

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
  const system = `You are a precise research-paper analyst. Return ONLY valid JSON per the user's schema. If information is unavailable, leave empty string or [].`;
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
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error: ${res.status} ${res.statusText} - ${text}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No content from OpenRouter');
  }

  try {
    return JSON.parse(content);
  } catch {
    const stripped = String(content).replace(/```json|```/g, '').trim();
    return JSON.parse(stripped);
  }
}

function buildUrlPrompt(url: string) {
  return `
You will fetch and read the research paper available at this URL and output ONLY JSON (no markdown fences) that matches exactly this schema:
{
  "metadata": { "title": string, "authors": string[], "venue_year": string, "link": string, "code_or_data": string },
  "core_contribution": string,
  "innovations_methodology": string[],
  "significance": { "classification": "Fundamental Advance" | "Significant Increment" | "Niche Contribution" | string, "justification": string },
  "limitations": string[],
  "open_questions": string[],
  "plain_english_summary": string
}
Constraints:
- Fill fields from the paper. If unknown, use empty string or [].
- metadata.link must be "${url}".
- Return only the JSON object.`.trim();
}

function buildUploadPrompt(b64: string, sourceUrl?: string) {
  return `
A research paper PDF is provided as base64 below. Read it and output ONLY JSON that matches exactly this schema:
{
  "metadata": { "title": string, "authors": string[], "venue_year": string, "link": string, "code_or_data": string },
  "core_contribution": string,
  "innovations_methodology": string[],
  "significance": { "classification": "Fundamental Advance" | "Significant Increment" | "Niche Contribution" | string, "justification": string },
  "limitations": string[],
  "open_questions": string[],
  "plain_english_summary": string
}
Constraints:
- Fill fields from the paper. If unknown, use empty string or [].
- ${sourceUrl ? `metadata.link must be "${sourceUrl}".` : `If a source link is not known, set metadata.link to "". `}
- Return only the JSON object.

PDF_BASE64:
${b64}`.trim();
}

export const runtime = 'nodejs'; // ensure Node APIs for Buffer

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const contentType = req.headers.get('content-type') || '';
    let openrouterApiKey = '';
    let openrouterModel = '';
    let url: string | undefined;
    let linkForMeta: string | undefined;
    let prompt: string | undefined;

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
      const b64 = Buffer.from(new Uint8Array(arrayBuffer)).toString('base64');
      prompt = buildUploadPrompt(b64, url);
      linkForMeta = url;
    } else {
      // JSON body with url
      const body = await req.json().catch(() => ({}));
      url = body?.url;
      openrouterApiKey = String(body?.openrouterApiKey || '');
      openrouterModel = String(body?.openrouterModel || '');

      if (!openrouterApiKey || !openrouterModel) {
        return NextResponse.json({ error: 'Missing OpenRouter credentials' }, { status: 400 });
      }

      if (!url) {
        return NextResponse.json({ error: 'Provide a PDF or preprint URL or upload a PDF via multipart/form-data' }, { status: 400 });
      }

      // Keep original URL (arXiv/bioRxiv/etc.). Let the LLM fetch/resolve.
      prompt = buildUrlPrompt(url);
      linkForMeta = url;
    }

    const result = await callOpenRouter({
      apiKey: openrouterApiKey,
      model: openrouterModel,
      prompt: prompt!,
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