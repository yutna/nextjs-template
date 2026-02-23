import bundleAnalyzer from "@next/bundle-analyzer";

import "./src/shared/config/env";

import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  reactCompiler: true,
};

export default withBundleAnalyzer(nextConfig);
