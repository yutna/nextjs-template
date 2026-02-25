"use client";

import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Provider } from "@/shared/vendor/chakra-ui/provider";
import { Toaster } from "@/shared/vendor/chakra-ui/toaster";

import type { AppProviderProps } from "./types";

export function AppProvider({
  children,
  locale,
  now,
  timeZone,
}: AppProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} now={now} timeZone={timeZone}>
      <NuqsAdapter>
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </NuqsAdapter>
    </NextIntlClientProvider>
  );
}
