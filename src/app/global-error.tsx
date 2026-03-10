"use client";

import { ErrorGlobal } from "@/shared/components/error-global";

import type { NextErrorProps } from "@/shared/types/next";

export default function GlobalError({
  error,
  reset,
}: Readonly<NextErrorProps>) {
  return (
    <html lang="en">
      {/* eslint-disable-next-line project/no-inline-style -- global-error renders outside all providers; inline style is the only way to reset body margin */}
      <body style={{ margin: 0 }}>
        <ErrorGlobal error={error} reset={reset} />
      </body>
    </html>
  );
}
