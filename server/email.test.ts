import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isEmailConfigured,
  sendDailyQuoteEmails,
  unsubscribeToken,
  verifyUnsubscribeToken,
} from "./email";
import type { Quote, Subscription } from "../drizzle/schema";

const quote: Quote = {
  id: 1,
  text: 'Work harder than anyone else & never say "quit".',
  speakerId: null,
  speakerName: "Dana White",
  videoUrl: "https://youtube.com/watch?v=test",
  videoTitle: "Test Video",
  videoTimestamp: 90,
  topic: "mindset",
  source: "School of Hard Knocks",
  featured: false,
  createdAt: new Date(),
};

function sub(id: number, email: string): Subscription {
  return { id, userId: id, email, active: true, createdAt: new Date() };
}

describe("unsubscribe tokens", () => {
  it("round-trips for the same subscription id", () => {
    const token = unsubscribeToken(42);
    expect(verifyUnsubscribeToken(42, token)).toBe(true);
  });

  it("rejects a token for a different subscription id", () => {
    expect(verifyUnsubscribeToken(43, unsubscribeToken(42))).toBe(false);
  });

  it("rejects garbage tokens without throwing", () => {
    expect(verifyUnsubscribeToken(42, "not-a-token")).toBe(false);
    expect(verifyUnsubscribeToken(42, "")).toBe(false);
  });
});

describe("sendDailyQuoteEmails", () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.RESEND_API_KEY;
  });

  it("returns null when RESEND_API_KEY is unset (digest mode)", async () => {
    expect(isEmailConfigured()).toBe(false);
    const result = await sendDailyQuoteEmails(quote, [sub(1, "a@example.com")], "https://app.test");
    expect(result).toBeNull();
  });

  it("sends one batch with one personalized email per subscriber", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });
    vi.stubGlobal("fetch", fetchMock);

    const subs = [sub(1, "a@example.com"), sub(2, "b@example.com")];
    const result = await sendDailyQuoteEmails(quote, subs, "https://app.test");

    expect(result).toEqual({ sent: 2, failed: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails/batch");
    expect(init.headers.Authorization).toBe("Bearer re_test_key");

    const body = JSON.parse(init.body);
    expect(body).toHaveLength(2);
    expect(body[0].to).toBe("a@example.com");
    expect(body[1].to).toBe("b@example.com");
    // Each email carries its own signed unsubscribe link, never another subscriber's.
    expect(body[0].html).toContain(`sid=1&amp;token=${unsubscribeToken(1)}`);
    expect(body[1].html).toContain(`sid=2&amp;token=${unsubscribeToken(2)}`);
    expect(body[0].html).not.toContain("b@example.com");
    // Quote text is HTML-escaped.
    expect(body[0].html).toContain("&quot;quit&quot;");
    expect(body[0].headers["List-Unsubscribe"]).toContain("/api/unsubscribe?sid=1");
  });

  it("splits into batches of 100", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });
    vi.stubGlobal("fetch", fetchMock);

    const subs = Array.from({ length: 150 }, (_, i) => sub(i + 1, `u${i + 1}@example.com`));
    const result = await sendDailyQuoteEmails(quote, subs, "https://app.test");

    expect(result).toEqual({ sent: 150, failed: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toHaveLength(100);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toHaveLength(50);
  });

  it("counts a failed batch without throwing", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => "validation error",
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendDailyQuoteEmails(quote, [sub(1, "a@example.com")], "https://app.test");
    expect(result).toEqual({ sent: 0, failed: 1 });
  });
});
