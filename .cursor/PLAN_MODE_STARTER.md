# How to start a new chat in plan mode

Copy and paste the block below into a **new chat** when you want to work only on planning (no code changes unless you ask). This gives the AI clear context and scope.

---

## Starter prompt (copy from here)

```
I'm working on the Jastram Project Management app (Next.js, Prisma, Supabase). I want this chat to run in **plan mode**: focus only on planning and updating plan documents — no implementation or code changes unless I explicitly ask.

**Context:**
- Main plan: C:\Users\Admin\.cursor\plans\project_progress_resource_planner_e9ecea5c.plan.md
- In-repo summary: PROJECT_PLAN.md in this workspace
- Cursor rule: .cursor/rules/project-plan-and-handoff.mdc (keep plan and PROJECT_PLAN.md in sync when updating)

**What I want to do in this chat:**
1. Update the existing plan (e.g. completion status, suggested next steps).
2. Create plans for **new features**, including:
   - **Multi-department access** — different departments (e.g. Engineering, Purchasing, Production) can use the app.
   - **Role-based / department-based permissions** — who can view vs edit vs create what (e.g. projects, deliverables, milestones, team, settings). Define which roles/departments can change or enter which information.

Start by reading the current plan and PROJECT_PLAN.md, then propose how to extend the plan with a section (or separate plan doc) for multi-department access and permissions. Give me a clear permissions matrix and implementation order before any code.
```

---

## Customizing the starter

- To **only** update the existing plan (no new features): replace the "What I want to do" section with:  
  *"Update the existing plan: refresh completion status (Section 6, 6.1) and suggested next steps (6.2). Sync PROJECT_PLAN.md. No new feature planning."*

- To **only** plan new features (no status update): replace with:  
  *"Create plans for [your feature]. Do not change the existing plan’s completion status. No code."*

- To **add another feature** to the plan: add a bullet under "Create plans for new features" (e.g. *"Export/reports for management"*).

---

## Why this works

- **New chat** = no previous implementation context, so the AI stays in planning mode.
- **"Plan mode"** aligns with `.cursor/rules/plan-mode.mdc` (planning only, no code unless asked).
- **Explicit paths and files** help the AI find the plan and PROJECT_PLAN.md.
- **Concrete deliverables** (permissions matrix, implementation order) keep the output actionable.
