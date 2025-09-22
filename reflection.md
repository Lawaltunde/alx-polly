# Reflection: Building With AI as a Partner

Shipping this full‑stack project end‑to‑end felt different—in the best way—because AI meaningfully changed how I plan, build, and iterate. Historically, I’d focus on one layer at a time: either the frontend or backend, APIs or tests, and occasionally database ingestion. With AI in the loop, I stayed in flow across the whole stack, using it as a reviewer, pair programmer, and refactoring coach rather than a code vending machine.

## How AI Fit Into My Process

- Co‑design, not code dump: I brought ideas; AI helped pressure‑test them, suggest alternatives, and highlight edge cases. This made decisions around Next.js App Router, component composition, and data boundaries feel deliberate.
- Fast feedback loops: I used AI to reason about failing tests and tricky TypeScript types, accelerating the debug‑refactor cycle.
- Safety rails: When touching critical paths—auth, RLS, and server actions—AI pushed for typed helpers, clearer contracts, and small tests first.

## Concrete Impacts Across the Codebase

- Architecture and scaffolding: We set a clean App Router structure with server components and client islands where needed (for example, dialogs, theme toggles, and live results). The result is a tidy `app/` with focused routes like `app/(dashboard)/polls`, `app/p/[pollId]`, and a guarded `app/(dashboard)/admin` entry.
- Authentication and roles: AI helped me introduce a minimal roles model that still scales. I added a `profiles.role` column and a `public.is_admin(uid)` helper in `supabase/migrations`, then wired server‑side guards in `app/lib/auth.ts` (e.g., `getUserRole`, `requireAdmin`). UI gates appear in `Header`, `Sidebar`, and the dashboard.
- Database and RLS: We tightened RLS so admins get safe bypasses while regular users stay scoped to their data. AI nudged me to centralize permission checks and to keep server actions thin and explicit.
- Testing discipline: Vitest + Testing Library give confidence. I leaned on AI to stabilize tests with role‑based queries, remove flakiness, stub server‑only imports, and mock Supabase SSR clients. Integration tests like `test/integration/poll-workflow.test.tsx` now reflect real user flows.
- DX and refactoring: AI helped me extract small, typed helpers (for example, a typed RPC check for admin edits) and reduce duplication (like consolidating profile/role fetching). It also encouraged replacing brittle color classes with theme tokens.
- UX polish: We improved the QR code flow (accessible dialog, keyboard controls), clarified admin entry points, and unified theming. When the chart colors regressed with new tokens, AI guided a layered fix: CSS variables first, with HSL fallbacks, plus a subtle track tone—now results are readable in both themes.

## What Changed in How I Work

- I ship safer: I write tests earlier and design APIs with clear inputs/outputs because AI keeps asking “what if?” and “how would we test that?”
- I move faster without skipping thinking: AI accelerates reading, diffing, and exploring options, but I still make the final calls and keep context.
- I’m more consistent: Naming, patterns, and accessibility checks improved because AI surfaced conventions at the right time.

## Looking Forward

This project reinforced that partnering with AI helps me ship production‑grade software across stacks—not just this web stack. The same habits transfer to any environment: co‑designing architecture, scaffolding quickly, codifying invariants with types and tests, security‑first auth/authorization, and iterative, AI‑assisted reviews. Whether it’s a Next.js + Supabase app, an Express/Django API, a Go service, background workers, or data/ML pipelines, the workflow remains: define small contracts, keep boundaries typed, validate with pragmatic tests, and iterate with confidence. Next.

Building “with AI” didn’t replace my craft—it amplified it. I stayed in control, moved faster, and ended up with a cleaner codebase I understand and trust.
