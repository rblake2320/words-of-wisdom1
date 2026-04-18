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
  markSeeded,
  toggleFavorite,
  upsertSubscription,
  getDb,
} from "./db";
import { seedQuotes } from "./seedData";
import { shortsSeedData } from "./shortsSeedData";
import { quotes } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";

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
  const seeded = await isSeeded();
  if (seeded) return 0;

  let count = 0;
  // Seed full-length video quotes
  for (const q of seedQuotes) {
    await db.insert(quotes).values({
      text: q.text,
      speakerName: q.speakerName,
      videoUrl: q.videoUrl ?? null,
      videoTitle: q.videoTitle,
      topic: q.topic,
      source: q.source,
    });
    count++;
  }
  // Seed Shorts quotes
  for (const q of shortsSeedData) {
    await db.insert(quotes).values({
      text: q.quote,
      speakerName: q.speakerName,
      videoUrl: `https://www.youtube.com/shorts/${q.videoId}`,
      videoTitle: q.videoTitle,
      topic: q.topic.toLowerCase(),
      source: "School of Hard Knocks",
    });
    count++;
  }
  await markSeeded();
  console.log(`[Seed] Inserted ${count} quotes (${seedQuotes.length} full-length + ${shortsSeedData.length} shorts)`);
  return count;
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
        `Subscribed emails: ${subs.map(s => s.email).join(", ") || "(none)"}`,
      ].join("\n");

      let sent = 0;
      try {
        // notifyOwner sends to the app owner; for subscriber delivery we include all emails in the content
        await notifyOwner({ title, content });
        sent = subs.length;
      } catch (e) {
        console.error("Notification error:", e);
      }
      return { sent };
    }),
  }),
});

export type AppRouter = typeof appRouter;
