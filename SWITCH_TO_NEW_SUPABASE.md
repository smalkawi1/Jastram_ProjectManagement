# Switch to Your New Supabase Account (Same Email as GitHub/Vercel)

Use this when you have a **new Supabase account** (new email) and want your project to use it instead of the old one. You already created the new account; follow these steps in order.

---

## Step 1: Create a New Project in the New Supabase Account

1. Log in at [supabase.com](https://supabase.com) with your **new** email (the one that matches GitHub/Vercel).
2. Click **New Project**.
3. Choose an organization (or create one if needed).
4. Set **Project name** (e.g. `jastram-pm`) and **Database password** (save it somewhere safe).
5. Pick a **Region** close to you (or your users).
6. Click **Create new project** and wait until the project is ready (green status).

---

## Step 2: Get Connection Details from the New Project

1. In the new project, go to **Project Settings** (gear icon in the left sidebar).
2. Open **Database**.
   - Find **Connection string** → **URI**. Copy it — this is your **direct** connection (no pooling).
   - If you see **Connection pooling** (e.g. "Transaction" or "Session" mode), copy that URI too — this is usually what you use as **DATABASE_URL** in the app (port often `6543`).
3. Replace the placeholder password in the URI with your real **Database password** from Step 1.
   - Direct URL usually uses port **5432**.
   - Pooled URL usually uses port **6543** and a different host (e.g. `aws-0-xx-x.pooler.supabase.com`).
4. In the left sidebar go to **API** (under Project Settings or Home).
   - Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`.
   - Under **Project API keys**, copy the **anon public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

You should now have:
- **Direct URL** (port 5432) → for migrations and seed (use as `DIRECT_URL`; can also use as `DATABASE_URL` if you prefer).
- **Pooled URL** (port 6543) → optional, for app runtime (use as `DATABASE_URL` if you use pooling).
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 3: Update Your Local `.env`

1. Open `.env` in your project (in Cursor).
2. Replace the **Supabase-related** values with the new project’s values. Typically:

   ```env
   # Database (new Supabase project)
   DATABASE_URL="postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].supabase.com:5432/postgres"

   # Supabase Auth (new project)
   NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

   Use your actual URIs and keys from Step 2. If you only have one connection string, use it for both `DATABASE_URL` and `DIRECT_URL` (Supabase supports that for small apps).
3. Save the file. Do **not** commit `.env` to Git.

---

## Step 4: Run Migrations on the New Database

This creates all tables (Project, User, Deliverable, etc.) in the **new** Supabase database.

1. Open a terminal in the project folder (Cursor: View → Terminal).
2. Run:

   ```powershell
   cd "C:\Users\Admin\Documents\Jastram_Project Management"
   npx prisma migrate deploy
   ```

   If you get errors about migrations, try (only if you’re sure you want a clean state on the new DB):

   ```powershell
   npx prisma db push
   ```

   Then use `migrate deploy` for future runs. When it succeeds, the new database has the correct schema.

---

## Step 5: Create Auth Users in the New Supabase Project

Your app expects users to exist in **Supabase Auth** (so they can log in) and in your **User** table (so they have a role).

1. In the **new** Supabase project, go to **Authentication** → **Users**.
2. Click **Add user** → **Create new user**.
   - **Admin:** email e.g. `smalkawi@jastram.com`, set a password → Create. Then open that user and copy the **User UID** (long UUID).
   - **Test user (optional):** e.g. `test@jastram.com`, set a password → Create. Copy that user’s **User UID** too.
3. Put these in your `.env` for the seed (use the UIDs you just copied):

   ```env
   SEED_ADMIN_EMAIL="smalkawi@jastram.com"
   SEED_ADMIN_AUTH_ID="paste-admin-uuid-here"

   SEED_TEST_USER_EMAIL="test@jastram.com"
   SEED_TEST_USER_AUTH_ID="paste-test-user-uuid-here"
   SEED_TEST_USER_ROLE="VIEWER"
   ```

---

## Step 6: Seed the New Database

This creates Departments and User rows (admin + optional test user) in the new DB, linked to the Auth UIDs from Step 5.

```powershell
cd "C:\Users\Admin\Documents\Jastram_Project Management"
npx prisma db seed
```

You should see something like:
`✓ Admin user: smalkawi@jastram.com (authId: ...)`  
and optionally the test user. If something is missing, check that `SEED_ADMIN_EMAIL` and `SEED_ADMIN_AUTH_ID` (and test user vars) are set correctly in `.env`.

---

## Step 7: Update Vercel Environment Variables

So the **live site** uses the new Supabase project instead of the old one:

1. Go to [vercel.com](https://vercel.com) → your project → **Settings** → **Environment Variables**.
2. For each of these, either **Edit** or **Add** and set the **same** values you put in `.env` for the new Supabase project:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_AUTH_ID` (optional; only needed if you ever run seed from Vercel — usually you don’t).
3. Save. Redeploy the project (Deployments → … on latest → **Redeploy**), or push a small commit so Vercel builds again with the new env.

After the redeploy, the live site will use the new Supabase (new Auth + new database). You can log in with the admin and test users you created in Step 5.

---

## Step 8: Verify Locally and on the Live Site

- **Local:** In the project folder run `npm run dev`, open the app, log in with `smalkawi@jastram.com` (and optionally `test@jastram.com`). Both should work.
- **Live:** Open your Vercel URL and log in with the same accounts. They should work there too.

---

## Summary

| Step | What you do |
|------|----------------|
| 1 | Create a new project in the new Supabase account. |
| 2 | Copy Database URIs and API URL + anon key from the new project. |
| 3 | Update `.env` with new `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_*`. |
| 4 | Run `npx prisma migrate deploy` (or `db push` then `migrate deploy`) so the new DB has the schema. |
| 5 | In new Supabase: Authentication → Add admin (and optional test) user; copy their UIDs into `.env`. |
| 6 | Run `npx prisma db seed` to create User rows and departments. |
| 7 | In Vercel: set the same env vars and redeploy. |
| 8 | Test login locally and on the live site. |

After this, the app (local and production) uses only the new Supabase account. You can leave the old Supabase project as-is or delete it later from the old account.
