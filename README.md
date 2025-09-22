# Project Extension Plan – Polly-App

I will be extending the current Polly-App project. This is a full-stack web application built with a modern tech stack, featuring a Next.js and TypeScript frontend with Tailwind CSS for styling, Supabase for the backend and database, and Vitest for testing.

## Planned Features

Below are the new features I will be adding. At the end, the application will be well-tested, fully functional, and responsive:

- 🔒 User role management (e.g., admin vs. regular users)
- 📊 Poll result charts (using a charting library)
- 📱 Mobile responsiveness and improved accessibility
- 🧪 Unit and integration tests using Jest and React Testing Library
- 🧠 AI-powered reviews and automated release notes with CodeRabbit
- 📷 QR code generation for individual polls, making them easily shareable across devices

### Stretch Goals (if time permits)

- 📦 Integrate an email notification system (e.g., poll closing alerts)
- 💬 Add comments or discussion threads on each poll

## AI Integration Plan

I will use AI agents such as Cursor, Trae, and Copilot for:

- Scaffolding new features
- Function and schema suggestions
- Unit and integration test generation
- Database schema design
- Documentation drafting and enhancement
- Refactoring and code optimization
- Continuous learning (asking AI for explanations of its suggestions)

All commits will be reviewed with CodeRabbit, and fixes will be made with AI assistance.
Docstrings will be written by me and refined by the AI agent. A mix of inline and prompt-based interactions will be used.

## Code & Feature Generation Strategy

Since the project is already scaffolded for future expansion, I will first provide the AI agent with a clear understanding of the codebase and the specific features to be added. This reduces hallucinations and ensures relevant suggestions.

I will also define rules to prevent existing logic from being altered unintentionally.
Every prompt will be concise, and all AI-generated suggestions will be manually reviewed before implementation.

## Prompting Strategy

When prompting the AI agent, I will take the perspective of a senior developer responsible for extending this project. The agent will:

- Analyze and understand the existing codebase.
- Extend the current scaffold to include new features such as:
    - 🔒 User role management
    - 📊 Poll result charts
    - 📱 Mobile responsiveness and accessibility improvements
    - 🧪 Testing enhancements
    - 🧠 AI-powered reviews
    - 📷 QR code generation
- If any of these features conflict with or hinder the functionality of the project, the AI agent should flag them during the planning stage before code generation begins.

# Polly - A Real-Time Polling Application

Polly is a full-stack web application that allows users to create, manage, and vote on polls in real-time. It is built with modern web technologies to provide a seamless and interactive user experience.

## Project Overview

This application is designed to be a real-time polling system where users can sign up, log in, and participate in polls. The key features include:

- **User Authentication**: Secure sign-up and login functionality.
- **Poll Management**: Create, update, and delete polls.
- **Real-Time Voting**: Vote on polls and see the results update live.
- **User Dashboard**: View and manage your polls.

# Polly – Real‑Time Polls with Next.js + Supabase

Polly is a full‑stack polling app where users create polls, vote, and view results. It uses RLS‑secured Supabase with role‑based access (admin vs user), a modern Next.js App Router UI, and a fully tested workflow.

## Features

- Authentication (email/PKCE via Supabase)
- Create/manage polls with options
- Vote and view results
- Share via QR code (mobile friendly)
- Dashboard with your polls and participation
- Admin role and panel (guarded): manage across polls
- Secure RLS policies with admin bypass helper
- Tests: unit + integration with Vitest and Testing Library

## Tech Stack

- Framework: Next.js 15 (App Router), React 18, TypeScript
- Backend: Supabase (PostgreSQL, RLS), @supabase/ssr
- Auth: @supabase/auth-helpers-nextjs
- UI: Tailwind CSS v4, shadcn/ui components, lucide-react icons, next-themes, sonner
- QR: qrcode
- Testing: Vitest, @testing-library/react, @testing-library/user-event, jsdom

## Architecture highlights

- App Router with server components and server actions
- Supabase SSR client for authenticated server data
- Strict RLS with public.is_admin(uid) helper for admin bypass
- Guarded routes: requireAuth and requireAdmin
- Clean separation of SSR queries vs client helpers

## Getting Started

Prerequisites:
- Node.js 18+ and npm
- A Supabase project

1) Clone

```bash
git clone https://github.com/Lawaltunde/alx-polly.git
cd alx-polly
```

2) Install

```bash
npm install
```

3) Configure environment

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4) Initialize the database

Option A – via Supabase SQL editor (manual):
- Open Supabase Dashboard → SQL → run these in order:
    1. `supabase/migrations/001_initial_schema.sql`
    2. `supabase/migrations/002_roles.sql`
    3. `supabase/migrations/003_admin_policies.sql`
    4. Remaining files in `supabase/migrations/` as needed

Option B – via Supabase CLI (if configured):

```bash
# From the repo root (requires supabase CLI and a linked project)
supabase db reset
```

5) Promote an admin (so the Admin Panel becomes visible)

In Supabase SQL editor, replace <USER_UUID> with your auth user id:

```sql
update public.profiles
set role = 'admin'
where id = '<USER_UUID>';

select id, role from public.profiles where id = '<USER_UUID>';
```

6) Run the app

```bash
npm run dev
```

Open http://localhost:3000

## Usage

- Create a poll: Dashboard → Create Poll
- Vote: Open a poll → select an option → Vote
- Share: Use the QR code button on a poll
- Admin Panel: As admin, visit /polls and click “Admin Panel” (or go to /admin)

## Scripts

- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm start`
- Test: `npm test`
- Test (watch/UI/coverage): `npm run test:watch` | `npm run test:ui` | `npm run test:coverage`

## Testing

```bash
npm test
```

Vitest runs unit and integration tests (Polling pages, admin actions, UI components). Test helpers stub Next.js routing and Supabase clients.

## Deployment

- Vercel is recommended for Next.js. Set env vars (URL and anon key) in your project settings.
- Ensure migrations are applied to the production database before first run.

## Troubleshooting

- Admin button not visible: ensure `profiles.role = 'admin'` for your user, then log out/in and refresh `/polls`.
- RLS errors: confirm all migrations ran (001 → latest) and your session is authenticated.
- Tests failing resolving `server-only`: test config aliases it; run tests via `npm test`.

---

Made with Next.js + Supabase. Contributions and issues are welcome.