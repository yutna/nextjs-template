import "server-only";

import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { LandingPage } from "@/features/landing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function Page({ params }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <LandingPage locale={locale} />;
}
