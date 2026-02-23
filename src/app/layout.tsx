import "server-only";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { jetBrainsMono, notoSansThai } from "@/shared/config/fonts";
import { Provider } from "@/shared/vendor/chakra-ui/provider";
import { Toaster } from "@/shared/vendor/chakra-ui/toaster";

import type { Metadata } from "next";
import type { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Next.js Template",
  description:
    "A Next.js starter designed for developers building in the AI-driven era.",
};

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="en"
      className={`${notoSansThai.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className={notoSansThai.className}>
        <NuqsAdapter>
          <Provider>
            {children}
            <Toaster />
          </Provider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
