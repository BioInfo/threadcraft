# Incremental, Low-Complexity Enhancements Roadmap

Last updated: 2025-07-31

Purpose
A set of scoped, low-cognitive-load improvements you can add in small sprints. Each item is self-contained, deploys cleanly to Vercel, and emphasizes clarity, consistency, and minimal steps.

Guiding Principles
- Low friction: minimal clicks, smart defaults, quick edits
- Progressive disclosure: hide advanced options until needed
- Consistency: same patterns across pages (labels, buttons, toasts)
- Accessibility: keyboardable, visible focus, ARIA live regions
- Observability: measure time-to-preview, edits-per-output

Sprint A — UX Polish (Fast Wins)
1) Theme Switcher (Light/Dark/System)
   - UI: Toggle in header (Sun/Moon icon), respects prefers-color-scheme
   - Storage: Persist in localStorage, fallback to system on first load
   - Files: src/app/globals.css, src/components/Header.tsx
   - Metrics: % of users toggling, persist correctness

2) Keyboard Shortcuts
   - Cmd/Ctrl+Enter: Generate
   - Esc: Clear
   - Cmd/Ctrl+K: Focus input
   - Metrics: Shortcut usage rate, time-to-preview delta

3) Toasts and Inline Feedback
   - Success on generate; error toast on failure with “Try again”
   - Inline character counters and validation near inputs
   - Metrics: Error rate, retry rate

4) Metadata & Social Cards
   - Proper generateMetadata with OG/Twitter images for /, /config, /readme
   - Platform-friendly share previews
   - Metrics: Click-through rate from shared links

Sprint B — Utility (Local-Only, No Backend)
5) History Sidebar
   - Store last 5 runs: title, timestamp, flavor preset, summary mode
   - One-click “Re-run” and “Copy”
   - Metrics: Re-run rate, edits-per-output for reruns vs fresh

6) Shareable Permalinks
   - Encode current state into URL (q=..., flavor=..., mode=...)
   - “Share” copies permalink; on load, prefill state
   - Metrics: Share clicks, open-from-permalink rate

7) Export Results
   - Download current output as .md or .json
   - Optional: CSV for multi-part content (tweet-per-line, slide-per-row)
   - Metrics: Export usage, post-publication confirmation via optional prompt

Sprint C — Reliability & Safety
8) Rate Limit (Soft)
   - Minimal per-IP rate limit for /api/generate
   - Back-off message with time left
   - Metrics: Rate-limited requests, retries

9) Error Boundary
   - Wrap main content to prevent blank screens
   - Friendly recovery UI with “Copy error details”
   - Metrics: Boundary triggers, recoveries

10) Env Validation
   - zod validate required envs at server start
   - UI nudge if missing in prod (no secrets displayed)
   - Metrics: Boot failures due to env, time-to-fix

Sprint D — “Wow” But Simple Toggles
11) Streaming Output Mode
   - Toggle: “Stream as generated”
   - Render tokens incrementally; “Copy final” consolidates
   - Metrics: Time-to-first-token, abandonment rate

12) Command Palette
   - Modal with fuzzy search: Run, Clear, Copy, Toggle Theme, Export
   - Shortcut: Cmd/Ctrl+K (rebind input focus to Cmd/Ctrl+L)
   - Metrics: Palette usage, action time reductions

13) Vercel Web Analytics
   - Enable zero-config analytics
   - Track: time-to-preview, edits count, abandonments

Sprint E — Content Craft Enhancements
14) Preset Library (Local JSON)
   - 10 high-quality reusable prompts & flavor combos
   - Chips to apply instantly; one-click “More like this”
   - Metrics: Preset usage, edit reduction

15) Micro-Animations
   - Button hover/press; respects prefers-reduced-motion
   - Keep subtle; avoid cognitive noise
   - Metrics: None required; visual QA

16) Progress Indicator
   - Thin top bar (NProgress-like) for fetch lifecycle
   - Optional step dots later
   - Metrics: Perceived latency feedback via survey or proxy on abandon rate

Accessibility and Internationalization Checklist
- Keyboard navigation for all controls
- Visible focus outlines, sufficient contrast
- ARIA live regions for character counters, streaming updates
- Locale-aware punctuation/spaces; en-US/en-UK spellings
- RTL support where relevant; avoid idioms in Analytical tone

Naming & Consistency
- Toggle labels: “Speed vs Quality”, “Stream output”
- Presets: match Content Flavors naming (Twitter: Expert Insight, Quick Wins, Narrative Build, Teaching Thread; LinkedIn: Quick Insight, Case Study, Narrative Reflection, Hiring Signal)
- Summary modes: Short, Skimmable, Expert, Conversational
- Controls grouping: Preset, Tone, Depth; Advanced hidden behind single toggle

Validation Metrics (Low Cognitive Overhead)
- Time-to-first-preview: < 10–12s
- Edits-per-output: < 3
- Abandonment (generate → preview): < 10–12%
- Shares and Exports per session: ↑
- Rerun usage for History: ↑
- Analytics spans: Vercel Analytics custom events (generate_start, generate_preview, export_md, share_link, rerun_history)

Implementation Tips
- Keep defaults sticky (remember last preset/tone)
- Collapse advanced options; limit visible choices to 3–4
- Use controlled components with clear labels and helper text
- Centralize toast and loading state handlers
- Prefer localStorage for simple state continuity; do not store secrets