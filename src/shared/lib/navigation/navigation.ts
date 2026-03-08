import { createNavigation } from "next-intl/navigation";

import { routing } from "@/shared/config/i18n/routing";

// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
export const { getPathname, Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
