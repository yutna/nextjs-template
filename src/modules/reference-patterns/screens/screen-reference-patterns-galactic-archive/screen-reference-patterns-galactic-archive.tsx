import "server-only";

import { ContainerReferencePatternsGalacticArchive } from "@/modules/reference-patterns/containers/container-reference-patterns-galactic-archive";

import type { ScreenReferencePatternsGalacticArchiveProps } from "./types";

export async function ScreenReferencePatternsGalacticArchive({
  initialSearchQuery,
  locale,
  requestedSide,
}: Readonly<ScreenReferencePatternsGalacticArchiveProps>) {
  return (
    <ContainerReferencePatternsGalacticArchive
      initialSearchQuery={initialSearchQuery}
      locale={locale}
      requestedSide={requestedSide}
    />
  );
}
