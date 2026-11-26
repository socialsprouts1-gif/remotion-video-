import crypto from "node:crypto";
import { env, requireSecret } from "../env";

/** Short-lived signed access to a media path, used by render workers and AI providers that need public URLs. */
export function signPath(p: string, ttlSec = 6 * 3600) {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const sig = crypto.createHmac("sha256", requireSecret()).update(`${p}:${exp}`).digest("base64url");
  return `${p}${p.includes("?") ? "&" : "?"}exp=${exp}&sig=${sig}`;
}

export function verifySignature(p: string, exp: string | null, sig: string | null) {
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  const expected = crypto.createHmac("sha256", requireSecret()).update(`${p}:${exp}`).digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function absoluteSigned(p: string, ttlSec?: number) {
  return `${env.appUrl.replace(/\/$/, "")}${signPath(p, ttlSec)}`;
}
