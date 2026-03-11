import "server-only";

import { Box } from "@chakra-ui/react";

import { ContainerFormReferenceNote } from "@/modules/reference-patterns/containers/container-form-reference-note";
import { ContainerGridReferencePatterns } from "@/modules/reference-patterns/containers/container-grid-reference-patterns";

import type { ScreenReferencePatternsProps } from "./types";

export async function ScreenReferencePatterns({
  locale,
}: Readonly<ScreenReferencePatternsProps>) {
  return (
    <Box as="main">
      <ContainerGridReferencePatterns locale={locale} />
      <ContainerFormReferenceNote />
    </Box>
  );
}
