'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { AccessibilityEnhancer } from '../../components/AccessibilityEnhancer';
import { CopyButton } from '../../components/CopyButton';

type AnalysisResult = {
  metadata: {
    title: string;
    authors: string[];
    venue_year: string;
    link: string;
    code_or_data: string;
  };
  core_contribution: string;
  innovations_methodology: string[];
  significance: {
    classification: 'Fundamental Advance' | 'Significant Increment' | 'Niche Contribution' | string;
    justification: string;
  };
  limitations: string[];
  open_questions: string[];
  plain_english_summary: string;
};

const defaultResult: AnalysisResult = {
  metadata: { title: '', authors: [], venue_year: '', link: '', code_or_data: '' },
  core_contribution: '',
  innovations_methodology: [],
  significance: { classification: '', justification: '' },
  limitations: [],
  open_questions: [],
  plain_english_summary: '',
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function ResearchPage() {
  const [tab, setTab] = useState<'url' | 'upload'>('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Research query history (mirrors SmartUrlInput UX patterns)
  const LOCAL_RESEARCH_HISTORY_KEY = 'research_recent_queries';
  const MAX_HISTORY = 10;
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const POPULAR_SOURCES: { label: string; value: string }[] = [
    { label: 'arXiv', value: 'https://arxiv.org/abs/2407.12345' },
    { label: 'bioRxiv', value: 'https://www.biorxiv.org/content/10.1101/2024.01.01.123456v1' },
    { label: 'SSRN', value: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1234567' },
    { label: 'HAL', value: 'https://hal.science/hal-01234567' },
    { label: 'ResearchSquare', value: 'https://www.researchsquare.com/article/rs-123456/v1' },
    { label: 'Direct PDF', value: 'https://example.com/paper.pdf' },
  ];

  // Accept:
  // - Direct PDFs (.pdf)
  // - arXiv abs/pdf
  // - Common preprint servers: bioRxiv, medRxiv, chemRxiv, psyArXiv, SocArXiv, OSF Preprints, HAL, SSRN, ResearchSquare
  // Expand as needed by adding hostname patterns below.
  const isValidUrl = useMemo(() => {
    if (!url) return false;
    try {
      const u = new URL(url);
      const http = u.protocol === 'http:' || u.protocol === 'https:';
      if (!http) return false;

      const href = u.href;

      // 1) Direct PDF
      const looksPdf = /\.pdf(\?|#|$)/i.test(href);
      if (looksPdf) return true;

      // 2) arXiv abs/pdf pages
      const isArxiv = /(^|\.)arxiv\.org\/(abs|pdf)\//i.test(u.host + u.pathname);
      if (isArxiv) return true;

      // 3) Popular preprint archives (abs/content pages we can resolve server-side)
      const preprintHosts = [
        /(^|\.)biorxiv\.org$/i,
        /(^|\.)medrxiv\.org$/i,
        /(^|\.)chemrxiv\.org$/i,
        /(^|\.)psyarxiv\.com$/i,
        /(^|\.)socarxiv\.org$/i,
        /(^|\.)osf\.io$/i,           // OSF preprints
        /(^|\.)hal\.sciencespo\.fr$/i,
        /(^|\.)hal\.archives-ouvertes\.fr$/i,
        /(^|\.)ssrn\.com$/i,
        /(^|\.)researchsquare\.com$/i
      ];
      const isKnownPreprint = preprintHosts.some((re) => re.test(u.host));
      if (isKnownPreprint) return true;

      return false;
    } catch {
      return false;
    }
  }, [url]);

  // Avoid server/client mismatch: defer localStorage reads to client after mount
  const [hydrated, setHydrated] = useState(false);
  const [openrouterApiKey, setOpenrouterApiKey] = useState('');
  const [openrouterModel, setOpenrouterModel] = useState('');

  useEffect(() => {
    setHydrated(true);
    try {
      const k = localStorage.getItem('openrouter_api_key') || '';
      const m = localStorage.getItem('openrouter_model') || '';
      setOpenrouterApiKey(k);
      setOpenrouterModel(m);
      const raw = localStorage.getItem(LOCAL_RESEARCH_HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecentQueries(parsed.filter((s) => typeof s === 'string'));
        }
      }
    } catch {
      // no-op
    }
  }, []);

  // persist history when it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_RESEARCH_HISTORY_KEY, JSON.stringify(recentQueries.slice(0, MAX_HISTORY)));
    } catch {
      // ignore
    }
  }, [recentQueries]);

  const announce = (msg: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = msg;
    }
  };

  const pushToHistory = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecentQueries((prev) => {
      const without = prev.filter((x) => x !== trimmed);
      return [trimmed, ...without].slice(0, MAX_HISTORY);
    });
  }, []);

  const onAnalyze = useCallback(async () => {
    setError(null);
    setResult(null);

    if (!openrouterApiKey || !openrouterModel) {
      setError('Missing OpenRouter key/model. Configure under the Config tab.');
      return;
    }

    try {
      setLoading(true);
      announce('Analysis started');
      let res: Response;

      if (tab === 'url') {
        if (!isValidUrl) {
          setError('Enter a valid PDF or arXiv URL.');
          setLoading(false);
          return;
        }
        res = await fetch('/api/research/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, openrouterApiKey, openrouterModel }),
        });
      } else {
        if (!file) {
          setError('Please select a PDF to upload.');
          setLoading(false);
          return;
        }
        const form = new FormData();
        form.append('file', file);
        form.append('openrouterApiKey', openrouterApiKey);
        form.append('openrouterModel', openrouterModel);
        if (url) form.append('url', url);
        res = await fetch('/api/research/analyze', {
          method: 'POST',
          body: form,
        });
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any));
        throw new Error(j?.error || `Request failed (${res.status})`);
      }

      const json = (await res.json()) as AnalysisResult;
      setResult(json);
      if (tab === 'url') pushToHistory(url);
      announce('Analysis completed');
    } catch (e: any) {
      setError(e?.message || 'Failed to analyze paper');
      announce('Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [tab, url, file, isValidUrl, openrouterApiKey, openrouterModel]);

  const onExportMarkdown = useCallback(() => {
    if (!result) return;
    const mdLines: string[] = [];
    mdLines.push(`# Research Analysis`);
    mdLines.push('');
    mdLines.push(`## Metadata Snapshot`);
    mdLines.push(`- Title: ${result.metadata.title}`);
    mdLines.push(`- Authors: ${result.metadata.authors.join(', ')}`);
    mdLines.push(`- Venue/Year: ${result.metadata.venue_year}`);
    mdLines.push(`- Link: ${result.metadata.link}`);
    mdLines.push(`- Code/Data: ${result.metadata.code_or_data}`);
    mdLines.push('');
    mdLines.push(`## Core Contribution`);
    mdLines.push(result.core_contribution || '');
    mdLines.push('');
    mdLines.push(`## Key Innovations & Methodology`);
    (result.innovations_methodology || []).forEach((b) => mdLines.push(`- ${b}`));
    mdLines.push('');
    mdLines.push(`## Significance & Impact`);
    mdLines.push(`- Classification: ${result.significance.classification}`);
    mdLines.push(`- Justification: ${result.significance.justification}`);
    mdLines.push('');
    mdLines.push(`## Weaknesses & Limitations`);
    (result.limitations || []).forEach((b) => mdLines.push(`- ${b}`));
    mdLines.push('');
    mdLines.push(`## Open Questions & Future Directions`);
    (result.open_questions || []).forEach((b) => mdLines.push(`- ${b}`));
    mdLines.push('');
    mdLines.push(`## Plain-English Summary`);
    mdLines.push(result.plain_english_summary || '');
    const blob = new Blob([mdLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'research-analysis.md';
    a.click();
  }, [result]);

  const onExportJSON = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'research-analysis.json';
    a.click();
  }, [result]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header />
      <main className="flex-1">
        <AccessibilityEnhancer>
          <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef} />
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Research Papers Analysis</h1>
              <p className="text-gray-600 mt-1">Analyze academic papers from a PDF URL, arXiv link, or by uploading a PDF. Uses your configured OpenRouter model.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                    <button
                      className={`text-sm font-medium px-3 py-1.5 rounded ${tab === 'url' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => setTab('url')}
                      aria-pressed={tab === 'url'}
                    >
                      From URL
                    </button>
                    <button
                      className={`text-sm font-medium px-3 py-1.5 rounded ${tab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => setTab('upload')}
                      aria-pressed={tab === 'upload'}
                    >
                      Upload PDF
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {tab === 'url' ? (
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">PDF or arXiv URL</label>
                        <input
                          type="url"
                          placeholder="https://arxiv.org/abs/XXXX.XXXXX or a direct PDF URL"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-invalid={!!url && !isValidUrl}
                          aria-describedby="url-help"
                          onFocus={() => setDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setDropdownOpen(false), 100)}
                        />
                        {/* Dropdown panel: Popular + Recent (only when focused) */}
                        {dropdownOpen && (
                          <div className="absolute left-0 right-0 z-20 mt-2 rounded-md border border-gray-200 bg-white shadow-xl max-h-80 overflow-y-auto mb-3">
                            <div className="p-3">
                              <div className="text-xs font-semibold text-gray-500 mb-2">Popular Sources</div>
                              <div className="grid grid-cols-3 gap-2">
                                {POPULAR_SOURCES.map((item) => (
                                  <button
                                    key={item.label}
                                    type="button"
                                    className="text-left text-xs rounded border border-gray-200 px-2 py-2 hover:bg-gray-50"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setUrl(item.value)}
                                  >
                                    <div className="font-medium text-gray-800">{item.label}</div>
                                    <div className="text-gray-500 truncate">{item.value}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="px-3 pb-3">
                              <div className="text-xs font-semibold text-gray-500 mb-2">Recent</div>
                              <ul className="space-y-1">
                                {recentQueries.length ? (
                                  recentQueries.map((q, idx) => (
                                    <li key={idx}>
                                      <button
                                        type="button"
                                        className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-gray-50 truncate"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setUrl(q)}
                                        title={q}
                                      >
                                        {q}
                                      </button>
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-xs text-gray-400 px-2 py-1.5">No recent queries</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        )}
                        <p id="url-help" className="text-xs text-gray-500 mt-1">
                          Must be an http/https link and either an arXiv page or a .pdf URL.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                          className="w-full text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Max 20MB. For uploads, you can optionally provide a source URL in the field above (used only for metadata link).</p>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Optional Source URL</label>
                          <input
                            type="url"
                            placeholder="https://arxiv.org/abs/XXXX.XXXXX or original paper URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={onAnalyze}
                        disabled={loading || (tab === 'url' ? !isValidUrl : !file)}
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}
                        aria-busy={loading}
                      >
                        {loading ? (
                          <>
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Analyzing...
                          </>
                        ) : (
                          <>Analyze</>
                        )}
                      </button>
                      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    </div>
                  </div>
                </div>

              {result && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <button
                      onClick={onExportMarkdown}
                      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      Export Markdown
                    </button>
                  </div>

                  <SectionCard title="Metadata Snapshot">
                    <div className="text-sm text-gray-800 space-y-1">
                      <div><span className="font-medium">Title:</span> {result.metadata.title || '—'}</div>
                      <div><span className="font-medium">Authors:</span> {result.metadata.authors?.length ? result.metadata.authors.join(', ') : '—'}</div>
                      <div><span className="font-medium">Venue/Year:</span> {result.metadata.venue_year || '—'}</div>
                      <div><span className="font-medium">Link:</span> {result.metadata.link ? <a className="text-blue-600 underline" href={result.metadata.link} target="_blank" rel="noreferrer">{result.metadata.link}</a> : '—'}</div>
                      <div><span className="font-medium">Code/Data:</span> {result.metadata.code_or_data || '—'}</div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Core Contribution">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{result.core_contribution || '—'}</p>
                  </SectionCard>

                  <SectionCard title="Key Innovations & Methodology">
                    <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                      {(result.innovations_methodology || []).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                      {!result.innovations_methodology?.length && <li className="list-none text-gray-500">—</li>}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Significance & Impact">
                    <div className="text-sm text-gray-800 space-y-1">
                      <div><span className="font-medium">Classification:</span> {result.significance.classification || '—'}</div>
                      <div><span className="font-medium">Justification:</span> <span className="whitespace-pre-wrap">{result.significance.justification || '—'}</span></div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Weaknesses & Limitations">
                    <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                      {(result.limitations || []).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                      {!result.limitations?.length && <li className="list-none text-gray-500">—</li>}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Open Questions & Future Directions">
                    <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                      {(result.open_questions || []).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                      {!result.open_questions?.length && <li className="list-none text-gray-500">—</li>}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Plain-English Summary">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{result.plain_english_summary || '—'}</p>
                  </SectionCard>
                </div>
              )}
            </div>

            <div className="md:col-span-1 space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-800">Model & Connection</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div><span className="font-medium">Model:</span> {openrouterModel || <span className="text-gray-500">not set</span>}</div>
                  <div>
                    <span className="font-medium">API Key:</span>{' '}
                    {openrouterApiKey ? (
                      <span className="text-green-700">configured</span>
                    ) : (
                      <span className="text-red-600">missing (configure under Config)</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    This page reuses your OpenRouter settings from the Config page (stored locally).
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-800">Tips</h3>
                </div>
                <div className="p-4 text-sm text-gray-700 space-y-2">
                  <p>Use arXiv links or direct PDF URLs for best results. Large PDFs may be truncated by the server with a notice.</p>
                  <p>Each section supports copying and export to Markdown or JSON.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        </AccessibilityEnhancer>
      </main>
      <Footer />
    </div>
  );
}