import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const speakers = mysqlTable("speakers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  bio: text("bio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Speaker = typeof speakers.$inferSelect;
export type InsertSpeaker = typeof speakers.$inferInsert;

export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  text: text("text").notNull(),
  speakerId: int("speakerId"),
  speakerName: varchar("speakerName", { length: 255 }),
  videoUrl: varchar("videoUrl", { length: 512 }),
  videoTitle: varchar("videoTitle", { length: 512 }),
  topic: varchar("topic", { length: 128 }),
  source: varchar("source", { length: 255 }).default("School of Hard Knocks"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  quoteId: int("quoteId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export const seededFlag = mysqlTable("seeded_flag", {
  id: int("id").autoincrement().primaryKey(),
  seededAt: timestamp("seededAt").defaultNow().notNull(),
});
