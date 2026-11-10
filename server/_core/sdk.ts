import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import * as db from "../db";
import { ENV } from "./env";
export type SessionPayload = { openId: string; appId: string; name: string };
const key = () => new TextEncoder().encode(ENV.cookieSecret);
export const sdk = {
  async signSession(payload: SessionPayload, options: { expiresInMs?: number } = {}) {
    return new SignJWT(payload).setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(Math.floor((Date.now() + (options.expiresInMs ?? ONE_YEAR_MS)) / 1000)).sign(key());
  },
  async verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
    if (!token) return null;
    try {
      const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
      if (typeof payload.openId !== "string" || !payload.openId || payload.appId !== "words-of-wisdom" || typeof payload.name !== "string") return null;
      return { openId: payload.openId, appId: payload.appId, name: payload.name };
    } catch { return null; }
  },
  async authenticateRequest(req: Request) {
    const session = await this.verifySession(parse(req.headers.cookie || "")[COOKIE_NAME]);
    if (!session) throw ForbiddenError("Invalid session cookie");
    const user = await db.getUserByOpenId(session.openId);
    if (!user) throw ForbiddenError("User not found");
    await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
    return user;
  },
};
