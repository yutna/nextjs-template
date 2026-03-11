import "server-only";

import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { ScreenReferencePatternsHub } from "@/modules/reference-patterns/screens/screen-reference-patterns-hub";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function Page({ params }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <ScreenReferencePatternsHub locale={locale} />;
}
