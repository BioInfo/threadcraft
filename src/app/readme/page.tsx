'use client';

import { Icons } from '../../components/Icons';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export default function ReadmePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
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
              </div>

              <div className="space-y-10">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What is ThreadCraft?</h2>
                  <p className="text-gray-700">
                    ThreadCraft is an AI-powered tool that takes any article or blog post and transforms it into engaging, platform-optimized social media content for X (formerly Twitter) and LinkedIn. It's designed for content creators, marketers, and anyone looking to build their professional brand on social media.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use ThreadCraft</h2>
                  <ol className="list-decimal list-inside space-y-4 text-gray-700">
                    <li>
                      <strong>Enter a URL:</strong> Paste the URL of the article you want to share into the input field on the homepage.
                    </li>
                    <li>
                      <strong>Customize Your Content:</strong> Choose the thread type (Regular or Viral), tone (Professional or Engaging), and industry focus to tailor the generated content to your audience.
                    </li>
                    <li>
                      <strong>Generate Content:</strong> Click the "Generate Social Content" button and let our AI do the work.
                    </li>
                    <li>
                      <strong>Review and Copy:</strong> Review the generated X thread and LinkedIn post, and use the copy buttons to easily share them on your social media accounts.
                    </li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Research Papers (New)</h2>
                  <p className="text-gray-700 mb-3">
                    Analyze academic papers from a PDF URL, arXiv link, or by uploading a PDF. ThreadCraft extracts key signals and summarizes the work into clear, actionable insights.
                  </p>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>Deterministic server-side fetch with provider-adaptive payloads</li>
                    <li>Metadata snapshot (title, authors, venue/year, code/data link)</li>
                    <li>Core contribution, innovations & methodology, significance, limitations, open questions</li>
                    <li>Plain-English summary + export to Markdown/JSON</li>
                    <li>Smart history: recent research queries and popular sources dropdown (focus-activated)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">LLM Configuration</h2>
                  <p className="text-gray-700 mb-3">
                    Configure OpenRouter and choose your preferred model on the Config page. Built-in models include Claude, Gemini, GPT‑4o, Mistral, Grok, Qwen, GLM, DeepSeek, and more.
                  </p>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>One-click connection test to OpenRouter</li>
                    <li>Select from curated “Popular Models”</li>
                    <li><strong>Custom Models:</strong> Paste any OpenRouter Model ID, validate availability, add display name/description, test with a sample prompt (shows latency, tokens, cost), and persist locally with a “Custom” tag</li>
                    <li>Recent update: replaced Maverick with <code>openai/o3-mini-high</code></li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy & Performance</h2>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>No database; temporary in-memory processing</li>
                    <li>Edge-first architecture and intelligent caching</li>
                    <li>Optional rate limiting per IP</li>
                    <li>WCAG 2.1 AA accessibility</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Where to Find It</h2>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>Home (Summary): <code>/</code></li>
                    <li>Configuration: <code>/config</code></li>
                    <li>Research Papers: <code>/research</code></li>
                    <li>This Readme: <code>/readme</code></li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}