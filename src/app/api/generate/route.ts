import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GenerateBodySchema, ThreadTypeEnum, ToneEnum, IndustryEnum } from '@/lib/validators';

type Extracted = {
  title: string;
  siteName?: string;
  url: string;
  description?: string;
  text?: string;
};

type ProviderCfg = {
  provider: 'openrouter' | 'openai';
  key?: string;
  model?: string;
};

// Server-side provider configuration via environment variables only
// Configure in .env(.local):
//  LLM_PROVIDER=openrouter|openai
//  OPENROUTER_API_KEY=... (when provider=openrouter)
//  OPENROUTER_MODEL=anthropic/claude-3.7-sonnet
//  OPENAI_API_KEY=...     (when provider=openai)
//  OPENAI_MODEL=gpt-4o-mini
function getProviderCfg(): ProviderCfg | null {
  const providerEnv = (process.env.LLM_PROVIDER || '').toLowerCase();
  if (providerEnv === 'openrouter') {
    return {
      provider: 'openrouter',
      key: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.7-sonnet'
    };
  }
  if (providerEnv === 'openai') {
    return {
      provider: 'openai',
      key: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    };
  }
  // Fallbacks if LLM_PROVIDER not set
  if (process.env.OPENROUTER_API_KEY) {
    return { provider: 'openrouter', key: process.env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.7-sonnet' };
  }
  if (process.env.OPENAI_API_KEY) {
    return { provider: 'openai', key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || 'gpt-4o-mini' };
  }
  return null;
}

// Unified LLM call: supports OpenRouter and OpenAI; returns text content
async function callLLM(_req: NextRequest, prompt: string): Promise<string> {
  const cfg = getProviderCfg();
  if (!cfg || !cfg.key) {
    // Fallback stub content to keep app running without keys
    return `STUB_RESPONSE:
Hook: 1-2 sentence compelling opener 🧵 1/4
Insight 1: Concrete takeaway 🧵 2/4
Insight 2: Concrete takeaway 🧵 3/4
CTA. [URL] @account1 @account2 @account3 #tag1 #tag2 🧵 4/4

LinkedIn:
🚀 A strong opening hook.

💡 Key insight 1 with actionable value
📈 Key insight 2 with practical application
🎯 Key insight 3 with clear takeaway

What's your experience with this topic?

Read the full article: [URL]

#Industry #Growth #Innovation`;
  }

  if (cfg.provider === 'openrouter') {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
        // Optional routing headers
        'HTTP-Referer': 'https://threadcraft.ai',
        'X-Title': 'ThreadCraft'
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: 'system', content: 'You generate concise social content following platform best practices.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`OpenRouter error: ${res.status} ${txt}`);
    }
    const json = await res.json();
    const content: string | undefined = json?.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenRouter returned empty content');
    return content;
  }

  // OpenAI
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: 'system', content: 'You generate concise social content following platform best practices.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`OpenAI error: ${res.status} ${txt}`);
  }
  const json = await res.json();
  const content: string | undefined = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty content');
  return content;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': 'ThreadCraftBot/0.1' } });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.text();
}

function extractFromHtml(url: string, html: string): Extracted {
  const $ = cheerio.load(html);
  const ogTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content');
  const title = ogTitle || $('title').first().text().trim() || 'Untitled';
  const siteName = $('meta[property="og:site_name"]').attr('content') || undefined;
  const desc = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || undefined;

  // crude text fallback
  const paragraphs = $('p')
    .slice(0, 10)
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .join('\n');

  return {
    title,
    siteName,
    url,
    description: desc,
    text: paragraphs
  };
}

function buildPrompt(ex: Extracted, opts: { threadType: typeof ThreadTypeEnum._type; tone: typeof ToneEnum._type; industry: typeof IndustryEnum._type; }): string {
  const { threadType, tone, industry } = opts;

  const threadStyle =
    threadType === 'viral'
      ? 'Viral style: short, punchy, curiosity-driven hooks, strong emotional resonance, occasional emoji allowed, but avoid spammy clickbait.'
      : 'Regular style: informative, clear, numbered tweets with concise value in each. No hashtags inside tweets.';

  const toneInstr =
    tone === 'engaging'
      ? 'Tone: engaging, energetic, accessible. Use simple language.'
      : 'Tone: professional, concise, credible. Avoid slang.';

  const industryContext =
    industry !== 'general'
      ? `Industry context: The audience works in ${industry}. Tailor examples and terminology accordingly.`
      : 'Industry context: General audience; avoid niche jargon.';

  const base = `
Source:
- Title: ${ex.title}
- Site: ${ex.siteName ?? 'Unknown'}
- URL: ${ex.url}
- Description: ${ex.description ?? 'n/a'}
- Excerpt:
${(ex.text ?? '').slice(0, 1200)}

Guidelines:
- ${threadStyle}
- ${toneInstr}
- ${industryContext}

Tasks:
1) Create an X thread of up to 4 tweets. Each tweet MUST BE ≤ 280 chars (CRITICAL), strong hook, concrete insights, and END each tweet with the thread emoji and count (🧵 1/4, 🧵 2/4, 🧵 3/4, 🧵 4/4). The FINAL tweet (4/4) must include: the original article link, 3 highly relevant well-known accounts to tag (research based on article topic and industry), and 2-3 relevant hashtags. Keep content concise to fit character limits.
2) Create a LinkedIn post 1300–1700 chars, ${tone} tone, using PLAIN TEXT ONLY (no markdown formatting), professional emojis for visual appeal, 3 actionable insights, include the original source URL, closing CTA, and 3-5 relevant hashtags at the end.

Return JSON ONLY with keys:
{
  "thread": ["tweet1", "tweet2", "tweet3", "tweet4"],
  "linkedin": "full post text"
}
`.trim();

  return base;
}

function parseAIJson(text: string): { thread: string[]; linkedin: string } {
  // Try to find JSON block
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    // Fallback minimal
    return {
      thread: [
        'Hook about the article. Key insight. 🧵 1/4',
        'Insight #1 with value. 🧵 2/4',
        'Insight #2 with value. 🧵 3/4',
        'CTA. [URL] @account1 @account2 @account3 #tag1 #tag2 🧵 4/4'
      ],
      linkedin:
        '🚀 Hook about the article.\n\n💡 Insight 1 with actionable value\n📈 Insight 2 with practical application\n🎯 Insight 3 with clear takeaway\n\nWhat are your thoughts on this?\n\nRead the full article: [URL]\n\n#marketing #content #growth'
    };
  }
  try {
    const obj = JSON.parse(match[0]);
    if (!Array.isArray(obj.thread) || typeof obj.linkedin !== 'string') {
      throw new Error('Invalid keys');
    }
    return { thread: obj.thread.slice(0, 5), linkedin: obj.linkedin };
  } catch {
    return {
      thread: [
        'Hook about the article. Key insight. 🧵 1/4',
        'Insight #1 with value. 🧵 2/4',
        'Insight #2 with value. 🧵 3/4',
        'CTA. [URL] @account1 @account2 @account3 #tag1 #tag2 🧵 4/4'
      ],
      linkedin:
        '🚀 Hook about the article.\n\n💡 Insight 1 with actionable value\n📈 Insight 2 with practical application\n🎯 Insight 3 with clear takeaway\n\nWhat are your thoughts on this?\n\nRead the full article: [URL]\n\n#marketing #content #growth'
    };
  }
}

/**
 * In-memory 1-hour cache keyed by URL + options.
 * Note: Vercel serverless may cold start and drop memory between invocations; acceptable as best-effort cache.
 */
const cache = new Map<string, { at: number; value: any }>;
const ONE_HOUR = 60 * 60 * 1000;

/**
 * Basic per-IP rate limiting: 20 requests per 10 minutes per IP.
 * For production, replace with Upstash/Redis or Vercel Rate Limit.
 */
const rlBucket = new Map<string, { count: number; windowStart: number }>;
const RL_WINDOW = 10 * 60 * 1000;
const RL_LIMIT = 20;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    (req as any).ip ||
    'unknown'
  );
}

function checkRateLimit(req: NextRequest): { ok: true } | { ok: false; resetIn: number } {
  const ip = getClientIp(req);
  const now = Date.now();
  const state = rlBucket.get(ip);
  if (!state) {
    rlBucket.set(ip, { count: 1, windowStart: now });
    return { ok: true };
  }
  if (now - state.windowStart > RL_WINDOW) {
    rlBucket.set(ip, { count: 1, windowStart: now });
    return { ok: true };
  }
  if (state.count >= RL_LIMIT) {
    const resetIn = RL_WINDOW - (now - state.windowStart);
    return { ok: false, resetIn };
  }
  state.count += 1;
  return { ok: true };
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const rl = checkRateLimit(req);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${Math.ceil(rl.resetIn / 1000)}s.` },
        { status: 429 }
      );
    }

    // Validate request body with Zod, provide friendly errors
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }
    const parsed = GenerateBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues
        .map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
        .join('; ');
      return NextResponse.json({ error: `Invalid request: ${msg}` }, { status: 400 });
    }

    const { url, threadType, tone, industry } = parsed.data;

    // Cache key: url + options
    const key = JSON.stringify({ url, threadType, tone, industry });
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && now - cached.at < ONE_HOUR) {
      return NextResponse.json({ ...cached.value, cached: true });
    }

    const html = await fetchHtml(url);
    const extracted = extractFromHtml(url, html);

    const prompt = buildPrompt(extracted, { threadType, tone, industry });
    const ai = await callLLM(req, prompt);
    const { thread, linkedin } = parseAIJson(ai);

    const cfg = getProviderCfg();
    const payload = {
      thread,
      linkedin,
      source: { title: extracted.title, siteName: extracted.siteName, url: extracted.url },
      meta: {
        options: { threadType, tone, industry },
        counts: {
          x: thread.map((t) => t.length),
          linkedin: linkedin.length
        },
        model: cfg?.model || 'Unknown'
      }
    };

    cache.set(key, { at: now, value: payload });

    return NextResponse.json(payload);
  } catch (err: any) {
    // Normalize errors for user-friendly messages
    const msg =
      typeof err?.message === 'string'
        ? err.message
        : 'Unexpected server error.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}