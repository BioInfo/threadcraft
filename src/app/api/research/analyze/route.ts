import { NextRequest, NextResponse } from 'next/server';

/**
 * NOTE: Local PDF parsing removed per product direction.
 * We now send either the URL or the uploaded PDF (as base64) directly to the LLM.
 */

function isArxivUrl(url: string): boolean {
  return /arxiv\.org\/(abs|pdf)\//i.test(url);
}

function isDirectPdfUrl(url: string): boolean {
  return /\.pdf(\?|#|$)/i.test(url);
}

function isBioMedRxiv(url: string): boolean {
  return /(bio|med)rxiv\.org/i.test(url);
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

function normalizeModelSlug(input: string): string {
  const slug = (input ?? '').trim();
  const lower = slug.toLowerCase();
  const aliases: Record<string, string> = {
    'gpt-4o-mini': 'openai/gpt-4o-mini',
    'gpt-4o': 'openai/gpt-4o',
    'gpt-4.1-mini': 'openai/gpt-4.1-mini',
    'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
    'sonnet-3.5': 'anthropic/claude-3.5-sonnet',
    'gemini-1.5-pro': 'google/gemini-1.5-pro',
    'gemini-1.5-flash': 'google/gemini-1.5-flash',
    'grok-2': 'xai/grok-2',
    'grok-2-mini': 'xai/grok-2-mini',
    'grok-3': 'xai/grok-3',
  };
  const mapped = aliases[lower];
  if (typeof mapped === 'string' && mapped.length > 0) return mapped;
  if (lower.includes('/')) return slug; // already vendor-prefixed
  return slug;
}

function isXAIModel(model: string): boolean {
  const m = (model || '').toLowerCase();
  return m.startsWith('xai/') || m.includes('grok');
}

// Provider-safe OpenRouter call that adapts to xAI/Grok constraints
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

  const normalizedModel = normalizeModelSlug(model);
  const isXai = isXAIModel(normalizedModel);

  const baseSystem = `You are a precise research-paper analyst.
Return ONLY a single valid JSON object per the provided schema.
If information is unavailable, use "" or [].`;

  const xaiSystemSuffix = `
STRICT OUTPUT POLICY:
- Return ONLY a single valid JSON object.
- No prose, no code fences, no markdown.
- Do not wrap the JSON in any additional text.`;

  const system = isXai ? `${baseSystem}${xaiSystemSuffix}` : baseSystem;

  // Build minimal messages; ensure each has non-empty string content
  const messages = [
    { role: 'system', content: String(system) },
    { role: 'user', content: String(prompt) },
  ];

  // Construct payload; omit response_format for xAI due to 422 "missing field `content`"
  // Some providers reject response_format or require special headers.
  // Build base payload and add provider-safe toggles below.
  const payload: any = {
    model: normalizedModel,
    messages,
    temperature: 0.1,
  };

  // Provider capability gating:
  // - xAI/Grok: omit response_format
  // - Google Gemini: OpenRouter expects plain messages without response_format for some Gemini backends
  const isGemini = normalizedModel.startsWith('google/');
  if (!isXai && !isGemini) {
    payload.response_format = { type: 'json_object' };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    // Recommended by OpenRouter to improve routing/debug
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'ThreadCraft Research',
  };

  const post = async (body: any) => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      let provider = '';
      let message = text;
      let code = res.status;
      try {
        const j = JSON.parse(text);
        provider = j?.error?.metadata?.provider_name || '';
        message = j?.error?.message || text;
        code = j?.error?.code || res.status;
      } catch {
        // keep raw text
      }
      // Normalize common provider errors into actionable messages
      const err: any = new Error(`OpenRouter error: ${res.status} ${res.statusText} - ${message}`);
      err.status = res.status;
      err.code = code;
      err.body = text;
      err.provider = provider;
      throw err;
    }
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`OpenRouter returned non-JSON: ${String(e)} :: ${text.slice(0, 500)}`);
    }
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content from OpenRouter');
    }

    // JSON normalization identical to previous implementation
    const normalizeJson = (raw: string): string => {
      let s = String(raw).trim();
      s = s.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      const firstBrace = s.indexOf('{');
      if (firstBrace > 0) s = s.slice(firstBrace);
      const lastBrace = s.lastIndexOf('}');
      if (lastBrace >= 0) s = s.slice(0, lastBrace + 1);
      s = s.replace(/^[a-z\s:]*\{/i, '{');
      return s.trim();
    };

    const attemptParse = (raw: string) => JSON.parse(normalizeJson(raw));

    try {
      return attemptParse(content);
    } catch {
      let s = String(content).replace(/```json|```/gi, '').replace(/^\s*(json|object)\s*:/i, '').trim();
      try {
        return attemptParse(s);
      } catch {
        const start = s.indexOf('{');
        const end = s.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          const slice = s.slice(start, end + 1);
          return JSON.parse(slice);
        }
        throw new Error('Model did not return valid JSON');
      }
    }
  };

  try {
    return await post(payload);
  } catch (e: any) {
    const is400 = e?.status === 400;
    const is422 = e?.status === 422;
    const providerName = (e?.provider || '').toLowerCase();
    const mentionsMissingContent = typeof e?.body === 'string' && e.body.includes('missing field `content`');

    // xAI/Grok strictness
    if (isXai && (is422 || is400) && (mentionsMissingContent || providerName === 'xai')) {
      const retryPayload = {
        model: normalizedModel,
        messages,
        temperature: 0.0,
      };
      return await post(retryPayload);
    }

    // Gemini sometimes fails when response_format present; ensure we omit and retry once.
    if (is400 && normalizedModel.startsWith('google/')) {
      const retryPayload = {
        model: normalizedModel,
        messages,
        temperature: 0.0,
      };
      return await post(retryPayload);
    }

    // Fallback: rethrow
    throw e;
  }
}

function truncateUtf8ByChars(input: string, maxChars: number): string {
  if (input.length <= maxChars) return input;
  // Try to respect section boundaries by cutting at a paragraph end near the limit
  const soft = input.lastIndexOf('\n', maxChars - 200);
  const cut = Math.max(0, soft);
  const slice = input.slice(0, cut > maxChars - 400 ? cut : maxChars);
  return slice + '\n\n[TRUNCATED]';
}

function buildSummarizePromptFromText(text: string, link?: string, notice?: string) {
  // Cap raw text to ~40k chars (~10k tokens rough order) to stay under provider limits with prompt/schema
  const MAX_TEXT_CHARS = 40_000;
  const safeText = truncateUtf8ByChars(String(text), MAX_TEXT_CHARS);

  const truncationNote = safeText.endsWith('[TRUNCATED]')
    ? '- Note: Paper text was truncated to fit context limits; summarize faithfully from the provided portion only.'
    : '';

  return `
You will receive the exact content of a research paper (already fetched server-side). Summarize ONLY this provided content and return ONLY JSON matching this schema:
{
  "metadata": { "title": string, "authors": string[], "venue_year": string, "link": string, "code_or_data": string },
  "core_contribution": string,
  "innovations_methodology": string[],
  "significance": { "classification": "Fundamental Advance" | "Significant Increment" | "Niche Contribution" | string, "justification": string },
  "limitations": string[],
  "open_questions": string[],
  "plain_english_summary": string
}
Rules:
- Use ONLY the provided content (do not browse or guess).
- If some fields are missing in the content, leave them as "" or [].
- metadata.link should be ${link ? `"${link}"` : '""'}.
${notice ? `- Note: ${notice}` : '' }
${truncationNote}
Paper text (UTF-8):
---
${safeText}
---`.trim();
}

function buildSummarizePromptFromPdfBase64(b64: string, link?: string, notice?: string) {
  // Limit base64 length to avoid exceeding context; mark truncation explicitly.
  const MAX_B64_CHARS = 250000; // ~250k chars
  const truncated = b64.length > MAX_B64_CHARS;
  const safeB64 = truncated ? (b64.slice(0, MAX_B64_CHARS) + '[TRUNCATED_BASE64]') : b64;
  const truncationNote = truncated
    ? '- Note: PDF content was truncated to fit context limits; summarize faithfully from the provided portion only.'
    : '';

  return `
You will receive a research paper PDF as base64 (already fetched server-side). Read it and return ONLY JSON matching this schema:
{
  "metadata": { "title": string, "authors": string[], "venue_year": string, "link": string, "code_or_data": string },
  "core_contribution": string,
  "innovations_methodology": string[],
  "significance": { "classification": "Fundamental Advance" | "Significant Increment" | "Niche Contribution" | string, "justification": string },
  "limitations": string[],
  "open_questions": string[],
  "plain_english_summary": string
}
Rules:
- Use ONLY the provided PDF (do not browse or guess).
- If some fields are missing, leave them as "" or [].
- metadata.link should be ${link ? `"${link}"` : '""'}.
${notice ? `- Note: ${notice}` : ''}
${truncationNote}
PDF_BASE64:
${safeB64}`.trim();
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

    // Use shared slug normalizer for consistency with callOpenRouter
    const normalizeModel = (m: string): string => normalizeModelSlug(m);

    if (contentType.includes('multipart/form-data')) {
      // Multipart with file upload
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      openrouterApiKey = String(formData.get('openrouterApiKey') || '');
      openrouterModel = normalizeModel(String(formData.get('openrouterModel') || ''));
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
      openrouterModel = normalizeModel(String(body?.openrouterModel || ''));

      if (!openrouterApiKey || !openrouterModel) {
        return NextResponse.json({ error: 'Missing OpenRouter credentials' }, { status: 400 });
      }

      if (!url) {
        return NextResponse.json({ error: 'Provide a PDF or preprint URL or upload a PDF via multipart/form-data' }, { status: 400 });
      }

      // Determine how to fetch and prepare content for the prompt
      linkForMeta = url;

      // Helper to cap large binary-to-base64 inputs before sending
      const toBase64Capped = (ab: ArrayBuffer): string => {
        const b64 = Buffer.from(new Uint8Array(ab)).toString('base64');
        // Hard cap: 200k chars to avoid 400-length errors
        return b64.length > 200_000 ? (b64.slice(0, 200_000) + '[TRUNCATED_BASE64]') : b64;
      };

      if (isDirectPdfUrl(url)) {
        const ab = await fetchArrayBuffer(url);
        const b64 = toBase64Capped(ab);
        prompt = buildSummarizePromptFromPdfBase64(b64, url);
      } else if (isArxivUrl(url)) {
        // Convert arXiv abs to PDF
        const pdfUrl = url.includes('/abs/') ? url.replace('/abs/', '/pdf/') + '.pdf' : url;
        const ab = await fetchArrayBuffer(pdfUrl);
        const b64 = toBase64Capped(ab);
        prompt = buildSummarizePromptFromPdfBase64(b64, url);
      } else if (isBioMedRxiv(url)) {
        // Try to resolve .full.pdf; else fallback to text from HTML
        try {
          const htmlRes = await fetch(url, { headers: { 'user-agent': 'ThreadCraft/1.0' } });
          const html = await htmlRes.text();
          const m = html.match(/href="([^"]+\.full\.pdf)"/i);
          if (m && m[1]) {
            const candidate = m[1];
            const baseUrl: string = url!;
            const pdfHref: string = candidate.startsWith('http') ? candidate : new URL(candidate, baseUrl).toString();
            const ab = await fetchArrayBuffer(pdfHref);
            const b64 = toBase64Capped(ab);
            prompt = buildSummarizePromptFromPdfBase64(b64, url);
          } else {
            let text = extractMainTextFromHtml(html);
            if (!text) {
              return NextResponse.json({ error: 'Unable to extract content from page' }, { status: 400 });
            }
            if (text.length > 120_000) {
              text = text.slice(0, 120_000) + '\n\n[TRUNCATED_BEFORE_PROMPT]';
            }
            prompt = buildSummarizePromptFromText(text, url);
          }
        } catch {
          return NextResponse.json({ error: 'Failed to resolve bioRxiv/medRxiv content' }, { status: 400 });
        }
      } else {
        // Generic URL: fetch and branch on content-type
        const headRes = await fetch(url, { method: 'GET', headers: { 'user-agent': 'ThreadCraft/1.0' } });
        if (!headRes.ok) {
          return NextResponse.json({ error: `Fetch failed: ${headRes.status} ${headRes.statusText}` }, { status: 400 });
        }
        const contentTypeHeader = headRes.headers.get('content-type') || '';
        if (/application\/pdf/i.test(contentTypeHeader) || isDirectPdfUrl(url)) {
          const ab = await headRes.arrayBuffer();
          const b64 = toBase64Capped(ab);
          prompt = buildSummarizePromptFromPdfBase64(b64, url);
        } else {
          const html = await headRes.text();
          let text = extractMainTextFromHtml(html);
          if (!text) {
            return NextResponse.json({ error: 'Unable to extract text from HTML' }, { status: 400 });
          }
          if (text.length > 120_000) {
            text = text.slice(0, 120_000) + '\n\n[TRUNCATED_BEFORE_PROMPT]';
          }
          prompt = buildSummarizePromptFromText(text, url);
        }
      }
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Failed to prepare prompt from provided input' }, { status: 400 });
    }

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

/**
 * Minimal readability-like extraction using heuristics.
 * We avoid bringing a full DOM parser; this is a lightweight fallback.
 * For higher accuracy we can add a proper library later.
 */
function extractMainTextFromHtml(html: string): string {
  try {
    // Drop scripts/styles
    let s = html.replace(/</g, '<').replace(/>/g, '>').replace(/&/g, '&');
    s = s.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    // Remove nav/footer/aside common wrappers
    s = s.replace(/<(nav|aside|footer|header)[\s\S]*?<\/\1>/gi, ' ');
    // Keep paragraphs and headings
    const blocks = Array.from(s.matchAll(/<(h1|h2|h3|p)[^>]*>([\s\S]*?)<\/\1>/gi))
      .map((m) => (m[2] ?? '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      )
      .filter(Boolean);
    const text = blocks.join('\n\n').trim();
    return text.length > 0 ? text : '';
  } catch {
    return '';
  }
}