import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { createSession } from "@/server/auth/session";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fail = (code: string) => NextResponse.redirect(new URL(`/login?error=${code}`, env.appUrl));
  const jar = await cookies();
  const [state, verifier] = (jar.get("g_oauth")?.value ?? "").split(".");
  jar.delete("g_oauth");
  if (!state || state !== url.searchParams.get("state")) return fail("oauth_state");
  const code = url.searchParams.get("code");
  if (!code) return fail("oauth_denied");
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: env.googleClientId, client_secret: env.googleClientSecret, redirect_uri: `${env.appUrl}/api/auth/google/callback`, grant_type: "authorization_code", code_verifier: verifier }),
  });
  if (!tokenRes.ok) return fail("oauth_token");
  const tokens = (await tokenRes.json()) as { access_token: string };
  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${tokens.access_token}` } });
  if (!infoRes.ok) return fail("oauth_userinfo");
  const info = (await infoRes.json()) as { sub: string; email: string; email_verified: boolean; name?: string; picture?: string };
  if (!info.email_verified) return fail("email_unverified");
  const email = info.email.toLowerCase();
  let user = await db.user.findFirst({ where: { OR: [{ googleId: info.sub }, { email }] } });
  if (!user) {
    user = await db.user.create({ data: { email, googleId: info.sub, name: info.name ?? email.split("@")[0], avatarUrl: info.picture, role: env.adminEmails.includes(email) ? "ADMIN" : "USER" } });
    await db.creditLedger.create({ data: { userId: user.id, delta: user.credits, reason: "Welcome credits" } });
  } else if (!user.googleId) {
    user = await db.user.update({ where: { id: user.id }, data: { googleId: info.sub, avatarUrl: user.avatarUrl ?? info.picture } });
  }
  if (user.disabled) return fail("disabled");
  await createSession(user.id);
  return NextResponse.redirect(new URL("/home", env.appUrl));
}
