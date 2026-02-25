import "server-only";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { jetBrainsMono, notoSansThai } from "@/shared/config/fonts";
import { routing } from "@/shared/config/i18n/routing";
import { Provider } from "@/shared/vendor/chakra-ui/provider";
import { Toaster } from "@/shared/vendor/chakra-ui/toaster";

import type { Metadata } from "next";
import type { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Next.js Template",
  description:
    "A Next.js starter designed for developers building in the AI-driven era.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<RootLayoutProps>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${notoSansThai.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className={notoSansThai.className}>
        <NextIntlClientProvider>
          <NuqsAdapter>
            <Provider>
              {children}
              <Toaster />
            </Provider>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
