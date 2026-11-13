# Clearpane Deployment Guide

This guide provides step-by-step instructions for deploying **Clearpane** to production on **Vercel** with **Supabase** and **Google OAuth**.

---

## 1. Prerequisites

Before starting, ensure you have:
1. A **GitHub** account and repository.
2. A **Vercel** account connected to your GitHub.
3. A **Supabase** project with the database schema applied (`supabase/migrations/0001_tasks.sql`).
4. A **Google Cloud Console** project with an OAuth 2.0 Client ID configured for Supabase.

---

## 2. Step-by-Step Deployment Instructions

### Step 1: Push Code to GitHub
Ensure all changes are committed and pushed to your remote GitHub repository:
```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

---

### Step 2: Import Project into Vercel
1. Log in to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New…** $\rightarrow$ **Project**.
3. Select and import your GitHub repository.
4. Keep the Framework Preset as **Next.js** (Next.js 16 with Turbopack will be automatically detected).

---

### Step 3: Configure Environment Variables in Vercel
Before clicking Deploy, expand **Environment Variables** and add the following three variables:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase Project URL (found in Project Settings $\rightarrow$ API). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Your Supabase Project public anon key (Project Settings $\rightarrow$ API). |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | The production URL of your Vercel deployment (or custom domain). |

> [!NOTE]
> If you don't know your exact Vercel production domain before the first deploy, you can set a placeholder (e.g. `https://clearpane.vercel.app`), complete the initial deployment to obtain the assigned domain, update `NEXT_PUBLIC_SITE_URL`, and trigger a redeployment.

Click **Deploy**.

---

### Step 4: Configure Supabase Authentication URLs
Once your Vercel deployment completes, copy the production URL (e.g. `https://clearpane.vercel.app`).

1. Navigate to the **Supabase Dashboard** $\rightarrow$ **Authentication** $\rightarrow$ **URL Configuration**.
2. **Site URL**:
   Set to your production domain:
   ```
   https://your-app.vercel.app
   ```
3. **Redirect URLs**:
   Add the following patterns to the allow-list:
   ```
   https://your-app.vercel.app/**
   https://your-app.vercel.app/auth/callback
   http://localhost:3000/**
   ```
4. Click **Save**.

---

### Step 5: Configure Google Cloud OAuth Client
1. Open the [Google Cloud Console](https://console.cloud.google.com/) $\rightarrow$ **APIs & Services** $\rightarrow$ **Credentials**.
2. Click your OAuth 2.0 Client ID used by Supabase.
3. Under **Authorised JavaScript origins**, add:
   ```
   https://your-app.vercel.app
   ```
4. Under **Authorised redirect URIs**, confirm that the Supabase OAuth callback URL is present:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
   > [!IMPORTANT]
   > Do **NOT** change the Google redirect URI to your Vercel domain. The Google OAuth consent flow must redirect to the Supabase Auth server callback. Supabase then exchanges the authorization code and redirects back to Clearpane's `/auth/callback` via PKCE.

5. Under **OAuth consent screen**:
   - Publish the app to **"In production"**, OR
   - Add evaluators / reviewers under **Test users** so they can authenticate without seeing an authorization error.
6. Click **Save**.

---

### Step 6: Redeploy on Vercel
If you updated `NEXT_PUBLIC_SITE_URL` after the initial deploy:
1. Go to your project on Vercel $\rightarrow$ **Deployments**.
2. Click the three dots on the latest deployment $\rightarrow$ **Redeploy**.
3. Ensure the redeployment completes with the finalized `NEXT_PUBLIC_SITE_URL`.

---

## 3. Post-Deploy Smoke Test Checklist

Execute this checklist on the live production URL to verify end-to-end functionality:

- [ ] **1. Fresh Google Account Sign-In**:
  - Open an incognito browser window and navigate to `https://your-app.vercel.app`.
  - Confirm unauthenticated visit redirects to `/login`.
  - Click **Continue with Google** using an account that has never used the app.
  - Authorize the app on Google's consent screen.
  - Verify smooth redirect to `/dashboard` with a greeting tailored to your name.

- [ ] **2. Task Creation**:
  - Click **New task** (or press the `N` keyboard shortcut).
  - Enter a title (e.g. `Production launch verification`) and optional notes.
  - Click **Create Task**.
  - Verify the modal closes, a success toast notification appears, and the task renders in the UI.

- [ ] **3. Status Transitions (All 3 States)**:
  - Locate the newly created task card on `/tasks`.
  - Click **In Progress**: observe the badge update and status transition to in-progress.
  - Click **Complete**: observe the badge update to a green checkmark.
  - Verify transitions are smooth and optimistic.

- [ ] **4. Dashboard Metrics Verification**:
  - Navigate to `/dashboard`.
  - Confirm the **Completion Ring** reflects the completed task count and percentage.
  - Verify the **Status Chips** and **Progress Breakdown** bar display accurate counts.
  - Verify **Recent Activity** lists the status transition with relative timestamps.

- [ ] **5. Page Refresh & State Hydration**:
  - Hard refresh the page (`Cmd+Shift+R` or `Ctrl+F5`).
  - Verify zero hydration mismatch errors in the browser console.
  - Confirm all tasks and metrics remain consistent with database state.

- [ ] **6. Sign Out**:
  - Open the user menu in the sidebar / mobile bar and click **Sign out**.
  - Confirm the session cookies are cleared and the browser redirects to `/login`.
  - Attempt visiting `/tasks` or `/dashboard` directly; verify immediate redirection to `/login`.

- [ ] **7. Re-Authentication & Data Persistence**:
  - Sign in again with the same Google account.
  - Verify that your previously created task and historical activity remain intact.

- [ ] **8. Mobile Responsive Testing**:
  - Open the production site on a physical mobile device or mobile emulation mode ($\le 390\text{px}$ width).
  - Verify the top mobile navigation bar and hamburger drawer open smoothly.
  - Verify touch targets are comfortable ($\ge 44\times 44\text{px}$).
  - Confirm there is no horizontal scrollbar.

---

## 4. Operational Monitoring & Diagnostics

- **Vercel Logs**: View real-time runtime function logs under the **Logs** tab in the Vercel dashboard.
- **Supabase Logs**: View database queries, auth token exchanges, and error logs under **Logs** $\rightarrow$ **Auth / Postgres** in the Supabase dashboard.
- **Health Verification**: Requests to unrecognized URLs return a clean, static, accessible 404 page (`src/app/not-found.tsx`) with zero server overhead.

