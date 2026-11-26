import { db } from "../db";
import { HttpError } from "../http";

/** Atomically reserve credits; throws 402 if the balance is too low. */
export async function chargeCredits(userId: string, amount: number, reason: string, refId?: string) {
  if (amount <= 0) return;
  const res = await db.user.updateMany({ where: { id: userId, credits: { gte: amount } }, data: { credits: { decrement: amount } } });
  if (res.count === 0) throw new HttpError(402, `Not enough credits (needs ${amount}).`, "insufficient_credits");
  await db.creditLedger.create({ data: { userId, delta: -amount, reason, refId } });
}

export async function refundCredits(userId: string, amount: number, reason: string, refId?: string) {
  if (amount <= 0) return;
  await db.user.update({ where: { id: userId }, data: { credits: { increment: amount } } });
  await db.creditLedger.create({ data: { userId, delta: amount, reason, refId } });
}

export const PLAN_LIMITS = {
  FREE: { monthlyCredits: 200, storageGb: 2, maxResolution: "1080p", watermark: true, maxRenderMinutes: 2 },
  CREATOR: { monthlyCredits: 2000, storageGb: 50, maxResolution: "4k", watermark: false, maxRenderMinutes: 15 },
  STUDIO: { monthlyCredits: 8000, storageGb: 250, maxResolution: "4k", watermark: false, maxRenderMinutes: 60 },
  ENTERPRISE: { monthlyCredits: 50000, storageGb: 2000, maxResolution: "4k", watermark: false, maxRenderMinutes: 240 },
} as const;
