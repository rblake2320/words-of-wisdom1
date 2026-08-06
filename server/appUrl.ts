import { ENV } from "./_core/env.js";

/**
 * Canonical public URL of the app. APP_URL wins (standalone/self-hosted),
 * then the Manus-derived domain, then localhost for dev.
 */
export function getAppUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (ENV.appId) return `https://${ENV.appId}.manus.space`;
  return `http://localhost:${process.env.PORT || "3000"}`;
}
