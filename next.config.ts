import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";

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

const withNextIntl = createNextIntlPlugin(
  "./src/shared/config/i18n/request.tsx",
);

export default withBundleAnalyzer(withNextIntl(nextConfig));
