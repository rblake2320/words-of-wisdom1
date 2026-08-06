import { describe, expect, it } from "vitest";
import { createLoginToken, verifyLoginToken } from "./authTokens";

describe("magic-link login tokens", () => {
  it("round-trips and lowercases the email", async () => {
    const token = await createLoginToken("James@Example.com");
    expect(await verifyLoginToken(token)).toBe("james@example.com");
  });

  it("rejects garbage tokens", async () => {
    expect(await verifyLoginToken("not-a-jwt")).toBeNull();
    expect(await verifyLoginToken("")).toBeNull();
  });

  it("rejects expired tokens", async () => {
    const token = await createLoginToken("a@example.com", { expiresInMs: -1000 });
    expect(await verifyLoginToken(token)).toBeNull();
  });

  it("rejects a session JWT that lacks the magic-login purpose", async () => {
    // A token signed with the same secret but a different shape must not
    // grant a login (e.g. someone replaying the session cookie value).
    const { SignJWT } = await import("jose");
    const secret = new TextEncoder().encode("words-of-wisdom-dev");
    const other = await new SignJWT({ email: "a@example.com" })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(Math.floor(Date.now() / 1000) + 600)
      .sign(secret);
    expect(await verifyLoginToken(other)).toBeNull();
  });
});
