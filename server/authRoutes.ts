import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { ENV } from "./_core/env.js";
import { sdk } from "./_core/sdk.js";
import { verifyLoginToken } from "./authTokens.js";
import { getUserByOpenId, upsertUser } from "./db.js";

function page(title: string, body: string): string {
  return `<!doctype html>
<html>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${title}</title></head>
  <body style="margin:0;background:#FAF7F2;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
    <div style="max-width:480px;margin:80px auto;padding:0 24px;text-align:center;">
      <p style="letter-spacing:3px;font-size:12px;color:#B8860B;text-transform:uppercase;">Words of Wisdom</p>
      <h1 style="font-size:28px;font-weight:normal;">${title}</h1>
      <p style="color:#555;line-height:1.6;">${body}</p>
    </div>
  </body>
</html>`;
}

/**
 * Portable email magic-link login — works with any hosting, no Manus OAuth
 * involved. The tRPC mutation auth.requestLoginLink issues the token; this
 * route consumes it and mints the same session cookie the OAuth flow uses,
 * so protectedProcedure/adminProcedure behave identically for both flows.
 */
export function registerAuthRoutes(app: Express) {
  app.get("/api/auth/email", async (req: Request, res: Response) => {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const email = token ? await verifyLoginToken(token) : null;

    if (!email) {
      res
        .status(400)
        .send(page("Link expired", "This sign-in link is invalid or has expired. Request a new one from the login page."));
      return;
    }

    try {
      const openId = `email:${email}`;
      const name = email.split("@")[0] || email;
      const ownerEmail = (process.env.OWNER_EMAIL || "").toLowerCase();
      const existing = await getUserByOpenId(openId);

      await upsertUser({
        openId,
        email,
        name: existing?.name ?? name,
        loginMethod: "email",
        // Promote the configured owner to admin; never demote anyone.
        role: ownerEmail && email === ownerEmail ? "admin" : existing?.role,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.signSession(
        { openId, appId: ENV.appId || "standalone", name: existing?.name ?? name },
        { expiresInMs: ONE_YEAR_MS }
      );

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Auth] Magic-link login failed:", error);
      res
        .status(500)
        .send(page("Something went wrong", "Please try signing in again."));
    }
  });
}
