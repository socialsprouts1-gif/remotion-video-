import { db } from "@/server/db";
import { PLANS, verifyStripeSignature } from "@/server/services/billing";

/** Stripe webhook: activates plans and grants monthly credits. */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 412 });
  const payload = await req.text();
  if (!verifyStripeSignature(payload, req.headers.get("stripe-signature"), secret)) return new Response("Bad signature", { status: 400 });
  const event = JSON.parse(payload) as { id: string; type: string; data: { object: { metadata?: { plan?: string; userId?: string }; subscription_details?: { metadata?: { plan?: string; userId?: string } }; lines?: { data?: { metadata?: { plan?: string; userId?: string } }[] } } } };
  const obj = event.data.object;
  const meta = obj.metadata?.userId ? obj.metadata : obj.subscription_details?.metadata ?? obj.lines?.data?.[0]?.metadata;
  const userId = meta?.userId;
  const plan = PLANS.find((p) => p.id === meta?.plan);
  if (!userId || !plan) return new Response("ignored", { status: 200 });
  // idempotency: one ledger entry per Stripe event
  if (await db.creditLedger.findFirst({ where: { refId: event.id } })) return new Response("duplicate", { status: 200 });
  if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
    await db.user.update({ where: { id: userId }, data: { plan: plan.id, credits: { increment: plan.credits } } });
    await db.creditLedger.create({ data: { userId, delta: plan.credits, reason: `${plan.name} plan credits`, refId: event.id } });
  } else if (event.type === "customer.subscription.deleted") {
    await db.user.update({ where: { id: userId }, data: { plan: "FREE" } });
    await db.creditLedger.create({ data: { userId, delta: 0, reason: "Subscription ended", refId: event.id } });
  }
  return new Response("ok", { status: 200 });
}
