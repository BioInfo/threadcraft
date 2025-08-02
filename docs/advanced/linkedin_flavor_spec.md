# LinkedIn Content Flavor Spec

Last updated: 2025-07-31

Purpose
Enable high-clarity LinkedIn posts that match professional norms, maximize saves/shares, and require minimal editing. Defaults prioritize scannability, proof, and practical value.

Personas
1) Practitioner/EIC
   - Goal: Share tested insights, build authority, attract opportunities.
   - Style: Concrete, teach-first, no hype.
2) Team Lead/Manager
   - Goal: Communicate frameworks, team wins, and hiring signals.
   - Style: Structured, people-centric, results-driven.
3) Founder/Operator
   - Goal: Market narrative, product learning, partnerships.
   - Style: Story + outcomes + invitation to talk.

Platform Goals and Constraints
- Primary goals: Saves, shares (reposts), meaningful comments, profile visits.
- Length: No strict limit like Twitter. Posts 600–1,300 chars perform well; longer is fine if structured with whitespace.
- Structure: Short paragraphs, blank lines between, 1–3 strong headers or emojis as section markers.
- Links: External links may reduce reach; consider “link in first comment” or include sparingly mid-post if essential.
- Hashtags: 2–5 targeted at the end (#productmanagement, #ai, #leadership).
- Mentions: Tag collaborators or companies judiciously.
- Visuals: Carousels (PDFs), charts, or simple diagrams have strong performance.
- Tone: Professional, approachable, proof-oriented.

Flavor Presets (Platform-Specific)
Each preset supports variations: Short, Insight, Long-Form, and Carousel Outline.

1) Quick Insight
   - Tone: Clear, concise, value-first.
   - Structure:
     - Hook: 1–2 lines stating a distilled lesson or counterintuitive truth.
     - Body: 3 bullets with concrete tactics or examples.
     - CTA: “Save for later” or “What did I miss?”
     - Hashtags: 3 targeted tags.
   - Best for: Practical tips, frameworks, short teachable moments.

2) Case Study
   - Tone: Evidence-led, measured.
   - Structure:
     - Header: Project or problem in 1 line.
     - Setup: Context and constraints (1–2 lines).
     - Actions: 3–5 steps taken (bulleted).
     - Outcome: 1–2 metrics or qualitative results with numbers.
     - CTA: “Happy to share the template/framework.”
     - Hashtags: 3–4 tags.
   - Best for: Wins with measurable outcomes; hiring signals; partner highlights.

3) Narrative Reflection
   - Tone: Story-driven, introspective, actionable.
   - Structure:
     - Hook: Moment of tension (mistake, surprise).
     - Story: 2–3 short paragraphs (what happened).
     - Lesson: 3 bullet takeaways.
     - CTA: “Curious what you’d try differently?”
     - Hashtags: 2–3.
   - Best for: Career lessons, leadership insights, team culture.

4) Hiring Signal / Team Highlight
   - Tone: Positive, specific, credit-sharing.
   - Structure:
     - Header: Team achievement in one line.
     - What: 2–3 bullets (problem → action → impact).
     - Who: Tag 1–3 contributors.
     - CTA: “We’re hiring for X” or “Open to collaborations.”
     - Hashtags: 3–4 (role, tech, function).
   - Best for: Employer brand, recruiting, partnerships.

Summary Modes
- Short: 3–5 lines, whitespace-separated, single screen on mobile.
- Skimmable: Headline + 3–5 bullets + CTA; strong for LinkedIn scanning behavior.
- Expert: Data-backed, includes metrics and controlled tone.
- Conversational: Friendly, questions and light emojis (sparingly).

Model/Engine Selection Guidance
- Speed: Fast draft for Quick Insight or Short mode.
- Quality: Higher coherence for Case Study and Narrative Reflection.
- Default rule:
  - If Short or Skimmable: Speed
  - If Long-Form, Case Study, or Narrative: Quality
  - One-click override “Speed vs Quality”.

Customization Controls (Intuitive, Minimal)
- Post Type (Radio): Quick Insight, Case Study, Narrative Reflection, Hiring Signal.
- Tone Slider: Analytical — Balanced — Conversational.
- Depth Toggle: Short / Insight / Long-Form / Carousel Outline.
- Audience Selector: Practitioners, Managers/Leads, Execs/Partners.
- Advanced (Progressive Disclosure): Hashtags (2–5 suggested chips), Mentions (autocomplete), Link handling (in-body / first comment / none).

Adaptive Defaults
- Remember last used preset and tone.
- Detect content type:
  - Presence of metrics → Case Study
  - Past-tense story → Narrative Reflection
  - Bulleted tips → Quick Insight
- Auto-set depth:
  - ≤ 600 chars input → Short
  - 600–1,800 → Insight
  - > 1,800 → Long-Form
- Auto-suggest hashtags from entity and topic extraction (limit to 3).

Guardrails for Simplicity
- Preselect one preset and depth; defaults to Quick Insight + Balanced tone.
- Cap visible choices on first screen. Advanced options hidden behind a single toggle.
- Keep bullets 1 line each; enforce whitespace for readability.
- Hashtags capped at 5; display remaining count.

UX Flows (Under 3 Actions)
Generate
1) Paste source content or pick a preset template.
2) Click Generate (smart defaults applied).
3) Land on preview with character guidance and suggested hashtags.

Preview and Light Edit
1) Review formatted preview with line breaks and skimmable bullets.
2) One-click edits: “More concise”, “More data-backed”, “More conversational”.
3) Copy, Download as PDF for carousel outline, or Post/Schedule.

Minimal-Edit Workflow Examples

Example A — Quick Insight (Skimmable)
Hook:
You don’t need 10 KPIs.
You need 3:

• Lead time (how fast work moves)
• Change failure rate (how often it breaks)
• Time to recovery (how fast you fix)

Everything else is commentary.
Save for the next planning cycle.

#productmanagement #engineering #devops

Example B — Case Study (Insight)
Header:
Cut onboarding time by 37% in 6 weeks.

Context:
Our activation guide was 22 steps and 3 tools deep.

Actions:
• Shadowed 12 users, mapped top 5 friction points
• Merged 3 screens into 1; added guided defaults
• Added “Skip” and “Later” for optional steps

Outcome:
• Setup time: 18 → 11 minutes
• Trial-to-activated: +9.2%
Happy to share the walkthrough.

#ux #saas #growth

Example C — Narrative Reflection (Long-Form)
I spent 3 months optimizing our model prompts.
It didn’t matter.

The real blocker was stale context.
We were feeding “complete” docs that didn’t reflect how users actually worked.

We rebuilt our retrieval to favor fresh usage notes over static docs.
Quality complaints dropped 28% in two weeks.

Takeaways:
• Fresh beats perfect
• Measure “time-to-correct” not just “accuracy”
• Start with context, then the model

What would you try first?

#ai #product #mlops

CTA Patterns
- “Save for later” (optimize for saves).
- “What did I miss?” (comments).
- “Happy to share the template” (DMs/leads).
- “We’re hiring for X” (recruiting).
- “Open to collaborations” (partner outreach).

Hashtags/Mentions
- 2–5 targeted hashtags at the end; avoid mid-body tag spam.
- Mention collaborators or companies sparingly and meaningfully.

Naming Conventions
- Presets: Quick Insight, Case Study, Narrative Reflection, Hiring Signal
- Modes: Short, Skimmable, Expert, Conversational
- Toggle: Speed vs Quality

Rubric for Auto-Suggestions
- If input includes metrics and steps → Case Study (Insight)
- If first-person past tense and a lesson → Narrative Reflection (Long-Form)
- If bullets without metrics → Quick Insight (Skimmable)
- If team names/roles detected → Hiring Signal

Metrics for Low Cognitive Overhead
- Time-to-first-preview < 12s
- Edits-per-post < 3
- Abandonment rate from generate → preview < 12%
- Saves/post and comments/session ↑
- Profile visits from posts ↑

Accessibility and i18n
- High contrast, obvious focus states.
- Clear line spacing and font size targets.
- ARIA live regions for character/section warnings.
- Locale-aware spellings and date formats.
- Avoid idioms when Tone = Analytical; provide en-US/en-UK variants.
- Respect RTL for relevant locales.

Carousel Outline Output (Optional)
- Slide 1: Hook (big text, minimal words)
- Slides 2–5: One idea per slide with a visual hint
- Slide 6: Outcome or tactical checklist
- Slide 7: CTA (comment/save/template)

Implementation Notes
- Keep generation temperature lower for Case Study (0.3–0.5), medium for Narrative (0.6).
- Enforce whitespace between paragraphs automatically.
- Suggest a 3-hashtag set with the option to “swap” each chip.
- Provide exports: plain text, PDF outline (A4 landscape), and CSV (slide-per-row).

Concrete Post Variations (Quick Copy)

Variation 1 — Quick Insight (Short)
Most “complexity” is debt from unclear decisions.
Write owner, goal, and 3 guardrails before you start.
You’ll ship faster—and change less later.

#leadership #execution #product

Variation 2 — Case Study (Insight)
We cut P1 incident recovery by 41% without changing the model.

• Moved alerts to a single channel with runbooks
• Added “rollback in 1 click”
• Practiced 2 chaos drills/month

MTTR: 58 → 34 minutes.
If you want the runbook template, comment “runbook”.

#sre #aiops #reliability

Variation 3 — Hiring Signal
Shoutout to @A and @B for simplifying onboarding from 22 → 14 steps.
We’re hiring a PM to take this to zero-friction.
DMs open.

#hiring #saas #ux