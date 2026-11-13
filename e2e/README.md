# End-to-End (E2E) Testing Guide

This directory contains the automated Playwright end-to-end test suite for **Clearpane**.

## Security & OAuth Philosophy

In production, Clearpane exclusively uses **Google OAuth via Supabase** with server-side PKCE code exchange. 

Google OAuth cannot be headlessly automated in CI/CD without violating Google's Terms of Service, triggering anti-bot challenges, CAPTCHAs, or requiring SMS/2FA. 

To maintain **100% production security**:
- **Zero backdoors**: No email/password login route, developer bypass, or backdoor endpoint has been added to the Next.js application codebase.
- **Isolated test authentication**: In automated test environments, the test runner authenticates out-of-band via the Supabase Auth API directly (`supabase.auth.signInWithPassword`), extracts the JWT session tokens, and injects standard `@supabase/ssr` cookies (`sb-<project-ref>-auth-token`) into the browser context.

When test user credentials (`E2E_USER_EMAIL` and `E2E_USER_PASSWORD`) are not provided in the environment, the authenticated lifecycle test is **cleanly skipped**, while the unauthenticated redirect test runs unconditionally.

---

## Setting Up a Test User

### Option A: Local Supabase (Recommended)

1. Start your local Supabase stack:
   ```bash
   npx supabase start
   ```

2. Create a test user via the Supabase CLI or SQL:
   ```bash
   npx supabase auth users create --email e2e-test@clearpane.local --password "SecureTestPassword123!"
   ```

### Option B: Cloud Supabase Staging Project

1. Open your Supabase Dashboard $\rightarrow$ **Authentication** $\rightarrow$ **Users**.
2. Click **Add User** $\rightarrow$ **Create User**:
   - Email: `e2e-test@clearpane.local`
   - Password: `SecureTestPassword123!`
   - Auto-confirm user: Yes

---

## Running the E2E Tests

### 1. Unauthenticated Tests Only (Default)

With no credentials configured:
```bash
npm run test:e2e
```
This tests route protection (e.g., verifying that `/dashboard` redirects unauthenticated visitors to `/login`), while gracefully skipping the authenticated suite.

### 2. Full Lifecycle Suite (with Authenticated Test User)

Export the environment variables and run Playwright:

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
export E2E_USER_EMAIL="e2e-test@clearpane.local"
export E2E_USER_PASSWORD="SecureTestPassword123!"

# In terminal 1: start the web server
npm run dev

# In terminal 2: execute tests
npx playwright test
```

### 3. Debugging with UI Mode

```bash
npx playwright test --ui
```

