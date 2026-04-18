import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { favorites, InsertUser, quotes, Quote, seededFlag, speakers, subscriptions, users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Quotes ──────────────────────────────────────────────────────────────────

export async function getAllQuotes(search?: string, topic?: string, speakerName?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        like(quotes.text, `%${search}%`),
        like(quotes.speakerName, `%${search}%`),
        like(quotes.videoTitle, `%${search}%`)
      )
    );
  }
  if (topic) conditions.push(eq(quotes.topic, topic));
  if (speakerName) conditions.push(like(quotes.speakerName, `%${speakerName}%`));

  const query = db.select().from(quotes).orderBy(desc(quotes.createdAt));
  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }
  return await query;
}

export async function getQuoteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getDailyQuote(): Promise<Quote | null> {
  const db = await getDb();
  if (!db) return null;

  const allQuotes = await db.select().from(quotes).orderBy(quotes.id);
  if (allQuotes.length === 0) return null;

  // Deterministic daily rotation based on day of year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const idx = dayOfYear % allQuotes.length;
  return allQuotes[idx];
}

export async function insertQuote(data: {
  text: string;
  speakerName?: string;
  videoUrl?: string;
  videoTitle?: string;
  topic?: string;
  source?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(quotes).values({
    text: data.text,
    speakerName: data.speakerName ?? null,
    videoUrl: data.videoUrl ?? null,
    videoTitle: data.videoTitle ?? null,
    topic: data.topic ?? null,
    source: data.source ?? "School of Hard Knocks",
  });
}

export async function deleteQuote(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(quotes).where(eq(quotes.id, id));
}

export async function getTopics() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .selectDistinct({ topic: quotes.topic })
    .from(quotes)
    .where(sql`${quotes.topic} IS NOT NULL`);
  return result.map((r) => r.topic).filter(Boolean) as string[];
}

export async function getSpeakerNames() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .selectDistinct({ speakerName: quotes.speakerName })
    .from(quotes)
    .where(sql`${quotes.speakerName} IS NOT NULL`)
    .orderBy(quotes.speakerName);
  return result.map((r) => r.speakerName).filter(Boolean) as string[];
}

export async function getQuotesBySpeaker(speakerName: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(quotes)
    .where(like(quotes.speakerName, `%${speakerName}%`))
    .orderBy(desc(quotes.createdAt));
}

// ── Favorites ────────────────────────────────────────────────────────────────

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const favs = await db.select().from(favorites).where(eq(favorites.userId, userId));
  const quoteIds = favs.map((f) => f.quoteId);
  if (quoteIds.length === 0) return [];
  const result = await db
    .select()
    .from(quotes)
    .where(sql`${quotes.id} IN (${sql.join(quoteIds.map((id) => sql`${id}`), sql`, `)})`);
  return result;
}

export async function toggleFavorite(userId: number, quoteId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.quoteId, quoteId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.quoteId, quoteId)));
    return { favorited: false };
  } else {
    await db.insert(favorites).values({ userId, quoteId });
    return { favorited: true };
  }
}

export async function getUserFavoriteIds(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const favs = await db.select().from(favorites).where(eq(favorites.userId, userId));
  return favs.map((f) => f.quoteId);
}

// ── Subscriptions ────────────────────────────────────────────────────────────

export async function getSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.active, true)))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertSubscription(userId: number, email: string, active: boolean) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(subscriptions)
      .set({ active, email })
      .where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({ userId, email, active });
  }
}

export async function getAllActiveSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(subscriptions).where(eq(subscriptions.active, true));
}

// ── Seeding ──────────────────────────────────────────────────────────────────

export async function isSeeded() {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(seededFlag).limit(1);
  return result.length > 0;
}

export async function markSeeded() {
  const db = await getDb();
  if (!db) return;
  await db.insert(seededFlag).values({});
}
