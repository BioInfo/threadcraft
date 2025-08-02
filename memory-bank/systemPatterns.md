# System Patterns *Optional*

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-07-31 07:01:27 - Log of updates made.

*

## Coding Patterns

* Next.js 14 App Router + TypeScript-first components
* Utility-first styling with Tailwind; Radix UI for accessible primitives
* React Hook Form for validation; Zod for schema-safe types

## Architectural Patterns

* Single-page, no-database architecture; processing at the edge when possible
* Server-side content extraction (Cheerio) feeding LLM generation (OpenAI)
* Caching of processed content for 1 hour; rate limiting at 10 req/min/IP
* Privacy-by-design: no storage, temporary in-memory processing

## Testing Patterns

* Accessibility-first design targeting WCAG 2.1 AA
* Performance targets mapped to Core Web Vitals; bundling via code-splitting and tree-shaking
[2025-08-02 19:37:55] - Pattern: Page-scoped layout composition in Next.js App Router
Description: Keep root layout minimal; compose UI chrome (Header/Footer) at the page level to avoid duplication conflicts and enable per-route customization.

[2025-08-02 19:37:55] - Pattern: Dropdown containment and overflow management
Description: Constrain dropdowns with max height + overflow-y-auto, maintain high z-index within a relatively positioned parent, reduce internal padding/typography, and add panel bottom margin to avoid overlapping primary CTAs.