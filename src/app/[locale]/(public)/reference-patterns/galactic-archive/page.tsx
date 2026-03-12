import "server-only";

import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { loadGalacticArchiveQueryState } from "@/modules/reference-patterns/lib/galactic-archive-query-state/server";
import { ScreenReferencePatternsGalacticArchive } from "@/modules/reference-patterns/screens/screen-reference-patterns-galactic-archive";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function Page({ params, searchParams }: Readonly<PageProps>) {
  const { locale } = use(params);
  const { search, side } = use(loadGalacticArchiveQueryState(searchParams));

  setRequestLocale(locale);

  return (
    <ScreenReferencePatternsGalacticArchive
      initialSearchQuery={search}
      locale={locale}
      requestedSide={side}
    />
  );
}
