"use client";

import { PageChrome } from "@/modules/static-pages/components/page-chrome";
import { usePathname, useRouter } from "@/shared/lib/navigation";

import type { Locale } from "next-intl";
import type { ContainerPageChromeProps } from "./types";

export function ContainerPageChrome({
  locale,
}: Readonly<ContainerPageChromeProps>) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLocaleSwitch(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return <PageChrome locale={locale} onLocaleSwitch={handleLocaleSwitch} />;
}
