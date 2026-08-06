import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env.js";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
const PURPOSE = "magic-login";

function secret() {
  return new TextEncoder().encode(ENV.cookieSecret || "words-of-wisdom-dev");
}

export async function createLoginToken(
  email: string,
  options: { expiresInMs?: number } = {}
): Promise<string> {
  const expiresAt = Math.floor((Date.now() + (options.expiresInMs ?? MAGIC_LINK_TTL_MS)) / 1000);
  return new SignJWT({ purpose: PURPOSE, email: email.toLowerCase() })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(secret());
}

/** Returns the email the token was issued for, or null if invalid/expired. */
export async function verifyLoginToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (payload.purpose !== PURPOSE || typeof payload.email !== "string" || !payload.email) {
      return null;
    }
    return payload.email;
  } catch {
    return null;
  }
}
