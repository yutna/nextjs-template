import "server-only";

import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { ScreenReferencePatterns } from "@/modules/reference-patterns/screens/screen-reference-patterns";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function Page({ params }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <ScreenReferencePatterns locale={locale} />;
}
