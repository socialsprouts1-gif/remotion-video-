/** Server-side configuration. Secrets never leave the server. */
export const env = {
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  appSecret: process.env.APP_SECRET ?? "",
  storageDriver: (process.env.STORAGE_DRIVER ?? "local") as "local" | "s3",
  storageDir: process.env.STORAGE_DIR ?? "./storage",
  redisUrl: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  adminEmails: (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
  mockProvider: process.env.ENABLE_MOCK_PROVIDER === "true" && process.env.NODE_ENV !== "production",
  stripeKey: process.env.STRIPE_SECRET_KEY ?? "",
};

export function requireSecret(): string {
  if (!env.appSecret || env.appSecret.length < 32) throw new Error("APP_SECRET must be set to at least 32 characters (see .env.example)");
  return env.appSecret;
}
