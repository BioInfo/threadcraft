# Active Context

This file tracks the project's current status, including recent changes, current goals, and open questions.
2025-07-31 07:01:03 - Log of updates made.

* Initialized from ThreadCraft_PRD.md context and creation of productContext.md

## Current Focus

* Initialize Memory Bank and seed context from ThreadCraft_PRD.md
* Establish baseline goals, features, and architecture for ThreadCraft

## Recent Changes

* 2025-07-31 07:01:03 - Created memory-bank/productContext.md seeded from ThreadCraft_PRD.md

## Open Questions/Issues

* Define exact MVP prompt templates to ship with the app
* Confirm deployment target (Vercel recommended) and environment variables for OpenAI keys
* Decide on inclusion of optional features (hashtag trends, mentions) in MVP vs later
<!-- 2025-07-31 07:24:55 - Memory Bank synchronized and set to ACTIVE -->
[2025-08-02 19:37:55] - Current Focus: Finalize layout policy and dropdown UX
- Header/Footer now rendered per-page (home/config/readme), removed from layout.tsx.
- SmartUrlInput dropdown compacted (2x3 popular sources grid, tighter recent URLs), scrollable with max height and margin below to avoid overlap.

Open Questions/Issues:
- None pending per latest feedback.

Recent Changes:
- page.tsx/config/page.tsx/readme/page.tsx updated to include Header/Footer.
- SmartUrlInput adjustments: reduced paddings/typography, grid cols=3, max-h-80, overflow-y-auto, mb-3.
[2025-08-02 20:45:55] - Current Focus: Research Papers feature merged to main; post-merge task is Memory Bank sync and follow-up runtime error investigation noted earlier ("reading 'bind'").