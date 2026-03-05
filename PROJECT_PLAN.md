# Jastram PM — Project plan summary

Full technical plan: **`C:\Users\Admin\.cursor\plans\project_progress_resource_planner_e9ecea5c.plan.md`**

Read the full plan when continuing work. This file is a short reference for completion status and next steps.

---

## Completion status (keep in sync with plan Section 6 & 6.1)

**Done**

- Scaffold: Next.js App Router, TypeScript, Tailwind, Prisma, PostgreSQL (Supabase)
- Schema: Projects, Tasks, Milestones, ProjectDeliverable (8 types), TeamMember, TaskAssignment, Notification, ReminderLog, SalesOrder, Department, User (UserRole enum: VIEWER/EDITOR/ADMIN)
- Migrations: baseline `0_init` + `add_sales_orders_dept_user` applied to Supabase
- Templates: `lib/milestone-templates.ts`, `lib/deliverable-templates.ts`
- Projects: CRUD APIs, new project form, project list, project detail (8 deliverables + 3 milestones + general notes, per-project issue log, date status colors)
- Dashboard: Progress summary, needs-attention list, project quick list
- Team: CRUD APIs, team list (capacity bars), new member form, member detail (assignments list), inline edit
- Calendar: Month view, milestones + deliverables, prev/next, date status colors, links to projects
- Settings: Placeholder page
- Shipping date sync: project create/PATCH ↔ SHIPPING deliverable `dueDate` (bidirectional)
- Project issue log: Issue model + CRUD APIs + project detail UI (description, assignee, due date, status)
- Seed: 3 Departments (Engineering, Purchasing, Production) + Admin user (`smalkawi@jastram.com`)
- Auth: `lib/supabase/server.ts` + `client.ts`, `proxy.ts` (route protection → `/login`), `lib/auth.ts` (`getCurrentUser`), `lib/permissions.ts` (role helpers)
- Login page: `app/login/page.tsx` — email + password, marine theme, working ✓
- Route groups: all app pages under `app/(app)/`; login at `app/login/` (no sidebar)
- API mutation guards: all POST/PATCH/DELETE routes return 401/403 by role
- Sidebar: user name, department badge, role badge (Viewer/Editor/Admin), sign-out button; Settings nav item hidden for non-Admin
- Projects page: "New Project" button visible to EDITOR+ only
- `@types/pg` installed; TypeScript 0 errors
- `proxy.ts` rename (Next.js 16); sidebar sign-out fallback when no User row; Account nav + `/account` page (profile + change password)
- Password reset: `/auth/reset-password` (request link + set new password from email), "Forgot password?" on login
- UI permission controls: Edit/Delete on project detail gated by role; Settings redirect for non-Admin; Team "Add Member" and member Edit/Delete gated by role; project edit page at `/projects/[id]/edit`

**Not done**

- Sales orders: CRUD APIs (`/api/projects/[id]/sales-orders`), field(s) on new project form + project detail/edit, display on project list/detail
- Task assignment UI: assign team members to tasks from project/task side (API scaffolding exists in team detail)
- Reminder system: `lib/reminders.ts`, `lib/email.ts`, `/api/reminders/run`, Vercel cron, notification bell in layout
- Settings: persist notification email + default unit system to DB or env
- Polish: notification mark-read, milestone purpose/agenda from templates in UI
- Imperial units in task specs (`specJson` + `lib/units.ts`)
- **Later (department-based access):** See section below — Purchasing read-only, Management KPIs/bottlenecks, Engineering update progress.

---

## Suggested next steps (in order)

1. **Sales orders** — CRUD API at `/api/projects/[id]/sales-orders`; add sales order number field(s) to new project form and project detail/edit; show on project list and detail. Schema + migration already done (`SalesOrder` model exists).
2. **Task assignment UI** — From project detail (task card): assign team members with allocated hours. API: `POST/DELETE /api/tasks/[id]/assignments`. Team detail already displays assignments; need the create path.
3. **Reminder system** — `lib/reminders.ts` (query milestones/deliverables due in 7d/1d, check ReminderLog, create Notification rows, send email); `lib/email.ts` (Resend or SendGrid); `POST /api/reminders/run` (protected by `CRON_SECRET`); `vercel.json` cron; notification bell + list + mark-read in layout.
4. **Settings** — Persist notification email and default unit system to DB (`Setting` model or env). Settings page already exists as placeholder.
5. **Optional** — Imperial units in task forms; polish (milestone purpose/agenda UI from templates).

---

## Later: Department-based access levels and views

Different users will have different access levels and tailored views by department. The full plan (Section 9 and new Section 9.8) has the details; summary:

| Department   | Access / view |
| ------------ | ----------------------------------------------------------------------------------- |
| **Purchasing** | See project overview, deadlines, and status only — **read-only**. Can view projects, deliverables, milestones, calendar; **cannot** create, edit, or fill in any information. Map to **Viewer** role (or department-specific Viewer). |
| **Management** | See **KPI dashboards** and **bottlenecks**. High-level metrics, project health, overdue/at-risk items, capacity vs demand. Read-only or limited to reporting views. May use Viewer or a dedicated “Management” role/view. |
| **Engineering** | Can **update project progress**: edit tasks, deliverables, milestones, notes; Kanban; possibly create projects. Map to **Editor** (or department-specific Editor). |

**Implementation (later phase):**

- Keep **Viewer / Editor / Admin** roles; assign users to a department and role (e.g. Purchasing = Viewer, Engineering = Editor, Management = Viewer or custom role).
- Optionally add **department-based overrides** in `lib/permissions.ts` (e.g. restrict which deliverable types a department can edit).
- **Management views:** Add dashboard(s) or sections for KPIs and bottlenecks (e.g. overdue count, capacity utilization, at-risk projects); restrict access by role or department.
- **UI:** Hide/disable create and edit actions for Viewers (and any department-specific read-only rules); show KPI/bottleneck views only to Management (or designated role).

See full plan **Section 9** (RBAC) and **Section 9.8** (department-based access levels and views) for implementation order and data model notes.

---

*After completing work: update this file and the full plan (Section 6, 6.1, 6.2) so the next agent can take over.*
