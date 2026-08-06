import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  deleteQuote,
  getAllActiveSubscriptions,
  getAllQuotes,
  getDailyQuote,
  getQuoteById,
  getQuotesBySpeaker,
  getSpeakerNames,
  getSubscription,
  getTopics,
  getUserFavoriteIds,
  getUserFavorites,
  insertQuote,
  isSeeded,
  claimSeedFlag,
  releaseSeedFlag,
  toggleFavorite,
  upsertSubscription,
  getDb,
  getPublicStats,
} from "./db";
import { seedQuotes } from "./seedData";
import { shortsSeedData } from "./shortsSeedData";
import { quotes } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import { aiRouter } from "./aiRouter";

// ── Admin guard ───────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ── Seed helper ───────────────────────────────────────────────────────────────
async function runSeed() {
  const db = await getDb();
  if (!db) return 0;
  if (await isSeeded()) return 0;

  // Claim the seed lock atomically so two instances can't double-seed.
  if (!(await claimSeedFlag())) return 0;

  try {
    const longRows = seedQuotes.map((q) => ({
      text: q.text,
      speakerName: q.speakerName,
      videoUrl: q.videoUrl ?? null,
      videoTitle: q.videoTitle,
      topic: q.topic,
      source: q.source,
    }));
    const shortRows = shortsSeedData.map((q) => ({
      text: q.quote,
      speakerName: q.speakerName,
      videoUrl: `https://www.youtube.com/shorts/${q.videoId}`,
      videoTitle: q.videoTitle,
      topic: q.topic.toLowerCase(),
      source: "School of Hard Knocks",
    }));
    const rows = [...longRows, ...shortRows];
    await db.insert(quotes).values(rows);
    console.log(`[Seed] Inserted ${rows.length} quotes (${longRows.length} full-length + ${shortRows.length} shorts)`);
    return rows.length;
  } catch (error) {
    // Release the lock so a restart can retry a failed seed.
    await releaseSeedFlag().catch(() => {});
    throw error;
  }
}

// Auto-seed on first import
runSeed().catch(console.error);

// ── App Router ────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Quotes ────────────────────────────────────────────────────────────────
  quotes: router({
    daily: publicProcedure.query(async () => {
      return await getDailyQuote();
    }),

    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          topic: z.string().optional(),
          speakerName: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getAllQuotes(input.search, input.topic, input.speakerName);
      }),

    byId: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await getQuoteById(input.id);
    }),

    topics: publicProcedure.query(async () => {
      return await getTopics();
    }),

    speakerNames: publicProcedure.query(async () => {
      return await getSpeakerNames();
    }),
    stats: publicProcedure.query(async () => {
      return await getPublicStats();
    }),
    bySpeaker: publicProcedure
      .input(z.object({ speakerName: z.string() }))
      .query(async ({ input }) => {
        return await getQuotesBySpeaker(input.speakerName);
      }),

    add: adminProcedure
      .input(
        z.object({
          text: z.string().min(5),
          speakerName: z.string().optional(),
          videoUrl: z.string().url().optional().or(z.literal("")),
          videoTitle: z.string().optional(),
          topic: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await insertQuote({
          text: input.text,
          speakerName: input.speakerName,
          videoUrl: input.videoUrl || undefined,
          videoTitle: input.videoTitle,
          topic: input.topic,
        });
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteQuote(input.id);
        return { success: true };
      }),

    seed: adminProcedure.mutation(async () => {
      const count = await runSeed();
      return { count };
    }),
  }),

  // ── Favorites ─────────────────────────────────────────────────────────────
  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserFavorites(ctx.user.id);
    }),

    ids: protectedProcedure.query(async ({ ctx }) => {
      return await getUserFavoriteIds(ctx.user.id);
    }),

    toggle: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await toggleFavorite(ctx.user.id, input.quoteId);
      }),
  }),

  // ── Subscriptions ─────────────────────────────────────────────────────────
  subscriptions: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getSubscription(ctx.user.id);
    }),

    upsert: protectedProcedure
      .input(z.object({ email: z.string().email(), active: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await upsertSubscription(ctx.user.id, input.email, input.active);
        return { success: true };
      }),
  }),

  // ── AI Adviser ───────────────────────────────────────────────────────────────
  ai: aiRouter,

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(async () => {
      const allQuotes = await getAllQuotes();
      const topics = await getTopics();
      const speakers = await getSpeakerNames();
      const subs = await getAllActiveSubscriptions();
      return {
        totalQuotes: allQuotes.length,
        totalTopics: topics.length,
        totalSpeakers: speakers.length,
        totalSubscribers: subs.length,
      };
    }),

    sendDailyNotification: adminProcedure.mutation(async () => {
      const quote = await getDailyQuote();
      if (!quote) return { sent: 0 };

      const subs = await getAllActiveSubscriptions();
      const appUrl = process.env.VITE_APP_ID
        ? `https://${process.env.VITE_APP_ID}.manus.space`
        : "https://words-of-wisdom.manus.space";

      const speaker = quote.speakerName ?? "School of Hard Knocks";
      const title = `📖 Daily Wisdom — ${speaker}`;
      // notifyOwner reaches only the app owner (Manus has no subscriber email
      // channel). This is an owner digest; wiring a real email provider is a
      // prerequisite for actual subscriber delivery. Never include subscriber
      // email addresses in notification content.
      const content = [
        `Today's quote from ${speaker}:`,
        ``,
        `"${quote.text}"`,
        ``,
        `— ${speaker}`,
        quote.videoUrl ? `Source: ${quote.videoUrl}` : `Source: School of Hard Knocks`,
        ``,
        `Read today's wisdom: ${appUrl}`,
        ``,
        `Active subscribers: ${subs.length}`,
      ].join("\n");

      let notified = false;
      try {
        notified = await notifyOwner({ title, content });
      } catch (e) {
        console.error("Notification error:", e);
      }
      return { sent: notified ? 1 : 0, subscriberCount: subs.length };
    }),
  }),
});

export type AppRouter = typeof appRouter;
