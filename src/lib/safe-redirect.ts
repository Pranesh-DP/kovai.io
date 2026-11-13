/**
 * Validates and sanitizes a redirect target path to prevent open-redirect vulnerabilities.
 *
 * Rules:
 * 1. Must be a non-empty string.
 * 2. Must start with exactly one "/" and not followed by "/" or "\\".
 * 3. Must not contain backslashes "\\".
 * 4. Must not be an absolute URL or protocol-relative URL.
 *
 * Returns the validated relative path, or the fallbackPath if invalid.
 */
export function getSafeRedirect(
  value: string | null | undefined,
  fallbackPath = "/dashboard",
): string {
  if (!value || typeof value !== "string") {
    return fallbackPath;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallbackPath;
  }

  // Must start with a single "/" and not "//" or "/\"
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\")
  ) {
    return fallbackPath;
  }

  // Guard against backslashes anywhere in path
  if (trimmed.includes("\\")) {
    return fallbackPath;
  }

  return trimmed;
}

export function isSafeRedirectPath(
  value: string | null | undefined,
): value is string {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\")
  ) {
    return false;
  }
  if (trimmed.includes("\\")) {
    return false;
  }
  return true;
}

