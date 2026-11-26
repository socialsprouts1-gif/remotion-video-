import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/server/env";

/** Starts Google OAuth (authorization code flow with state + PKCE). */
export async function GET() {
  if (!env.googleClientId || !env.googleClientSecret) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", env.appUrl));
  }
  const state = crypto.randomBytes(16).toString("base64url");
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  const jar = await cookies();
  jar.set("g_oauth", `${state}.${verifier}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: `${env.appUrl}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return NextResponse.redirect(url);
}
