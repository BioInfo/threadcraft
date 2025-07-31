'use client';

import { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { CopyButton } from '../components/CopyButton';
import { SuccessToast } from '../components/SuccessToast';
import { SmartUrlInput } from '../components/SmartUrlInput';
import { AccessibilityEnhancer, announceToScreenReader } from '../components/AccessibilityEnhancer';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadType, setThreadType] = useState<'regular' | 'viral'>('regular');
  const [tone, setTone] = useState<'professional' | 'engaging'>('professional');
  const [industry, setIndustry] = useState<
    'general' | 'saas' | 'developer' | 'marketing' | 'ai' | 'product' | 'design' | 'finance' | 'health' | 'education'
  >('general');
  const [result, setResult] = useState<null | {
    thread: string[];
    linkedin: string;
    source: { title: string; siteName?: string; url: string };
    meta?: {
      options: { threadType: string; tone: string; industry: string };
      counts: { x: number[]; linkedin: number };
      model?: string;
    };
    cached?: boolean;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // URL validation with real-time feedback
  useEffect(() => {
    if (!url) {
      setIsUrlValid(false);
      return;
    }
    
    try {
      new URL(url);
      setIsUrlValid(true);
    } catch {
      setIsUrlValid(false);
    }
  }, [url]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Success animation trigger
  useEffect(() => {
    if (result && !loading) {
      setShowSuccess(true);
    }
  }, [result, loading]);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      setLoading(true);
      announceToScreenReader('Generating social content, please wait...');
      
      const openrouterApiKey = localStorage.getItem('openrouter_api_key');
      const openrouterModel = localStorage.getItem('openrouter_model');

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, threadType, tone, industry, openrouterApiKey, openrouterModel })
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Request failed');
      }
      const data = await res.json();
      setResult(data);
      announceToScreenReader('Social content generated successfully! Review your X thread and LinkedIn post below.');
    } catch (err: any) {
      setError(err.message ?? 'Unexpected error');
      announceToScreenReader(`Error: ${err.message ?? 'Unexpected error'}`);
    } finally {
      setLoading(false);
    }
  }

  const getThreadTypeIcon = (type: string) => {
    return type === 'viral' ? <Icons.Zap /> : <Icons.Target />;
  };

  const getToneIcon = (tone: string) => {
    return tone === 'engaging' ? <Icons.TrendingUp /> : <Icons.Target />;
  };

  return (
    <AccessibilityEnhancer>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Success Toast */}
      <SuccessToast 
        show={showSuccess} 
        message="Content generated successfully! 🎉"
        onHide={() => setShowSuccess(false)}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <main id="main-content" className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          
          {/* Header */}
          <header className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icons.Magic />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text">
                ThreadCraft
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform any link into platform-optimized social content that drives engagement and builds your professional presence.
            </p>
          </header>

          {/* Main Form */}
          <div className="max-w-4xl mx-auto animate-slide-up">
            <form onSubmit={onGenerate} className="space-y-8">
              
              {/* URL Input Section */}
              <div className="card-enhanced p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Icons.Link />
                  <h2 className="text-xl font-semibold text-gray-900">Article URL</h2>
                </div>
                
                <SmartUrlInput
                  value={url}
                  onChange={setUrl}
                  onFocus={() => setFocusedInput(true)}
                  onBlur={() => setFocusedInput(false)}
                  isValid={isUrlValid}
                />
                
                {url && !isUrlValid && (
                  <p className="mt-2 text-sm text-red-600 animate-fade-in">
                    Please enter a valid URL starting with http:// or https://
                  </p>
                )}
              </div>

              {/* Customization Options */}
              <div className="card-enhanced p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Icons.Magic />
                  <h2 className="text-xl font-semibold text-gray-900">Customization</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Thread Type */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      {getThreadTypeIcon(threadType)}
                      Thread Type
                    </label>
                    <select
                      value={threadType}
                      onChange={(e) => setThreadType(e.target.value as any)}
                      className="w-full input-enhanced"
                    >
                      <option value="regular">📝 Regular (Professional)</option>
                      <option value="viral">⚡ Viral (High Engagement)</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      {threadType === 'regular' ? 'Structured, professional content' : 'Attention-grabbing, shareable content'}
                    </p>
                  </div>

                  {/* Tone */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      {getToneIcon(tone)}
                      Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value as any)}
                      className="w-full input-enhanced"
                    >
                      <option value="professional">🎯 Professional</option>
                      <option value="engaging">🚀 Engaging</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      {tone === 'professional' ? 'Formal, authoritative voice' : 'Conversational, approachable voice'}
                    </p>
                  </div>

                  {/* Industry */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Icons.Target />
                      Industry Focus
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value as any)}
                      className="w-full input-enhanced"
                    >
                      <option value="general">🌐 General</option>
                      <option value="saas">💻 SaaS</option>
                      <option value="developer">👨‍💻 Developer</option>
                      <option value="marketing">📈 Marketing</option>
                      <option value="ai">🤖 AI</option>
                      <option value="product">📱 Product</option>
                      <option value="design">🎨 Design</option>
                      <option value="finance">💰 Finance</option>
                      <option value="health">🏥 Health</option>
                      <option value="education">📚 Education</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Tailors language and examples to your industry
                    </p>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading || !isUrlValid}
                  className={`btn-primary text-lg px-8 py-4 inline-flex items-center gap-3 ${
                    loading ? 'animate-pulse-subtle' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <Icons.Loader />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Icons.Sparkles />
                      Generate Social Content
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="max-w-4xl mx-auto mt-8 animate-fade-in">
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Generation Failed</h3>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="max-w-4xl mx-auto mt-12">
              <LoadingSkeleton />
            </div>
          )}

          {/* Results Display */}
          {result && !loading && (
            <div className="max-w-4xl mx-auto mt-12 animate-scale-in">
              <div className="grid gap-8">
                
                {/* X Thread Preview */}
                <div className="card-enhanced p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
                        <Icons.Twitter />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">X Thread</h2>
                        <p className="text-sm text-gray-500">
                          {threadType === 'viral' ? 'Viral Format' : 'Regular Format'} • {result.thread.length} tweets
                        </p>
                      </div>
                    </div>
                    <CopyButton text={result.thread.join('\n\n')} />
                  </div>
                  
                  <div className="space-y-4">
                    {result.thread.map((tweet, i) => {
                      const count = tweet.length;
                      const over = count > 280;
                      const near = count >= 260 && count <= 280;
                      return (
                        <div
                          key={i}
                          className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                            over ? 'border-red-300 bg-red-50' : 
                            near ? 'border-amber-300 bg-amber-50' : 
                            'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-gray-500">Tweet {i + 1}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  over ? 'bg-red-100 text-red-700' : 
                                  near ? 'bg-amber-100 text-amber-700' : 
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {count}/280
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap text-gray-900 leading-relaxed">{tweet}</p>
                            </div>
                            <CopyButton text={tweet} variant="minimal" />
                          </div>
                          
                          {/* Character count bar */}
                          <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                over ? 'bg-red-500' : near ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(100, (count / 280) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* LinkedIn Post Preview */}
                <div className="card-enhanced p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <Icons.LinkedIn />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">LinkedIn Post</h2>
                        <p className="text-sm text-gray-500">
                          Professional format • {result.linkedin.length} characters
                        </p>
                      </div>
                    </div>
                    <CopyButton text={result.linkedin} />
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <pre className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                      {result.linkedin}
                    </pre>
                  </div>
                  
                  {/* LinkedIn character count indicator */}
                  <div className="mt-4">
                    {(() => {
                      const count = result.linkedin.length;
                      const min = 1300;
                      const max = 1700;
                      const under = count < min;
                      const over = count > max;
                      const inRange = !under && !over;
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className={`font-medium ${
                              inRange ? 'text-green-700' : over ? 'text-red-700' : 'text-amber-700'
                            }`}>
                              {count} characters {inRange ? '(optimal range)' : over ? '(too long)' : '(too short)'}
                            </span>
                            <span className="text-gray-500">Optimal: 1,300-1,700</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                inRange ? 'bg-green-500' : over ? 'bg-red-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, (count / max) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Source Attribution */}
                <div className="text-center py-6 space-y-3">
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="font-medium">Source:</span>
                      <span>{result.source.title}</span>
                      {result.source.siteName && (
                        <span className="text-gray-400">• {result.source.siteName}</span>
                      )}
                    </div>
                    
                    {result.meta?.model && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full border border-purple-200">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="font-medium text-xs">
                            {result.meta.model.replace('anthropic/', '').replace('openai/', '')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <a
                    href={result.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Original Article
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </AccessibilityEnhancer>
  );
}