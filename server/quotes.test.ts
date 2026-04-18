import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getDailyQuote: vi.fn().mockResolvedValue({
    id: 1,
    text: "Work harder than anyone else.",
    speakerName: "Dana White",
    videoUrl: "https://youtube.com/watch?v=test",
    videoTitle: "Test Video",
    topic: "mindset",
    source: "School of Hard Knocks",
    createdAt: new Date(),
    speakerId: null,
    featured: false,
  }),
  getAllQuotes: vi.fn().mockResolvedValue([
    {
      id: 1,
      text: "Work harder than anyone else.",
      speakerName: "Dana White",
      videoUrl: "https://youtube.com/watch?v=test",
      videoTitle: "Test Video",
      topic: "mindset",
      source: "School of Hard Knocks",
      createdAt: new Date(),
      speakerId: null,
      featured: false,
    },
  ]),
  getQuoteById: vi.fn().mockResolvedValue({
    id: 1,
    text: "Work harder than anyone else.",
    speakerName: "Dana White",
    videoUrl: null,
    videoTitle: null,
    topic: "mindset",
    source: "School of Hard Knocks",
    createdAt: new Date(),
    speakerId: null,
    featured: false,
  }),
  getTopics: vi.fn().mockResolvedValue(["mindset", "entrepreneurship", "wealth"]),
  getSpeakerNames: vi.fn().mockResolvedValue(["Dana White", "Alex Hormozi"]),
  getQuotesBySpeaker: vi.fn().mockResolvedValue([]),
  insertQuote: vi.fn().mockResolvedValue(undefined),
  deleteQuote: vi.fn().mockResolvedValue(undefined),
  getUserFavorites: vi.fn().mockResolvedValue([]),
  getUserFavoriteIds: vi.fn().mockResolvedValue([1]),
  toggleFavorite: vi.fn().mockResolvedValue({ favorited: true }),
  getSubscription: vi.fn().mockResolvedValue(null),
  upsertSubscription: vi.fn().mockResolvedValue(undefined),
  getAllActiveSubscriptions: vi.fn().mockResolvedValue([]),
  isSeeded: vi.fn().mockResolvedValue(true),
  markSeeded: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./seedData", () => ({
  seedQuotes: [],
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "user-1",
      email: "user@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "admin-1",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("quotes.daily", () => {
  it("returns the daily quote for public users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.quotes.daily();
    expect(result).toBeTruthy();
    expect(result?.speakerName).toBe("Dana White");
  });
});

describe("quotes.list", () => {
  it("returns all quotes for public users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.quotes.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("quotes.topics", () => {
  it("returns available topics", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const topics = await caller.quotes.topics();
    expect(topics).toContain("mindset");
  });
});

describe("quotes.add (admin only)", () => {
  it("allows admin to add a quote", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.quotes.add({
      text: "Never give up on your dreams.",
      speakerName: "Test Speaker",
      topic: "mindset",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.quotes.add({ text: "Test quote", speakerName: "Test" })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.quotes.add({ text: "Test quote" })
    ).rejects.toThrow();
  });
});

describe("favorites.toggle", () => {
  it("allows authenticated users to toggle favorites", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.favorites.toggle({ quoteId: 1 });
    expect(result).toHaveProperty("favorited");
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.favorites.toggle({ quoteId: 1 })).rejects.toThrow();
  });
});

describe("favorites.ids", () => {
  it("returns favorite IDs for authenticated users", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const ids = await caller.favorites.ids();
    expect(Array.isArray(ids)).toBe(true);
  });
});

describe("admin.stats", () => {
  it("allows admin to view stats", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const stats = await caller.admin.stats();
    expect(stats).toHaveProperty("totalQuotes");
    expect(stats).toHaveProperty("totalSpeakers");
  });

  it("rejects non-admin users from stats", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.admin.stats()).rejects.toThrow();
  });
});
