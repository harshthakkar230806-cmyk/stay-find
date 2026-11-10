import { z } from "zod";

const SAFE_HOSTNAMES = new Set([
  "duckduckgo.com",
  "www.duckduckgo.com",
  "search.brave.com",
  "www.bing.com",
  "www.mojeek.com",
  "www.searchmeme.com",
  "en.wikipedia.org",
  "www.booking.com",
  "www.agoda.com",
  "www.makemytrip.com",
  "www.goibibo.com",
  "www.google.com",
  "maps.google.com",
]);

const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
/^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^fe80:/i,
  /^::1$/i,
  /^fc00:/i,
  /^fd00:/i,
];

export const SafeExternalUrl = z.string().url();

export type SafeExternalUrl = z.infer<SafeExternalUrl>;

export function isSafeExternalUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const hostname = u.hostname.toLowerCase();
    if (BLOCKED_HOST_PATTERNS.some((p) => p.test(hostname))) return false;
    if (hostname === "metadata.google.internal") return false;
    return true;
  } catch {
    return false;
  }
}

export function isAllowedProviderHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return SAFE_HOSTNAMES.has(h) || h.endsWith(".duckduckgo.com");
}

export function sanitizeRedirectUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw, "https://stayfinder.example");
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!isSafeExternalUrl(u.toString())) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function validateUserUrl(raw: string): { ok: true; url: string } | { ok: false } {
  if (typeof raw !== "string") return { ok: false };
  if (!isSafeExternalUrl(raw)) return { ok: false };
  return { ok: true, url: raw };
}