"use client";

import { ErrorAppBoundary } from "@/shared/components/error-app-boundary";

import type { NextErrorProps } from "@/shared/types/next";

export default function Error({ error, reset }: Readonly<NextErrorProps>) {
  return <ErrorAppBoundary error={error} reset={reset} />;
}
