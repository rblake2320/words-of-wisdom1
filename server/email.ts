import crypto from "crypto";
import { ENV } from "./_core/env.js";
import type { Quote, Subscription } from "../drizzle/schema.js";

const RESEND_BATCH_URL = "https://api.resend.com/emails/batch";
const BATCH_SIZE = 100; // Resend batch API limit

// Falls back to Resend's shared test sender; set EMAIL_FROM once the
// jamesdumoulin/words-of-wisdom domain is verified in Resend.
function fromAddress(): string {
  return process.env.EMAIL_FROM || "Words of Wisdom <onboarding@resend.dev>";
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

// ── Unsubscribe tokens (HMAC over the subscription id, no login needed) ─────

export function unsubscribeToken(subscriptionId: number): string {
  return crypto
    .createHmac("sha256", ENV.cookieSecret || "words-of-wisdom-dev")
    .update(`unsub:${subscriptionId}`)
    .digest("hex");
}

export function verifyUnsubscribeToken(subscriptionId: number, token: string): boolean {
  const expected = unsubscribeToken(subscriptionId);
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token, "utf8"), Buffer.from(expected, "utf8"));
}

// ── Daily quote email ────────────────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dailyQuoteHtml(quote: Quote, appUrl: string, unsubscribeUrl: string): string {
  const speaker = escapeHtml(quote.speakerName ?? "School of Hard Knocks");
  const text = escapeHtml(quote.text);
  const sourceLink = quote.videoUrl
    ? `<a href="${escapeHtml(quote.videoUrl)}" style="color:#B8860B;">Watch the source video</a>`
    : "";
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FAF7F2;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <p style="text-align:center;letter-spacing:3px;font-size:12px;color:#B8860B;text-transform:uppercase;margin:0 0 32px;">Words of Wisdom — Daily Quote</p>
      <p style="font-size:24px;line-height:1.5;font-style:italic;text-align:center;margin:0 0 24px;">&ldquo;${text}&rdquo;</p>
      <p style="text-align:center;font-size:14px;letter-spacing:1px;color:#555;margin:0 0 32px;">— ${speaker}</p>
      <p style="text-align:center;margin:0 0 8px;">${sourceLink}</p>
      <p style="text-align:center;margin:0 0 40px;"><a href="${escapeHtml(appUrl)}" style="color:#B8860B;">Read today&rsquo;s wisdom on the site</a></p>
      <hr style="border:none;border-top:1px solid #e8e0d0;margin:0 0 16px;" />
      <p style="text-align:center;font-size:11px;color:#999;margin:0;">
        You&rsquo;re receiving this because you subscribed to daily quotes.
        <a href="${escapeHtml(unsubscribeUrl)}" style="color:#999;">Unsubscribe</a>
      </p>
    </div>
  </body>
</html>`;
}

export interface EmailSendResult {
  sent: number;
  failed: number;
}

const RESEND_SEND_URL = "https://api.resend.com/emails";

/** Send a single email via Resend. Returns false when unconfigured or failed. */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const resp = await fetch(RESEND_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromAddress(), to, subject, html }),
    });
    if (!resp.ok) {
      const detail = await resp.text().catch(() => "");
      console.error(`[Email] Resend send failed (${resp.status}): ${detail.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[Email] Resend send error:", error);
    return false;
  }
}

export function loginLinkHtml(loginUrl: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FAF7F2;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
    <div style="max-width:480px;margin:0 auto;padding:40px 24px;text-align:center;">
      <p style="letter-spacing:3px;font-size:12px;color:#B8860B;text-transform:uppercase;margin:0 0 32px;">Words of Wisdom</p>
      <h1 style="font-size:24px;font-weight:normal;margin:0 0 16px;">Sign in to Words of Wisdom</h1>
      <p style="color:#555;line-height:1.6;margin:0 0 32px;">Click the button below to sign in. This link expires in 15 minutes and can only be used once per session.</p>
      <p style="margin:0 0 32px;"><a href="${escapeHtml(loginUrl)}" style="display:inline-block;background:#B8860B;color:#fff;text-decoration:none;padding:12px 32px;letter-spacing:1px;">Sign In</a></p>
      <p style="font-size:11px;color:#999;margin:0;">If you didn&rsquo;t request this, you can safely ignore this email.</p>
    </div>
  </body>
</html>`;
}

/**
 * Send the daily quote to every active subscriber via Resend's batch API
 * (one email per subscriber — recipients never see each other's addresses).
 * Returns null when RESEND_API_KEY is not configured.
 */
export async function sendDailyQuoteEmails(
  quote: Quote,
  subscribers: Subscription[],
  appUrl: string
): Promise<EmailSendResult | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const speaker = quote.speakerName ?? "School of Hard Knocks";
  const subject = `📖 Daily Wisdom — ${speaker}`;

  const payloads = subscribers.map((sub) => {
    const unsubscribeUrl = `${appUrl}/api/unsubscribe?sid=${sub.id}&token=${unsubscribeToken(sub.id)}`;
    return {
      from: fromAddress(),
      to: sub.email,
      subject,
      html: dailyQuoteHtml(quote, appUrl, unsubscribeUrl),
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
      },
    };
  });

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < payloads.length; i += BATCH_SIZE) {
    const chunk = payloads.slice(i, i + BATCH_SIZE);
    try {
      const resp = await fetch(RESEND_BATCH_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chunk),
      });
      if (resp.ok) {
        sent += chunk.length;
      } else {
        failed += chunk.length;
        const detail = await resp.text().catch(() => "");
        console.error(`[Email] Resend batch failed (${resp.status}): ${detail.slice(0, 300)}`);
      }
    } catch (error) {
      failed += chunk.length;
      console.error("[Email] Resend batch error:", error);
    }
  }

  return { sent, failed };
}
