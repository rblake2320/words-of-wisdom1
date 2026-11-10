const isProduction = process.env.NODE_ENV === "production";

// Sessions and magic-link tokens are signed with this. Production must set
// JWT_SECRET (the server refuses to boot otherwise — see _core/index.ts);
// development falls back to a fixed secret so login works out of the box.
const cookieSecret =
  process.env.JWT_SECRET || (isProduction ? "" : "words-of-wisdom-dev");
if (!process.env.JWT_SECRET && !isProduction) {
  console.warn("[Env] JWT_SECRET not set — using the dev-only fallback secret.");
}

export const ENV = {
  cookieSecret,
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction,
};
