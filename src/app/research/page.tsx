'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
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

  const isValidUrl = useMemo(() => {
    if (!url) return false;
    try {
      const u = new URL(url);
      const http = u.protocol === 'http:' || u.protocol === 'https:';
      const looksPdf = /\.pdf(\?|$)/i.test(url);
      const isArxiv = /arxiv\.org\/(abs|pdf)\//i.test(url);
      return http && (looksPdf || isArxiv);
    } catch {
      return false;
    }
  }, [url]);

  const openrouterApiKey = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('openrouter_api_key') || '';
  }, []);

  const openrouterModel = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('openrouter_model') || '';
  }, []);

  const announce = (msg: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = msg;
    }
  };

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <AccessibilityEnhancer>
          <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef} />
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Research Papers Analysis</h1>
            <p className="text-gray-600 mt-1">Analyze academic papers from a PDF URL, arXiv link, or by uploading a PDF. Uses your configured OpenRouter model.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PDF or arXiv URL</label>
                      <input
                        type="url"
                        placeholder="https://arxiv.org/abs/XXXX.XXXXX or a direct PDF URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-invalid={!!url && !isValidUrl}
                        aria-describedby="url-help"
                      />
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
                    <CopyButton text={JSON.stringify(result, null, 2)} />
                    <button
                      onClick={onExportMarkdown}
                      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      Export Markdown
                    </button>
                    <button
                      onClick={onExportJSON}
                      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      Export JSON
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