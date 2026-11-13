import { describe, it, expect } from "vitest";
import { getSafeRedirect, isSafeRedirectPath } from "./safe-redirect";

describe("Safe Redirect Utility", () => {
  it("allows safe internal relative path '/dashboard'", () => {
    expect(getSafeRedirect("/dashboard")).toBe("/dashboard");
    expect(isSafeRedirectPath("/dashboard")).toBe(true);
  });

  it("allows safe internal relative path with query parameters '/tasks?status=planned'", () => {
    expect(getSafeRedirect("/tasks?status=planned")).toBe(
      "/tasks?status=planned",
    );
    expect(isSafeRedirectPath("/tasks?status=planned")).toBe(true);
  });

  it("blocks protocol-relative URL '//evil.com' and falls back to '/dashboard'", () => {
    expect(getSafeRedirect("//evil.com")).toBe("/dashboard");
    expect(isSafeRedirectPath("//evil.com")).toBe(false);
  });

  it("blocks absolute URL 'https://evil.com' and falls back to '/dashboard'", () => {
    expect(getSafeRedirect("https://evil.com")).toBe("/dashboard");
    expect(isSafeRedirectPath("https://evil.com")).toBe(false);
  });

  it("blocks backslash open-redirect bypass '/\\evil.com' and falls back to '/dashboard'", () => {
    expect(getSafeRedirect("/\\evil.com")).toBe("/dashboard");
    expect(isSafeRedirectPath("/\\evil.com")).toBe(false);
  });

  it("blocks empty string and falls back to '/dashboard'", () => {
    expect(getSafeRedirect("")).toBe("/dashboard");
    expect(isSafeRedirectPath("")).toBe(false);
  });

  it("blocks whitespace-only string and falls back to '/dashboard'", () => {
    expect(getSafeRedirect("   ")).toBe("/dashboard");
    expect(isSafeRedirectPath("   ")).toBe(false);
  });

  it("blocks null and falls back to '/dashboard'", () => {
    expect(getSafeRedirect(null)).toBe("/dashboard");
    expect(isSafeRedirectPath(null)).toBe(false);
  });

  it("blocks undefined and falls back to '/dashboard'", () => {
    expect(getSafeRedirect(undefined)).toBe("/dashboard");
    expect(isSafeRedirectPath(undefined)).toBe(false);
  });

  it("respects custom fallback path when provided", () => {
    expect(getSafeRedirect("https://evil.com", "/custom-fallback")).toBe(
      "/custom-fallback",
    );
  });
});

