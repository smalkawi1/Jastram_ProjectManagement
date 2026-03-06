# Agent Handoff — Deployment, Supabase & Operational Context

**Purpose:** This file captures operational knowledge learned during deployment and setup. **All agents working on deployment, Supabase, Vercel, or similar tasks must read this file first** for context.

---

## 1. Services Overview

| Service | Role |
|---------|------|
| **GitHub** | Stores code; Vercel pulls from here. |
| **Vercel** | Hosts the Next.js app 24/7; CI/CD on push. |
| **Supabase** | PostgreSQL database + Authentication (login). |

**Data flow:** App code (GitHub) → built & run (Vercel) → reads/writes data (Supabase DB) + auth (Supabase Auth).

---

## 2. Environment Variables (`.env`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (e.g. `https://xxx.supabase.co`). Used by frontend for Auth. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase key for Auth/API. Use **legacy** `eyJ...` format if `sb_publishable_` causes "Invalid API key". |
| `DATABASE_URL` | Pooled Postgres URL (port 6543). App runtime. Must include `?pgbouncer=true&connect_timeout=10`. |
| `DIRECT_URL` | Direct Postgres URL (port 5432). Used by `prisma migrate` and `prisma db seed`. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_AUTH_ID` | Admin user for seed script. Auth ID = Supabase Auth User UID. |
| `SEED_TEST_USER_*` | Test user for seed. Same idea. |

**Critical:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must belong to the **same** Supabase project as `DATABASE_URL`/`DIRECT_URL`. Mismatch → "Invalid API key" or auth failures.

**Password in URLs:** If password has special chars (e.g. `!`), URL-encode them (`!` → `%21`). Prefer simple passwords (letters + numbers) for new Supabase projects to avoid encoding issues.

---

## 3. Prisma, Migrate, Seed

| Term | Meaning |
|------|---------|
| **Prisma** | ORM/toolkit. Schema in `prisma/schema.prisma`; client in `lib/db.ts` imports from `@/app/generated/prisma`. |
| **Migrate** | `npx prisma migrate deploy` — applies schema changes (tables, columns) to the DB. Run **locally** (Vercel does not run migrations). Run on new/empty DB or after adding a migration. |
| **Seed** | `npx prisma db seed` — runs `prisma/seed.ts` to create Departments + Admin + optional Test user. |

**Build fix:** `package.json` must run `prisma generate` before `next build` (e.g. `"build": "prisma generate && next build"`). Otherwise Vercel fails with "Module not found: '@/app/generated/prisma'".

**Seed uses email for upsert:** The seed script upserts users by `email` (not `authId`) so switching Supabase projects doesn't cause "Unique constraint failed on email" when re-seeding.

---

## 4. Supabase Setup (New Project / Clean Start)

1. Create new Supabase project. Use a **simple database password** (letters + numbers only).
2. Get from **Connect** page: Transaction pooler (6543) → `DATABASE_URL`; Session pooler (5432) → `DIRECT_URL`.
3. Get from **Settings → API Keys**: Project URL, anon key (prefer legacy `eyJ...` tab).
4. Create Auth users: **Authentication → Users → Add user** for admin and test. Copy each **User UID**.
5. Update `.env` with all values. Run `npx prisma migrate deploy` then `npx prisma db seed`.
6. Update Vercel env vars to match. Redeploy.

**Database password:** Reset via Supabase **Connect** or **Settings → Database**. "Circuit breaker open" = too many failed auth attempts; wait or restart project.

---

## 5. Vercel Deployment

- **Env vars:** Set in Vercel → Settings → Environment Variables. Must match `.env` for DB and Supabase.
- **Redeploy:** After changing env vars, redeploy (Deployments → ⋯ → Redeploy, uncheck cache).
- **Git user:** Commits must have `user.email` matching the GitHub account that owns the Vercel project, or Hobby teams may block with "no git user associated with the commit".

---

## 6. Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Module not found: '@/app/generated/prisma'` | Prisma client not generated before build | Add `prisma generate &&` to `build` script in `package.json`. |
| `Invalid API key` | Supabase URL and anon key from different projects, or wrong key format | Ensure URL + key from same project. Try legacy `eyJ...` key. |
| `Authentication failed... credentials for postgres are not valid` | Wrong DB password in `DATABASE_URL`/`DIRECT_URL` | Reset password in Supabase, update `.env` and Vercel. |
| `Circuit breaker open` | Too many failed DB auth attempts | Wait 5–10 min or restart Supabase project. |
| `Unique constraint failed on the fields: (email)` | Seed upserting by `authId` when user exists with same email | Seed should upsert by `email` (see `prisma/seed.ts`). |
| `Type 'string \| null' is not assignable to type 'string'` | Prisma enums / nullable fields in TypeScript | Narrow types (e.g. `const id = r.x; if (!id) return;`) or cast to enum. |

---

## 7. Data Storage & Backup

- **All app data** (projects, users, deliverables, etc.) lives in the **Supabase PostgreSQL database**.
- Vercel does **not** store app data; it only runs the code.
- Backup: Supabase Dashboard → Database/Backups; or manual export (SQL/CSV). Regular backups recommended.

---

## 8. Deployment Flow (Code Change → Live)

1. Edit code locally. Test with `npm run dev`.
2. If the change includes **schema changes** (new Prisma migration): run `npx prisma migrate deploy` locally so the DB your app uses has the new tables/columns. See **Section 8.1** for when that DB is the same as production.
3. `git add` → `git commit -m "..."` → `git push`.
4. Vercel auto-builds and deploys from GitHub (`prisma generate` runs in the build; migrations are **not** run on Vercel).
5. `.env` is **never** committed. Vercel env vars are set separately in the dashboard.

### 8.1 Same database for local and production (typical setup)

**Local** uses `.env` (e.g. `DATABASE_URL`, `DIRECT_URL`). **Production** (Vercel) uses env vars set in the Vercel dashboard. They can point to the same Supabase project or to different ones.

| Setup | Meaning | After running `prisma migrate deploy` locally |
|-------|--------|----------------------------------------------------------------|
| **Same Supabase** | Local `.env` and Vercel env vars point to the **same** Supabase project (same DB). | The live site’s database is already updated. Push code; no extra migration step. |
| **Different Supabase** | Local points to a dev Supabase; Vercel points to a separate prod Supabase. | Only the dev DB was migrated. Run `prisma migrate deploy` against the **production** DB (e.g. temporarily set `DIRECT_URL` to prod in `.env`, run deploy, then revert). |

**How to tell:** Compare `DATABASE_URL` or `DIRECT_URL` in local `.env` with the same variables in Vercel → Project → Settings → Environment Variables. Same host/project ID = same database; different = separate dev/prod databases.

---

## 9. Key Files

| File | Purpose |
|------|---------|
| `lib/db.ts` | Prisma client; imports from `@/app/generated/prisma`. |
| `prisma/schema.prisma` | Data model; `output = "../app/generated/prisma"`. |
| `prisma/seed.ts` | Creates Departments + Admin + Test user. |
| `prisma.config.ts` | Prisma config; schema path, migrations. |
| `lib/supabase/server.ts`, `client.ts` | Supabase Auth for server/client. |
| `SWITCH_TO_NEW_SUPABASE.md` | Step-by-step for switching Supabase accounts. |
| `UPLOAD_TO_NEW_GITHUB.md` | Step-by-step for uploading to new GitHub repo. |

---

## 10. Recent Agent Work (Code Review Cleanup — Mar 2026)

**Summary:** Full code review before adding features. Security, data integrity, API robustness, and code quality fixes applied.

**Important for future agents:**
- **Auth:** All GET API routes now require `getCurrentUser()`; unauthenticated → 401. Route protection lives in `proxy.ts` (Next.js 16 uses `proxy.ts`, not `middleware.ts` — do not create `middleware.ts` or you get "Both middleware and proxy detected").
- **Shared utilities:** `lib/date.ts` (`parseInputDate`), `lib/constants.ts` (project status maps), `MILESTONE_ORDER` in `lib/milestone-templates.ts`.
- **Permission gates:** `/projects/new` and `/team/new` are server wrappers that redirect non-EDITOR users.
- **Issue delete:** `IssueLogSection` has separate `canEdit` and `canDelete` props (delete requires ADMIN).
- **Full details:** See `PROJECT_PLAN.md` "Full code review cleanup" bullet and `C:\Users\Admin\.cursor\plans\full_code_review_b62a0c84.plan.md` if it exists.

---

*Last updated after code review cleanup. Extend this file when new operational learnings are discovered.*
