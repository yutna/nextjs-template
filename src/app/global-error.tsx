"use client";

import { ErrorGlobal } from "@/shared/components/error-global";

import type { NextErrorProps } from "@/shared/types/next";

export default function GlobalError({ error, reset }: NextErrorProps) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ErrorGlobal error={error} reset={reset} />
      </body>
    </html>
  );
}
