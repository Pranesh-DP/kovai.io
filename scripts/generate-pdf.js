/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

async function generatePDF() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Clearpane User Documentation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    @page {
      size: A4;
      margin: 20mm 18mm 22mm 18mm;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1E293B; /* slate-800 */
      background-color: #FFFFFF;
      line-height: 1.6;
      font-size: 13px;
    }

    /* Cover / Header Section */
    .doc-header {
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }

    .badge {
      display: inline-block;
      background: #EEF2FF;
      color: #4F46E5;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 4px 10px;
      border-radius: 9999px;
      margin-bottom: 12px;
      border: 1px solid #C7D2FE;
    }

    h1.title {
      font-size: 28px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 6px 0;
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-size: 14px;
      color: #64748B;
      margin: 0;
    }

    .metadata-bar {
      display: flex;
      gap: 24px;
      margin-top: 16px;
      font-size: 11px;
      color: #64748B;
    }

    .metadata-bar span strong {
      color: #334155;
    }

    /* Section Headings */
    h2 {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 36px;
      margin-bottom: 14px;
      padding-bottom: 6px;
      border-bottom: 1px solid #E2E8F0;
      page-break-after: avoid;
    }

    h3 {
      font-size: 14px;
      font-weight: 600;
      color: #1E293B;
      margin-top: 20px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 10px 0;
    }

    ul, ol {
      margin: 0 0 14px 0;
      padding-left: 22px;
    }

    li {
      margin-bottom: 6px;
    }

    /* Callout Alert Boxes */
    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      margin: 14px 0;
      font-size: 12.5px;
      page-break-inside: avoid;
    }

    .alert-info {
      background-color: #F0FDF4;
      border-left: 4px solid #10B981;
      color: #065F46;
    }

    .alert-warning {
      background-color: #FFFBEB;
      border-left: 4px solid #F59E0B;
      color: #92400E;
    }

    .alert-danger {
      background-color: #FEF2F2;
      border-left: 4px solid #EF4444;
      color: #991B1B;
    }

    /* Code Blocks */
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      background: #F1F5F9;
      padding: 2px 5px;
      border-radius: 4px;
      color: #0F172A;
    }

    pre {
      background: #0F172A;
      color: #F8FAFC;
      padding: 14px 16px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      line-height: 1.5;
      margin: 12px 0 16px 0;
      page-break-inside: avoid;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 18px 0;
      font-size: 12px;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #CBD5E1;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background-color: #F8FAFC;
      font-weight: 600;
      color: #0F172A;
    }

    /* Page Break Helpers */
    .page-break {
      page-break-before: always;
    }

    .avoid-break {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>

  <div class="doc-header">
    <div class="badge">Official Documentation</div>
    <h1 class="title">Clearpane — User Documentation</h1>
    <p class="subtitle">A calm, minimal task manager built for deliberate personal productivity</p>
    <div class="metadata-bar">
      <span><strong>Stack:</strong> Next.js 16 • React 19 • Supabase • Tailwind CSS</span>
      <span><strong>Security:</strong> Google OAuth 2.0 • PostgreSQL Row-Level Security</span>
      <span><strong>Specification:</strong> WCAG 2.1 AA Accessible</span>
    </div>
  </div>

  <h2>1. How to access and use the application</h2>
  
  <h3>Quick Start Overview</h3>
  <p>Clearpane can be accessed from any desktop, tablet, or mobile browser by visiting <code>https://kovai-io.vercel.app</code>.</p>
  
  <h3>The Dashboard Bento Grid</h3>
  <p>Upon authenticating, users land on the main workspace at <code>/dashboard</code>, structured as a clean visual bento grid:</p>
  <ul>
    <li><strong>Greeting & Quick Add:</strong> Welcomes you based on your browser's local time (morning, afternoon, or evening). Type any task idea into the input and press <code>Enter</code> to launch the task creation dialog pre-filled with your idea.</li>
    <li><strong>Completion Ring:</strong> An interactive, animated circular gauge reflecting your overall completion percentage (e.g., "3 of 5 tasks complete"). Fully disabled under reduced-motion settings.</li>
    <li><strong>Status Distribution Chips:</strong> Clickable statistics chips displaying counts for Planned, In Progress, and Complete tasks. Clicking any chip navigates to <code>/tasks</code> with that filter pre-selected.</li>
    <li><strong>Progress Breakdown:</strong> A proportional multi-colored bar chart visualizing status distribution across your workspace.</li>
    <li><strong>In Focus Now:</strong> Highlights tasks currently in progress, allowing one-click completion.</li>
    <li><strong>Recent Activity:</strong> Chronological audit log showing status changes and timestamps.</li>
  </ul>

  <h3>Managing Tasks</h3>
  <ul>
    <li><strong>Creating a Task:</strong> Click <strong>New task</strong> or press the keyboard shortcut <strong><code>N</code></strong> anywhere in the app. Enter a required Title (1–120 characters) and optional Notes (up to 1,000 characters). Select an initial status (defaults to Planned) and click <strong>Create Task</strong>.</li>
    <li><strong>Changing Status:</strong> On any task card, click the 3-option segmented control (<em>Planned</em>, <em>In Progress</em>, <em>Complete</em>). State updates optimistically in under 16ms with automatic rollback if a network error occurs. Keyboard users can navigate status options using arrow keys.</li>
    <li><strong>Filtering & Searching:</strong> On <code>/tasks</code>, switch between filter tabs (All, Planned, In Progress, Complete) with live counts. The search input filters by title in real-time with a 200ms debounce.</li>
    <li><strong>Editing & Deleting:</strong> Click the card options menu (<code>...</code>) to edit details or delete. Deletion triggers an instant 6-second undo window with a toast notification to prevent accidental loss.</li>
  </ul>

  <h2>2. Login instructions</h2>
  
  <h3>Authentication Steps</h3>
  <ol>
    <li>Navigate to <code>/login</code> (or any protected page, which automatically redirects to login).</li>
    <li>Click <strong>Continue with Google</strong>.</li>
    <li>Select your Google account on the Google OAuth authorization screen.</li>
    <li>Review the requested permissions:
      <ul>
        <li><strong>Email address:</strong> Used exclusively to identify your private account.</li>
        <li><strong>Basic Profile (Name & Picture):</strong> Used strictly to personalize your dashboard greeting and user avatar.</li>
        <li>Clearpane <strong>never</strong> requests access to Google Drive, Gmail, Contacts, or Calendar.</li>
      </ul>
    </li>
  </ol>

  <div class="alert alert-warning">
    <strong>Handling the "Google hasn't verified this app" screen:</strong><br>
    Because Clearpane is an educational evaluation project, the Google OAuth Client may be in Testing mode. If Google displays an "Unverified App" warning:
    <ol style="margin-top: 6px; margin-bottom: 0;">
      <li>Click <strong>Advanced</strong> in the bottom-left of the warning prompt.</li>
      <li>Click <strong>Go to Clearpane (unsafe)</strong> to proceed with login.</li>
      <li>Confirm that your email address is listed as a Test User in the Google Cloud project.</li>
    </ol>
  </div>

  <h3>Troubleshooting Login Issues</h3>
  <ul>
    <li><strong>Sign-in Cancelled or Failed:</strong> If you cancel or Google encounters an error, you will be redirected to <code>/login?error=auth_failed</code> with a friendly alert banner. Simply retry the sign-in.</li>
    <li><strong>Third-Party Cookie Blockers:</strong> Ensure your browser allows cookies from your Supabase domain, or temporarily disable strict tracker blockers that intercept OAuth PKCE exchanges.</li>
  </ul>

  <div class="page-break"></div>

  <h2>3. Important assumptions made</h2>
  
  <p>To ensure a calm, deliberate, and high-quality user experience, the following architectural assumptions were established:</p>
  <ul>
    <li><strong>Strict Account Privacy:</strong> Tasks are private to each Google account. No user can view, edit, or search another user's tasks. Data isolation is enforced by database-level PostgreSQL Row-Level Security (RLS).</li>
    <li><strong>Field Boundaries & Validation:</strong>
      <ul>
        <li><strong>Title:</strong> Required, trimmed of leading/trailing whitespace, between 1 and 120 characters. Whitespace-only titles are rejected.</li>
        <li><strong>Notes:</strong> Optional, up to 1,000 characters. Empty or whitespace-only notes are automatically cleaned and stored as <code>NULL</code>.</li>
      </ul>
    </li>
    <li><strong>Default Status:</strong> All newly created tasks default to <strong>Planned</strong> unless explicitly set otherwise during creation.</li>
    <li><strong>Any-to-Any Status Transitions:</strong> Work is flexible. Tasks can transition directly between any state (e.g. from Planned straight to Complete, or from Complete back to In Progress).</li>
    <li><strong>Chronological Ordering:</strong> Tasks are presented newest first, ordered by <code>created_at DESC</code>.</li>
    <li><strong>Edit and Delete Usability:</strong> While the core assessment specified create, view, and update status, edit and soft-undo delete were added to deliver a complete, realistic user experience.</li>
    <li><strong>Local Time Display:</strong> Timestamps are stored in UTC and rendered in your browser's local time zone to eliminate hydration mismatches and time zone confusion.</li>
    <li><strong>Language:</strong> The interface and validation messages are presented in English.</li>
  </ul>

  <h2>4. Known limitations</h2>
  
  <ul>
    <li><strong>No Multi-User Teams or Sharing:</strong> Clearpane is intentionally built as an individual productivity workspace; shared workspaces, task assignments, and public lists are not included.</li>
    <li><strong>No Due Dates or Notifications:</strong> Clearpane deliberately avoids deadline anxiety; due dates, reminders, and calendar synchronization are excluded.</li>
    <li><strong>No In-App Account Deletion:</strong> Users cannot delete their Google Auth record from within the application interface (handled via the Supabase Auth administration dashboard).</li>
    <li><strong>Concurrent Multi-Tab Editing (Last Write Wins):</strong> If Clearpane is open across multiple browser tabs, updates apply on a "last write wins" basis. Background tab refocus refreshes data automatically (throttled to once per 10s).</li>
    <li><strong>Tab Closure During Undo:</strong> The 6-second undo delete relies on client timers. Closing or refreshing the tab within 6 seconds of clicking Delete cancels the pending deletion to prevent accidental data loss.</li>
    <li><strong>Free-Tier Cold Starts:</strong> Hosting on free-tier platforms (Vercel and Supabase) may exhibit a brief initial wake-up latency after extended inactivity.</li>
    <li><strong>1,000 Task Display Limit:</strong> For peak browser rendering performance, database queries enforce a 1,000 task ceiling.</li>
  </ul>

  <h2>5. Important notes or warnings for users</h2>
  
  <div class="alert alert-danger">
    <strong>Critical User Warnings:</strong>
    <ul style="margin: 6px 0 0 0;">
      <li><strong>Account Separation:</strong> Signing in with a different Google account opens a completely separate, empty workspace. Your tasks belong exclusively to the specific Google account used during creation.</li>
      <li><strong>Permanent Deletion:</strong> Once the 6-second undo toast notification expires, deleted tasks are permanently erased from the PostgreSQL database and cannot be recovered.</li>
      <li><strong>Do Not Store Sensitive Credentials:</strong> Clearpane is intended for everyday productivity. Never store passwords, banking details, private keys, API secrets, or sensitive personally identifiable information (PII) in task titles or notes.</li>
      <li><strong>Evaluation Build:</strong> Clearpane was developed as an assessment project demonstrating full-stack engineering, performance, security, and accessibility standards.</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <h2>6. Setup instructions</h2>

  <p>Follow these instructions to run the complete Clearpane application on your local machine:</p>

  <h3>System Prerequisites</h3>
  <ul>
    <li>Node.js 20+ and npm installed</li>
    <li>Git version control</li>
    <li>A free account at <a href="https://supabase.com">Supabase.com</a></li>
    <li>A project configured in the <a href="https://console.cloud.google.com">Google Cloud Console</a> for OAuth</li>
  </ul>

  <h3>Step 1: Clone Repository & Install Dependencies</h3>
  <pre><code>git clone https://github.com/Pranesh-DP/kovai.io.git
cd kovai.io
npm install</code></pre>

  <h3>Step 2: Database Schema & Row-Level Security</h3>
  <ol>
    <li>Log in to your Supabase dashboard and open the <strong>SQL Editor</strong>.</li>
    <li>Paste the contents of <code>supabase/migrations/0001_tasks.sql</code> into the editor.</li>
    <li>Click <strong>Run</strong> to execute the migration:
      <ul>
        <li>Creates the <code>tasks</code> table and <code>task_status</code> enum.</li>
        <li>Installs the <code>touch_task()</code> trigger with fixed search path.</li>
        <li>Enables Row-Level Security (RLS) with SELECT, INSERT, UPDATE, and DELETE policies.</li>
      </ul>
    </li>
  </ol>

  <h3>Step 3: Configure Google OAuth 2.0 Credentials</h3>
  <ol>
    <li>In Google Cloud Console $\rightarrow$ <strong>APIs & Services</strong> $\rightarrow$ <strong>Credentials</strong>:
      <ul>
        <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web Application).</li>
        <li><strong>Authorised JavaScript origins:</strong> <code>http://localhost:3000</code></li>
        <li><strong>Authorised redirect URIs:</strong> <code>https://&lt;your-supabase-project-ref&gt;.supabase.co/auth/v1/callback</code></li>
      </ul>
    </li>
    <li>In Supabase $\rightarrow$ <strong>Authentication</strong> $\rightarrow$ <strong>Providers</strong> $\rightarrow$ <strong>Google</strong>:
      <ul>
        <li>Enable the Google provider.</li>
        <li>Paste your Google <strong>Client ID</strong> and <strong>Client Secret</strong>, then click <strong>Save</strong>.</li>
      </ul>
    </li>
    <li>In Supabase $\rightarrow$ <strong>Authentication</strong> $\rightarrow$ <strong>URL Configuration</strong>:
      <ul>
        <li>Set <strong>Site URL</strong> to <code>http://localhost:3000</code>.</li>
        <li>Add <code>http://localhost:3000/**</code> to <strong>Redirect URLs</strong>.</li>
      </ul>
    </li>
  </ol>

  <h3>Step 4: Configure Local Environment Variables</h3>
  <p>Create a <code>.env.local</code> file in your project root:</p>
  <pre><code>NEXT_PUBLIC_SUPABASE_URL=https://&lt;your-supabase-project-ref&gt;.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=&lt;your-supabase-anon-or-publishable-key&gt;
NEXT_PUBLIC_SITE_URL=http://localhost:3000</code></pre>

  <h3>Step 5: Run the Development Server</h3>
  <pre><code>npm run dev</code></pre>
  <p>Open <a href="http://localhost:3000">http://localhost:3000</a> in your browser.</p>

  <h3>Step 6: Execute Quality Gates & Test Suites</h3>
  <pre><code># Typecheck
npm run typecheck

# ESLint audit
npm run lint

# Unit & Component Tests (55 tests)
npm run test

# End-to-End Tests (Playwright)
npm run test:e2e</code></pre>

</body>
</html>
`;

  console.log("Launching headless browser to compile PDF...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle" });

  const outputPath = path.resolve(__dirname, "../docs/Clearpane_Documentation.pdf");
  const rootOutputPath = path.resolve(__dirname, "../Clearpane_Documentation.pdf");

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "18mm",
      bottom: "18mm",
      left: "16mm",
      right: "16mm",
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 8px; font-family: -apple-system, sans-serif; color: #94A3B8; width: 100%; text-align: right; padding-right: 18mm;">
        Clearpane — Official Documentation
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 8px; font-family: -apple-system, sans-serif; color: #94A3B8; width: 100%; display: flex; justify-content: space-between; padding-left: 18mm; padding-right: 18mm;">
        <span>Graduate Support Engineer Trainee Assessment</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  });

  // Also copy to root for quick access
  fs.copyFileSync(outputPath, rootOutputPath);

  await browser.close();
  console.log("PDF successfully generated at:");
  console.log(" - " + outputPath);
  console.log(" - " + rootOutputPath);
}

generatePDF().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});

