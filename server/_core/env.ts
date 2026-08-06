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
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret,
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
