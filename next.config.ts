import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The first-run price-list seed is read from disk at runtime, so make sure
  // it ships with the serverless bundle.
  outputFileTracingIncludes: {
    "/**": ["./data/catalog/**"],
  },
};

export default nextConfig;
