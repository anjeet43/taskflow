# TaskFlow

A fast, focused to-do app: sidebar navigation, projects, tags, subtasks, recurring tasks, a command palette,
drag-and-drop ordering, dark mode, and real multi-user auth with Supabase.

## What's actually implemented

Everything below is wired to real Supabase data — no mock data, no inert buttons:

- **Auth**: email/password signup & login, Google OAuth, persistent sessions, every route under `(app)` protected
  by middleware (not just hidden in the UI — a signed-out request is redirected server-side before any page or
  data loads).
- **Tasks**: title, description, priority, due date, project, tags, subtasks, recurrence — create, edit, delete,
  complete/uncomplete, duplicate, move between projects, manual drag-and-drop reordering (persisted).
- **Quick add**: typing "Finish DSA assignment tomorrow #college !high" auto-fills the due date, tag and
  priority — shown live as chips before you submit.
- **Views**: Today (with overdue section), Inbox, Upcoming (grouped by date), Completed, Calendar (month grid,
  click a day to see/tick its tasks), Projects, per-project pages, Settings.
- **Command palette** (`Cmd/Ctrl+K`): jump to any view, create a task, search, toggle dark mode.
- **Global search** (`/`): instant client-side search across title, description, project and tags, plus keyword
  shortcuts like "today" and "high priority".
- **Keyboard shortcuts**: `N` new task, `/` search, `Cmd/Ctrl+K` palette, `Esc` closes dialogs — listed in Settings.
- **Dark / light / system** theme, persisted.
- **Recurring tasks**: completing one on time spawns its next occurrence immediately. A separate optional daily
  cron route (`/api/cron/recurring`) catches ones that were missed entirely so they don't just vanish — see
  "Recurring tasks, honestly" below for the one limitation worth knowing.
- **Row Level Security**: every table's policies check `auth.uid()` at the database level. A user cannot read or
  write another user's rows even if they tried to call Supabase directly with a stolen task ID.

### Deliberately simplified (said plainly, not hidden)

A few of the thirty requested sections are the kind of thing real products spend weeks polishing. Rather than
fake them, here's exactly where the line is:

- **Notifications**: there's no push/browser notification system. Reminders would need a scheduled job plus the
  Web Push API and user permission flow — a solid chunk of work on its own. Not built.
- **Recurring tasks**: the "missed occurrence" cron (above) is a straightforward catch-up pass, not a full
  recurrence engine — it doesn't yet handle "custom" recurrence beyond specific weekdays, and only Vercel Cron
  is wired up (vercel.json). If you deploy elsewhere, you'd trigger that route on a schedule yourself.
- **Drag-and-drop** reorders within whatever list is currently shown and persists via `sort_order`; dragging a
  task from one project's view into another isn't supported — use "Move to…" in the task menu for that instead.
- **Animations** are real but intentionally restrained (per the brief) — task completion, dialogs and the
  sidebar animate; there's no page-transition library wired in beyond Next.js's own navigation.

Nothing above is a placeholder button — each of these is just not present in the UI, so you won't find a control
that silently does nothing.

## Local setup

### 1. Supabase project

1. Create a project at supabase.com.
2. SQL Editor → run `supabase/schema.sql`. This creates every table, index, and RLS policy, plus a trigger that
   auto-creates a `profiles` row on signup.
3. Project Settings → API → copy the **Project URL**, **anon public key**, and **service_role key**.

### 2. Google OAuth (optional — email/password works without it)

1. Supabase Dashboard → Authentication → Providers → Google → toggle it on.
2. In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID**
   (Web application).
3. Add this **Authorized redirect URI** (Supabase shows the exact value on the same Providers page):
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Paste the generated **Client ID** and **Client Secret** back into Supabase's Google provider settings and save.
5. In Supabase → Authentication → URL Configuration, add your app's URL (e.g. `http://localhost:3000` for local
   dev, your Vercel domain for production) to **Redirect URLs**.

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` (the last one
is only used server-side, by the optional cron route — never shipped to the browser). `CRON_SECRET` is optional;
set it and add the same value as a Bearer token if you wire up the cron route outside Vercel.

### 4. Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/login`. Sign up, confirm your email (Supabase sends this
automatically), and you're in.

## Deploy to Vercel

1. Push this project to a GitHub repo.
2. Import it into Vercel, add the same environment variables from `.env.local`.
3. Deploy. `vercel.json` already schedules the recurring-task cron daily at 01:00 UTC — no extra setup needed on
   Vercel specifically.
4. Add your Vercel domain to Supabase's **Redirect URLs** (Authentication → URL Configuration) and, if you're
   using Google OAuth, nothing else changes there — the redirect still goes through Supabase's own callback URL.

## Project structure

```
src/
  app/
    login/, signup/            public auth pages
    auth/callback/              OAuth + email-confirmation redirect handler
    (app)/                      everything behind the auth gate
      layout.tsx                 loads the workspace, redirects if signed out
      today/ inbox/ upcoming/ completed/ calendar/ projects/ projects/[id]/ settings/
    api/cron/recurring/         optional daily catch-up for missed recurring tasks
  components/
    ui/                         hand-built primitives on Radix (button, dialog, select, checkbox, dropdown…)
    layout/                     sidebar, mobile nav, page header, app shell
    tasks/                      task item, task list (dnd-kit), quick-add dialog
    projects/                   project create/edit dialog
    command/                    command palette (cmdk) + global search
    workspace-context.tsx       client state: tasks/projects/tags + optimistic updates + shortcuts
  server/                       "use server" actions — the only place that talks to Supabase for writes
    tasks.ts projects.ts tags.ts data.ts
  lib/
    supabase/                   browser + server Supabase clients
    quick-add.ts                natural-language parser for the quick-add bar
    sort-tasks.ts utils.ts
  middleware.ts                 the actual auth enforcement point
supabase/schema.sql             tables, indexes, RLS policies, triggers
vercel.json                     cron schedule for the optional recurring-task route
```

## Security notes

- The service-role key is read only inside `api/cron/recurring/route.ts`, a server-only route, and is never
  imported by anything that ships to the browser.
- Every other Supabase call — from Server Components, Server Actions, and the browser client — uses the anon
  key and goes through RLS. There's no code path that trusts a client-supplied `user_id`; every insert sets it
  from the authenticated session server-side, and every policy re-checks `auth.uid()` regardless.
- `middleware.ts` is the single enforcement point for "protected routes" — it runs before any page or Server
  Component, so there's no page that briefly renders before an auth check catches up.

## What I verified before calling this done

- `npm run typecheck` and `npm run build` both pass cleanly (no TypeScript errors, no build errors).
- The auth gate was tested directly: an unauthenticated request to a protected route (e.g. `/today`) returns a
  307 redirect to `/login?next=/today`; `/login` and `/signup` load without requiring a session.
- I could not exercise the Supabase-backed flows (signup, creating tasks, RLS behavior end-to-end, Google OAuth)
  from this environment since that needs your real Supabase project and credentials — please run through
  signup → create a task → refresh → sign out → sign back in as your first pass.
