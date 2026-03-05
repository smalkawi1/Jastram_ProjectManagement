# Upload This Project to Your New GitHub Account

Follow these steps **in order**. Replace `YOUR_NEW_GITHUB_USERNAME` and `YOUR_NEW_REPO_NAME` with your actual new account username and repo name (e.g. if your new user is `jastram-dev` and the repo is `Jastram_ProjectManagement`, use those).

---

## Step 1: Point Git at Your New Repo

Open **Cursor’s terminal** (View → Terminal or Ctrl+`) and run:

```powershell
cd "C:\Users\Admin\Documents\Jastram_Project Management"
git remote set-url origin https://github.com/YOUR_NEW_GITHUB_USERNAME/YOUR_NEW_REPO_NAME.git
```

Example (if your new username is `jastram-dev` and repo is `Jastram_ProjectManagement`):

```powershell
git remote set-url origin https://github.com/jastram-dev/Jastram_ProjectManagement.git
```

Check that it changed:

```powershell
git remote -v
```

You should see your **new** GitHub URL, not `saedmalkawi`.

---

## Step 2: Sign Out of the Old GitHub Login (So Git Asks Again)

Git on Windows stores your GitHub login. Clear it so the next push asks you to sign in (then you sign in with your **new** account).

**Option A – Using the command line**

In the same terminal, run:

```powershell
echo "protocol=https`nhost=github.com" | git credential reject
```

If you get an error, use Option B.

**Option B – Using Windows Credential Manager**

1. Press **Windows key**, type **Credential Manager**, open it.
2. Click **Windows Credentials**.
3. Under “Generic Credentials”, look for:
   - `git:https://github.com` or
   - `github.com` or
   - Anything that looks like GitHub.
4. Click it → **Remove**.

After this, the next time you run `git push`, Git will ask you to sign in — use your **new** GitHub account.

---

## Step 3: Set Your Git Name and Email (Optional but Recommended)

Use the **email** of your new GitHub account (and any name you like):

```powershell
git config user.name "Your Name"
git config user.email "your-new-github-email@example.com"
```

---

## Step 4: Push This Project to the New Repo

Make sure you’re in the project folder, then run:

```powershell
cd "C:\Users\Admin\Documents\Jastram_Project Management"
git push -u origin master
```

- If the new repo has a default branch called `main` instead of `master`, GitHub might tell you. Then run:  
  `git push -u origin master:main`
- When Git asks you to sign in, use your **new** GitHub account (browser or token).

After this, your project will be on the new GitHub account and Cursor/PowerShell will use that account for this repo until you change the remote or credentials again.

---

## Step 5: Reconnect Vercel to the New Repo (If You Use Vercel)

1. Go to [vercel.com](https://vercel.com) and open your project.
2. **Settings** → **Git** → disconnect the old repo (or delete the project and re-import).
3. **Add New Project** (or **Connect Git Repository**) and choose the **new** GitHub repo under your new account.

Then redeploy so future pushes from this project deploy from the new repo.
