import "server-only";
import { notoSansThai } from "@/shared/config/fonts";

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
    <html lang="en">
      <body className={notoSansThai.variable}>{children}</body>
    </html>
  );
}
