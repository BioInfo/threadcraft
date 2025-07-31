# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2025-07-31 07:00:47 - Log of updates made will be appended as footnotes to the end of this file.

* Seeded from ThreadCraft_PRD.md (Draft v1.0, 2025-07-31). Product: ThreadCraft. Tagline: "Transform any link into viral social content". Single-page Next.js app that converts any article link into optimized social content for X (Twitter) and LinkedIn, emphasizing platform-tailored generation, professional templates, and no-login simplicity.

## Project Goal

* Provide a frictionless tool to paste a URL and generate high-quality, platform-optimized X threads and LinkedIn posts within seconds, maximizing engagement while preserving professional authority.

## Key Features

* Link input & validation, content extraction (title, body, metadata), source attribution
* AI generation:
  - X Threads: Regular (4 tweets) and Viral (5 tweets), ≤280 chars, numbering, emoji
  - LinkedIn Posts: 1300-1700 chars, professional framework, executive engagement, hashtags
* Customization: Thread type, tone, hashtag suggestions, mention recommendations
* Output & Export: Formatted display, one-click copy, bulk export, per-tweet char counts
* Secondary: Platform previews, mobile optimization, engagement prediction; QA: link verification, fact-check prompts, brand safety

## Overall Architecture

* Next.js 14+ (App Router), TypeScript, Tailwind CSS, Radix UI, React Hook Form
* Server-side content extraction (Cheerio), OpenAI GPT-4 for generation
* Edge functions for speed, intelligent caching, image & bundle optimization
* No database; temporary in-memory processing; privacy-first (no storage, no tracking)
* Deployment on Vercel (recommended), scalability via edge and caching

## Target Audience

* Content marketers, tech professionals, entrepreneurs, social media managers
* Personas include Tech Marketing Manager (professional, data-backed content) and Independent Consultant (consistent, optimized posting)

## Success Metrics

* 80%+ completion rate from link to content
* Content quality adheres to platform best practices
* Performance: content generation in <3s (aspirational), total journey <10-15s MVP
* Qualitative satisfaction via optional feedback

## Technical Requirements (Highlights)

* Content extraction: Open Graph/Twitter Card parsing; robust URL validation
* OpenAI integration: prompts for X thread and LinkedIn post frameworks
* Rate limiting: 10 req/min/IP; cost targets and monitoring
* Performance: Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1); caching 1h

## UX Overview

* Single-page flow: Landing → Input URL → Processing → Options (thread type) → Generation → Review with previews → Export
* Minimalist, responsive, accessible (WCAG 2.1 AA)
* Error handling for invalid URLs, processing failures, API limits

## Algorithms & Templates

* X threads: Regular (Hook, Insights, CTA) and Viral (Controversial Hook, Data, Insight, Personal, CTA)
* LinkedIn: Opening hook, value prop with 3 insights, actionable takeaway, engagement question, hashtag strategy
* Types/interfaces for request/response objects guide implementation

## Launch & Roadmap

* MVP: URL input, basic extraction, regular X thread, LinkedIn post, copy-to-clipboard, responsive UI
* v1.1: Viral threads, more customization, previews, improved errors
* v1.2: Hashtag trends, mentions, scoring, export formats

## Risk & Mitigation

* OpenAI reliability: fallbacks and error handling
* Rate limits: caching and communication
* Quality variance: content filtering, disclaimers
* Extraction failures: multiple methods; performance degradation: edge caching/monitoring

## Conclusion

ThreadCraft focuses on high-quality, platform-optimized social content generation from URLs with a no-friction, single-page architecture that prioritizes performance, privacy, and professional utility.

---
2025-07-31 07:00:47 - Initialized Product Context from ThreadCraft_PRD.md