import { describe, expect, it } from "vitest";
import { sdk } from "./_core/sdk";

describe("standalone sessions", () => {
  const identity = { openId: "email:review@example.com", appId: "words-of-wisdom", name: "Reviewer" };
  it("accepts a signed application session", async () => {
    expect(await sdk.verifySession(await sdk.signSession(identity))).toEqual(identity);
  });
  it("rejects tokens from a different application", async () => {
    expect(await sdk.verifySession(await sdk.signSession({ ...identity, appId: "other" }))).toBeNull();
  });
  it("rejects tampered and expired tokens", async () => {
    const token = await sdk.signSession(identity);
    const parts = token.split(".");
    parts[1] = Buffer.from(JSON.stringify({ ...identity, name: "Forged" })).toString("base64url");
    expect(await sdk.verifySession(parts.join("."))).toBeNull();
    expect(await sdk.verifySession(await sdk.signSession(identity, { expiresInMs: -60000 }))).toBeNull();
  });
});
