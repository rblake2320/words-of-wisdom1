import type { Express, Request, Response } from "express";
import { deactivateSubscriptionById, getSubscriptionById } from "./db.js";
import { verifyUnsubscribeToken } from "./email.js";

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
 * One-click unsubscribe from daily quote emails. Reached from email links,
 * so it must work without a login session — authenticated by an HMAC token
 * bound to the subscription id instead.
 */
export function registerEmailRoutes(app: Express) {
  app.get("/api/unsubscribe", async (req: Request, res: Response) => {
    const sid = Number(req.query.sid);
    const token = typeof req.query.token === "string" ? req.query.token : "";

    if (!Number.isInteger(sid) || sid <= 0 || !token || !verifyUnsubscribeToken(sid, token)) {
      res
        .status(400)
        .send(page("Invalid link", "This unsubscribe link is invalid or has expired."));
      return;
    }

    try {
      const sub = await getSubscriptionById(sid);
      if (!sub) {
        res.status(404).send(page("Not found", "This subscription no longer exists."));
        return;
      }
      if (sub.active) {
        await deactivateSubscriptionById(sid);
      }
      res.send(
        page(
          "You're unsubscribed",
          "You won't receive any more daily quote emails. You can re-subscribe anytime from the site."
        )
      );
    } catch (error) {
      console.error("[Unsubscribe] error:", error);
      res
        .status(500)
        .send(page("Something went wrong", "Please try the link again in a moment."));
    }
  });
}
