import crypto from "node:crypto";
import { HttpError } from "../http";

export const PLANS = [
  { id: "FREE", name: "Free", price: 0, credits: 200, features: ["1080p export with watermark", "2 GB storage", "All editor & motion tools", "Basic planner / command parser"] },
  { id: "CREATOR", name: "Creator", price: 24, credits: 2000, features: ["4K export, no watermark", "50 GB storage", "2,000 AI credits / month", "Priority render queue"] },
  { id: "STUDIO", name: "Studio", price: 79, credits: 8000, features: ["Everything in Creator", "250 GB storage", "8,000 AI credits / month", "Collaboration seats"] },
] as const;

const priceEnv: Record<string, string | undefined> = { CREATOR: process.env.STRIPE_PRICE_CREATOR, STUDIO: process.env.STRIPE_PRICE_STUDIO };

export function stripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_CREATOR && !!process.env.STRIPE_PRICE_STUDIO;
}

/** Create a Stripe Checkout session (subscription) via the REST API. */
export async function createCheckout(opts: { plan: "CREATOR" | "STUDIO"; userId: string; email: string; appUrl: string }) {
  if (!stripeConfigured()) throw new HttpError(412, "Payments aren't configured on this server (STRIPE_SECRET_KEY / STRIPE_PRICE_*).", "integration_required");
  const body = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": priceEnv[opts.plan]!,
    "line_items[0][quantity]": "1",
    customer_email: opts.email,
    client_reference_id: opts.userId,
    "metadata[plan]": opts.plan,
    "metadata[userId]": opts.userId,
    "subscription_data[metadata][plan]": opts.plan,
    "subscription_data[metadata][userId]": opts.userId,
    success_url: `${opts.appUrl}/settings?billing=success`,
    cancel_url: `${opts.appUrl}/settings?billing=canceled`,
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "content-type": "application/x-www-form-urlencoded" }, body });
  const j = (await res.json()) as { url?: string; error?: { message: string } };
  if (!res.ok || !j.url) throw new HttpError(502, `Stripe: ${j.error?.message ?? res.status}`);
  return j.url;
}

/** Verify a Stripe webhook signature header (t=..., v1=...). */
export function verifyStripeSignature(payload: string, header: string | null, secret: string, toleranceSec = 300) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const sigs = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  return sigs.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}
