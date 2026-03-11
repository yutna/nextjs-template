import "server-only";

import { ContainerReferencePatternsHub } from "@/modules/reference-patterns/containers/container-reference-patterns-hub";

import type { ScreenReferencePatternsHubProps } from "./types";

export async function ScreenReferencePatternsHub({
  locale,
}: Readonly<ScreenReferencePatternsHubProps>) {
  return <ContainerReferencePatternsHub locale={locale} />;
}
