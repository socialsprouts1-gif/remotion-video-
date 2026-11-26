import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-only packages that must not be bundled by Next (native binaries / webpack inside).
  serverExternalPackages: ["@remotion/renderer", "@remotion/bundler", "bullmq", "ioredis", "bcryptjs"],
  experimental: {
    // Chunked uploads send up to 8 MB per request.
    serverActions: { bodySizeLimit: "10mb" },
  },
  poweredByHeader: false,
  // this app lives in a subfolder of a larger repo; pin tracing to it
  outputFileTracingRoot: path.resolve("."),
};

export default nextConfig;
