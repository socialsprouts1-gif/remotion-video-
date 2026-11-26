import { z } from "zod";

export const BrandKitData = z.object({
  colors: z.array(z.string().regex(/^#[0-9a-fA-F]{3,8}$/)).max(8).default(["#0b0d12", "#ffffff", "#8b7bff"]),
  headlineFont: z.string().default("Syne"),
  bodyFont: z.string().default("Inter"),
  logoAssetId: z.string().nullable().default(null),
  watermarkText: z.string().max(60).default(""),
  watermarkLogo: z.boolean().default(false),
  introTemplateId: z.string().nullable().default(null),
  outroTemplateId: z.string().nullable().default(null),
  musicPreference: z.string().max(200).default(""),
  voice: z.string().max(500).default(""),
});
export type BrandKitData = z.infer<typeof BrandKitData>;
