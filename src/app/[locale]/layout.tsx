import "server-only";
import "@/shared/styles/scrollbar.css";
import "@/modules/static-pages/styles/vibe.css";

import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import { jetBrainsMono, notoSansThai } from "@/shared/config/fonts";
import { routing } from "@/shared/config/i18n/routing";
import { TIME_ZONE } from "@/shared/constants/timezone";
import { AppProvider } from "@/shared/providers/app-provider";

import type { Metadata } from "next";
import type { AbstractIntlMessages } from "next-intl";
import type { ReactNode } from "react";

interface LayoutLocaleProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: Pick<LayoutLocaleProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common.metadata" });

  return {
    description: t("description"),
    title: t("title"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Layout({
  children,
  params,
}: Readonly<LayoutLocaleProps>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages
  const messages = (await getMessages()) as unknown as AbstractIntlMessages;

  return (
    <html
      className={`${notoSansThai.variable} ${jetBrainsMono.variable}`}
      lang={locale}
      suppressHydrationWarning
    >
      <body className={notoSansThai.className}>
        <AppProvider
          locale={locale}
          messages={messages}
          now={new Date()}
          timeZone={TIME_ZONE}
        >
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
