import type { AssetKind } from "@prisma/client";
import { db } from "@/server/db";
import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { assetDto } from "@/server/services/assets";

export const GET = route(async (req: Request) => {
  const u = await requireUser();
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind")?.toUpperCase() as AssetKind | undefined;
  const q = url.searchParams.get("q") ?? "";
  const assets = await db.asset.findMany({
    where: { ownerId: u.id, ...(kind ? { kind } : {}), ...(q ? { name: { contains: q, mode: "insensitive" } } : {}), status: "ready", NOT: { storageKey: { startsWith: "pending/" } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return json({ assets: assets.map(assetDto) });
});
