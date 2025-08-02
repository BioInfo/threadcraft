# Decision Log

This file records architectural and implementation decisions using a list format.
2025-07-31 07:01:19 - Log of updates made.

*

## Decision

* 2025-07-31 07:01:19 - Initialize Memory Bank and seed from ThreadCraft_PRD.md

## Rationale 

* Maintain durable, cross-mode project context and ensure PRD insights are reflected in working artifacts without re-reading the PRD each time.

## Implementation Details

* Created memory-bank/ directory with:
  - productContext.md (seeded from PRD)
  - activeContext.md (current focus and questions)
  - progress.md (task tracking)
  - decisionLog.md (this file)
  - systemPatterns.md (to be initialized next)
<!-- 2025-07-31 07:25:02 - Set Memory Bank status to ACTIVE and synchronized all files -->
[2025-07-31 12:08:35] - Implemented UI customization (threadType, tone, industry), platform previews with char limits, API prompt parameterization, per-IP rate limiting, and 1-hour in-memory caching. Added Zod validation with friendly errors, middleware headers enforcement, and expanded README with OpenRouter and Vercel guides.
[2025-07-31 14:24:45] - UX Transformation Architecture: Implemented comprehensive design system with CSS custom properties, component-based architecture for reusability, performance optimization with preloading and caching, innovative smart URL input with suggestions, and full accessibility compliance with WCAG 2.1 AA standards.
[2025-08-02 13:12:45] - Layout Architecture Refactor: Moved Header component from layout.tsx to page.tsx to eliminate duplicate navigation, implemented flexbox layout structure (min-h-screen flex flex-col) to fix spacing issues, and restructured main content with flex-1 for proper space distribution. This resolves UI overlap issues and excessive whitespace while maintaining responsive design.
[2025-08-02 19:37:55] - Layout responsibility change: move Header/Footer out of root layout into per-page usage
Rationale: User requested header and footer as separate components, not rendered in root layout. Prevents duplication issues and allows page-level control.
Implications: Root layout no longer renders Footer. Pages (home, config, readme) explicitly render Header and Footer.

[2025-08-02 19:37:55] - SmartUrlInput dropdown UX compacting
Rationale: Dropdown overlapped the Generate button. User requested smaller box: show 6 popular sources in 2 rows, tighten recent history styles.
Changes: Popular sources grid set to 3 columns (2 rows total). Reduced paddings/fonts/line-heights, capped max height, added scroll and bottom margin.
Implications: Smaller vertical footprint, improved accessibility, reduced overlap risk.