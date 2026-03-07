import "server-only";
import "@/shared/styles/scrollbar.css";

import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

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

// TODO: translate this metadata
export const metadata: Metadata = {
  title: "Next.js Template",
  description:
    "A Next.js starter designed for developers building in the AI-driven era.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LayoutLocale({
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
      lang={locale}
      className={`${notoSansThai.variable} ${jetBrainsMono.variable}`}
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
