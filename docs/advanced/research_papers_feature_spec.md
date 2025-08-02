# Research Papers Feature — Product & Technical Specification

Last updated: 2025-08-02
Author: ThreadCraft Team

Objective
Add a new “Research” page that ingests PDF links or uploads, analyzes the paper via our configured OpenRouter LLM, and renders a high-quality, seven-section expert report. The output must follow the user’s rubric content-wise while matching ThreadCraft’s UI/UX.

User Story
As a user, I want to input a research paper (URL to PDF, arXiv link, or upload a PDF) and get a rigorous, structured analysis with seven sections:
1) Metadata Snapshot
2) Core Contribution (1–2 sentences)
3) Key Innovations & Methodology (≤4 bullets)
4) Significance & Impact Assessment (classification + justification)
5) Weaknesses & Limitations (≤4 bullets)
6) Open Questions & Future Directions (≤3 bullets)
7) Plain-English Summary (≤150 words)

Key Requirements
- New route: /research
- Add “Research” link to Header nav only
- Use same OpenRouter config (API key + model) as saved via /config
- Accept: URL (PDF/arXiv) or file upload (PDF)
- Server extracts text and prompts the model using the rubric; returns structured JSON
- Beautiful, accessible UI/UX consistent with ThreadCraft
- Optional: Save recent analyses in localStorage

Information Architecture
- /research
  - Hero: concise intro + icon
  - Ingest Panel:
    - Tabs: “From URL” | “Upload PDF”
    - URL validation (http/https; arXiv pattern)
    - File input (accept application/pdf)
    - Analyze button (disabled until valid)
  - Model Summary:
    - Read-only summary of selected model from localStorage
    - Connection status hint if key missing
  - Results Panel:
    - Accordion of the 7 sections
    - Copy buttons per section
    - Export to Markdown/JSON
  - History (optional):
    - List of recent analyses (title/venue/year/timestamp)

Prompt (System + User)
System:
You are an expert AI researcher and critical analyst. Be pragmatic, incisive, and objective. Ground all claims in specific evidence (“as shown in Table 3,” “page 5,” etc.). Use only the provided paper text. If incomplete, state limitations explicitly.

User:
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
{{PAPER_TEXT}}
---

Backend Design
- API route: src/app/api/research/analyze/route.ts
  - Input: { url?: string; openrouterApiKey?: string; openrouterModel?: string } OR multipart/form-data with file
  - Fetch strategy for URL:
    - If arXiv: resolve to PDF link or fetch HTML and extract text
    - If PDF: fetch and parse
  - Upload strategy:
    - Parse multipart PDF, extract text
  - Text extraction:
    - Use a Node PDF parser (e.g., pdf-parse or pdfjs-dist server-side)
  - Chunking:
    - If too long, chunk and synthesize or truncate with a noted limitation
  - LLM call:
    - Use OpenRouter with provided model + key
    - Return structured JSON

Frontend Design
- Page: src/app/research/page.tsx (client)
  - Tabs for URL/Upload
  - Uses AccessibilityEnhancer announcements
  - Reads model/key from localStorage
  - POST to /api/research/analyze
  - Show loading, errors, and results
  - Render 7 sections in elegant accordion cards with Copy and Export buttons
  - Optional: Save/retrieve local history

Validation & Edge Cases
- Missing key/model → call-to-config
- Invalid URL / fetch failure → error state
- Very large PDFs → chunk/truncate with notice
- Non-PDF uploads rejected

Security
- Enforce MIME checks and size limits (e.g., 20MB)
- Sanitize file names; no server persistence of files
- Strip scripts from fetched HTML when applicable

Acceptance Criteria
- /research renders and functions on mobile/desktop
- Header has “Research” link (Footer unchanged)
- JSON output faithfully reflects rubric; UI looks consistent with ThreadCraft
- Uses configured OpenRouter settings
- Works with arXiv links, PDF URLs, and PDF uploads

Rollout Plan
1) Implement API route and PDF parsing
2) Build /research UI
3) Wire up model/key and endpoint
4) QA and polish UX
5) Open PR and merge

Open Questions
- Expand beyond arXiv/PDF to general HTML? (Default: later)
- Add citation extraction? (Default: not required MVP)