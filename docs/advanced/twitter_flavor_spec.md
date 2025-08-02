# Twitter (X) Content Flavor Spec

Last updated: 2025-07-31

Purpose
Make it effortless to generate high-signal Twitter content with minimal decisions, optimized for platform norms, while enabling quick, intuitive customizations in under 3 actions.

Personas
1) Expert Builder
   - Goal: Share insights, engage peers, attract collaborators.
   - Style: Concise, technical, proof-oriented.
2) Operator/PM
   - Goal: Communicate learnings, narratives, and frameworks.
   - Style: Skimmable, pragmatic, visual hooks.
3) Creator/Educator
   - Goal: Teach and grow audience.
   - Style: Clear, structured, call-to-engagement.

Platform Goals and Constraints
- Primary goals: Engagement (likes, replies, bookmarks), reach (retweets), conversations.
- Character constraints: ~280 characters per tweet (hard limit), threads recommended 3–8 tweets for retention, 1 hook + 5 core points + 1 CTA is a reliable baseline.
- Link handling: External links can reduce distribution; prefer thread-first content, add links in final tweet if necessary.
- Hashtags: 0–2 max; use only highly relevant tags.
- Mentions: Use sparingly and intentionally; avoid spammy chains.
- Visuals: Optional but powerful; images or simple diagrams improve retention.
- Tone: Conversational, concise, no fluff. Avoid generic motivational filler.

Flavor Presets (Platform-Specific)
Presets limit choices and provide adaptive defaults. Each preset supports “Short” (single tweet), “Thread (5)”, “Thread (8)”.

1) Expert Insight
   - Tone: Clear, authoritative, non-salesy.
   - Structure (Thread 5):
     1. Hook: Counter-intuitive or data-backed claim.
     2–4. Core insights or steps (each with 1 concrete example).
     5. CTA: “Want details? Reply ‘guide’” or “Code link in final tweet”.
   - Interaction: Invite replies with a specific keyword or question.
   - Hashtags: 0–1 (domain keyword).
   - Best for: Technical learnings, frameworks, experiments.

2) Quick Wins
   - Tone: Practical, energetic, direct.
   - Structure (Thread 5):
     1. Hook: “If you do X, do this instead…”
     2–4. Steps or before/after examples.
     5. CTA: “Bookmark for later” or “Reply ‘checklist’”.
   - Hashtags: 0–2 short tags.
   - Best for: Tactics, shortcuts, playbooks.

3) Narrative Build
   - Tone: Story-driven, reflective but crisp.
   - Structure (Thread 5):
     1. Hook: Moment of tension or “mistake to learning” teaser.
     2–3. Conflict and choice.
     4. Outcome (metric or specific result).
     5. CTA: “Curious what you’d do differently?”
   - Hashtags: 0–1.
   - Best for: Project retros, founder updates, product reveals.

4) Teaching Thread
   - Tone: Patient, explanatory, friendly expert.
   - Structure (Thread 8):
     1. Hook: “You’re doing X wrong. Here’s the 80/20 fix.”
     2–7. Steps with 1-liners + examples.
     8. CTA: “Want a printable version? Reply ‘pdf’”.
   - Hashtags: 0–1.
   - Best for: Tutorials and conceptual explainers.

Summary Modes
- Short: Single tweet, ≤ 240 chars target (headroom for edits). Use when content is atomic or time-sensitive.
- Skimmable: Thread with numbered bullets, 5 tweets default. Use for lists/frameworks.
- Expert: Thread focusing on evidence and metrics; defaults to Expert Insight preset.
- Conversational: Thread with rhetorical questions and approachable tone; defaults to Teaching Thread.

Model/Engine Selection Guidance
- Speed: gpt-4o-mini / claude-haiku / small-fast model (fast draft, good for single tweet or quick threads).
- Quality: gpt-4o / claude-sonnet / o3-mini (higher coherence and voice consistency; use for Expert/Narrative threads).
- Default rule:
  - If Short mode: Speed
  - If Thread ≥ 6 tweets or Expert/Narrative: Quality
  - User can override in one click via “Speed vs Quality” toggle.

Customization Controls (Intuitive, Minimal)
- Thread Type: Radio buttons with 4 presets: Expert Insight, Quick Wins, Narrative Build, Teaching Thread.
- Tone Slider: Analytical — Balanced — Conversational (3 stops).
- Depth Toggle: Short / Thread (5) / Thread (8).
- Audience Selector: Builders, PMs/Operators, General.
- Advanced (Progressive Disclosure): Toggle to reveal hashtags (0–2), mentions (autocomplete), link at end (on/off), image suggestion (on/off).

Adaptive Defaults
- Remember last used preset and tone.
- Detect content type from input (e.g., code snippet → Expert Insight; step list → Teaching).
- Auto-set depth:
  - ≤ 500 chars input → Short
  - 500–1500 → Thread (5)
  - > 1500 → Thread (8)
- Auto-suggest CTA based on preset (reply keyword, bookmark, retweet ask).

Guardrails for Simplicity
- Always preselect one preset and one depth.
- Disable hashtags by default; suggest only if topical keywords present.
- Limit choices on first screen (presets, tone, depth). Advanced options hidden until toggled.
- Keep threads ≤ 8 by default.

UX Flows (Under 3 Actions)
Generate
1) Paste content or click a preset template.
2) Press Generate (defaults applied).
3) Land on preview with CTA and metadata ready.

Preview and Light Edit
1) Review formatted preview with character counter per tweet.
2) One-click edits: “Shorten by 10%”, “More concise”, “More conversational”.
3) Copy all / Post via share intent.

Minimal-Edit Workflow Examples
- Example 1 (Expert Insight, Thread 5):
  - Hook: “Your eval data is lying. Here’s why your win rate drops in prod:”
  - 2–4: Points with concrete examples (metrics drift, prompt mismatch, latency budgets).
  - 5: “Want the checklist? Reply ‘eval’.”
- Example 2 (Quick Wins, Short):
  - “Stop using 7 KPIs. Track 3: lead time, failure rate, recovery time. Everything else is commentary.”

CTA Patterns
- Reply with keyword (“guide”, “pdf”, “checklist”)
- Bookmark/Retweet ask (“Bookmark this for later”)
- Question for replies (“What’s your #1 mistake here?”)

Hashtags/Mentions
- Use 0–2 hashtags max; prefer none if niche topic.
- Mention only when truly relevant; avoid list mentions.

Naming Conventions
- Presets: Expert Insight, Quick Wins, Narrative Build, Teaching Thread
- Modes: Short, Skimmable, Expert, Conversational
- Toggle: Speed vs Quality

Rubric for Auto-Suggestions
- If input contains numbered steps → Teaching Thread (Thread 8)
- If input contains metrics or experiment → Expert Insight (Thread 5)
- If input is anecdotal → Narrative Build (Thread 5)
- If input < 300 chars → Short
- If user previously chose “Conversational” twice → default Tone to Conversational

Metrics for Low Cognitive Overhead
- Time-to-first-preview < 10s
- Edits-per-thread < 3
- Abandonment rate from generate → preview < 10%
- Threads published per session ↑
- Replies/bookmarks ratio ↑

Accessibility and i18n
- Clear color-contrast and focus states.
- Character counters with ARIA live region for overflow warnings.
- Locale-aware punctuation and spacing rules.
- RTL support for relevant languages.
- Avoid idioms when Tone = Analytical; enable en-US/en-UK variants for spelling.

Concrete Tweet Examples

Example A — Expert Insight (Thread 5)
1/ You can “improve accuracy” and still ship a worse model. Here’s the trap:
2/ Your eval set doesn’t match reality. Prod has noisy inputs, time pressure, and partial context.
3/ Fix: sample prod data weekly, label small but fresh slices, track drift explicitly.
4/ Measure cost-to-correct, not just accuracy. Latency budgets matter more than you think.
5/ Want the eval checklist? Reply “eval”.

Example B — Quick Wins (Short)
Stop shipping “polished” docs. Ship runnable examples.
1 file > 1,000 words. Bookmark for later.

Example C — Narrative Build (Thread 5)
1/ I spent 2 weeks “optimizing” a prompt. It didn’t matter.
2/ The bottleneck was our retrieval strategy. Context windows were stuffed with stale data.
3/ We swapped in a 3-feature reranker. 29% lift in success. Same model.
4/ Lesson: Don’t tune the model until you’ve tuned the context.
5/ What would you have tried first?

Implementation Notes
- Keep generation temperature low for Expert/Quick Wins (0.3–0.5), higher for Narrative (0.6).
- Enforce per-tweet char limits during generation, then auto-trim.
- Provide copy as plain text and CSV (tweet-per-line) for scheduler tools.