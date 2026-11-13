/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

async function capture() {
  const artifactDir = "/Users/lokii/.gemini/antigravity/brain/9e4bed96-b398-4846-afe5-b8fb8b182e0f";
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log("Navigating to login page...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const loginPath = path.join(artifactDir, "preview_login.png");
  await page.screenshot({ path: loginPath });
  console.log("Saved login screenshot to", loginPath);

  console.log("Navigating to preview dashboard...");
  await page.goto("http://localhost:3000/preview", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const dashPath = path.join(artifactDir, "preview_dashboard.png");
  await page.screenshot({ path: dashPath });
  console.log("Saved dashboard screenshot to", dashPath);

  console.log("Switching to Tasks Board view...");
  await page.locator('button:has-text("Tasks Board")').first().click();
  await page.waitForTimeout(1000);
  const tasksPath = path.join(artifactDir, "preview_tasks.png");
  await page.screenshot({ path: tasksPath });
  console.log("Saved tasks screenshot to", tasksPath);

  await browser.close();
  console.log("All screenshots captured successfully!");
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});

