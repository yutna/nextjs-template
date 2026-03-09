import "server-only";

import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { ScreenThemeSettings } from "@/modules/theme-settings/screens/screen-theme-settings";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function Page({ params }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <ScreenThemeSettings locale={locale} />;
}
