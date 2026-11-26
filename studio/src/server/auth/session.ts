import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import type { User } from "@prisma/client";
import { db } from "../db";
import { HttpError } from "../http";

export const SESSION_COOKIE = "lumora_session";
const SESSION_DAYS = 30;

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const h = await headers();
  await db.session.create({
    data: {
      tokenHash: sha256(token),
      userId,
      userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      expiresAt: new Date(Date.now() + SESSION_DAYS * 864e5),
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

export type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "plan" | "credits" | "avatarUrl">;

export async function getUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const s = await db.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true, plan: true, credits: true, avatarUrl: true, disabled: true } } },
  });
  if (!s || s.expiresAt < new Date() || s.user.disabled) return null;
  const { disabled: _d, ...user } = s.user;
  return user;
}

export async function requireUser(): Promise<SessionUser> {
  const u = await getUser();
  if (!u) throw new HttpError(401, "Not signed in");
  return u;
}

export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (u.role !== "ADMIN") throw new HttpError(403, "Admins only");
  return u;
}
