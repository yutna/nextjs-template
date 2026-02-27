"use client";

import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { formats } from "@/shared/config/i18n/formats";
import { Provider } from "@/shared/vendor/chakra-ui/provider";
import { Toaster } from "@/shared/vendor/chakra-ui/toaster";

import type { AppProviderProps } from "./types";

export function AppProvider({
  children,
  locale,
  messages,
  now,
  timeZone,
}: AppProviderProps) {
  return (
    <NextIntlClientProvider
      formats={formats}
      locale={locale}
      messages={messages}
      now={now}
      timeZone={timeZone}
    >
      <NuqsAdapter>
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </NuqsAdapter>
    </NextIntlClientProvider>
  );
}
