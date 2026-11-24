import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-only packages that must not be bundled by Next (native binaries / webpack inside).
  serverExternalPackages: ["@remotion/renderer", "@remotion/bundler", "bullmq", "ioredis", "bcryptjs"],
  experimental: {
    // Chunked uploads send up to 8 MB per request.
    serverActions: { bodySizeLimit: "10mb" },
  },
  poweredByHeader: false,
};

export default nextConfig;
