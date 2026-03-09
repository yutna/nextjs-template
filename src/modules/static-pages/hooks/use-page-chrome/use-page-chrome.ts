"use client";

import { usePathname, useRouter } from "@/shared/lib/navigation";

import type { Locale } from "next-intl";
import type { UsePageChromeOptions, UsePageChromeReturn } from "./types";

export function usePageChrome({
  locale,
}: UsePageChromeOptions): UsePageChromeReturn {
  const pathname = usePathname();
  const router = useRouter();

  function handleSwitchLocale(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return { handleSwitchLocale };
}
