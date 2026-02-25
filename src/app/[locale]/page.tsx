import "server-only";

import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { WelcomeScreen } from "@/modules/static-pages/screens";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function Page({ params }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <WelcomeScreen locale={locale} />;
}
