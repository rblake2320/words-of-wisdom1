import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { checkRateLimit, resetRateLimits } from "./rateLimit";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  getDailyQuote: vi.fn().mockResolvedValue(null),
  getAllQuotes: vi.fn().mockResolvedValue([]),
  getQuoteById: vi.fn().mockResolvedValue(null),
  getTopics: vi.fn().mockResolvedValue([]),
  getSpeakerNames: vi.fn().mockResolvedValue([]),
  getQuotesBySpeaker: vi.fn().mockResolvedValue([]),
  insertQuote: vi.fn().mockResolvedValue(undefined),
  deleteQuote: vi.fn().mockResolvedValue(undefined),
  getUserFavorites: vi.fn().mockResolvedValue([]),
  getUserFavoriteIds: vi.fn().mockResolvedValue([]),
  toggleFavorite: vi.fn().mockResolvedValue({ favorited: true }),
  getSubscription: vi.fn().mockResolvedValue(null),
  upsertSubscription: vi.fn().mockResolvedValue(undefined),
  getAllActiveSubscriptions: vi.fn().mockResolvedValue([]),
  isSeeded: vi.fn().mockResolvedValue(true),
  claimSeedFlag: vi.fn().mockResolvedValue(false),
  releaseSeedFlag: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  getPublicStats: vi.fn().mockResolvedValue({ totalQuotes: 0, totalSpeakers: 0, totalTopics: 0 }),
}));

function createPublicCtx(ip = "203.0.113.1"): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": ip },
      socket: { remoteAddress: ip },
    } as unknown as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("ai.chat input validation", () => {
  beforeEach(() => {
    resetRateLimits();
    delete process.env.GROQ_API_KEY;
  });

  it("returns the placeholder response when GROQ_API_KEY is unset", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.ai.chat({
      messages: [{ role: "user", content: "How do I start a business?" }],
    });
    expect(result).toContain("AI Adviser");
  });

  it("rejects an empty messages array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.ai.chat({ messages: [] })).rejects.toThrow();
  });

  it("rejects more than 30 messages", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const messages = Array.from({ length: 31 }, () => ({
      role: "user" as const,
      content: "hi there",
    }));
    await expect(caller.ai.chat({ messages })).rejects.toThrow();
  });

  it("rejects a message longer than 2000 characters", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.ai.chat({ messages: [{ role: "user", content: "x".repeat(2001) }] })
    ).rejects.toThrow();
  });
});

describe("ai.chat rate limiting", () => {
  beforeEach(() => {
    resetRateLimits();
    delete process.env.GROQ_API_KEY;
  });

  it("throws TOO_MANY_REQUESTS after 10 requests in a minute from one client", async () => {
    const caller = appRouter.createCaller(createPublicCtx("198.51.100.7"));
    const messages = [{ role: "user" as const, content: "hello" }];
    for (let i = 0; i < 10; i++) {
      await caller.ai.chat({ messages });
    }
    await expect(caller.ai.chat({ messages })).rejects.toThrow(/slow down/i);
  });

  it("tracks clients independently by IP", async () => {
    const messagesA = [{ role: "user" as const, content: "hello" }];
    const callerA = appRouter.createCaller(createPublicCtx("198.51.100.8"));
    const callerB = appRouter.createCaller(createPublicCtx("198.51.100.9"));
    for (let i = 0; i < 10; i++) {
      await callerA.ai.chat({ messages: messagesA });
    }
    await expect(callerB.ai.chat({ messages: messagesA })).resolves.toBeTruthy();
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("allows up to the limit and blocks the next request", () => {
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("k", 5, 60_000, now).allowed).toBe(true);
    }
    const blocked = checkRateLimit("k", 5, 60_000, now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) checkRateLimit("k", 5, 60_000, now);
    expect(checkRateLimit("k", 5, 60_000, now).allowed).toBe(false);
    expect(checkRateLimit("k", 5, 60_000, now + 60_001).allowed).toBe(true);
  });
});
