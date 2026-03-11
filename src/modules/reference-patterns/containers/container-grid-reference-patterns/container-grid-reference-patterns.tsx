import "server-only";

import { getTranslations } from "next-intl/server";

import { GridReferencePatterns } from "@/modules/reference-patterns/components/grid-reference-patterns";
import { REFERENCE_PATTERN_DEFINITIONS } from "@/modules/reference-patterns/constants/reference-pattern-definitions";

import type { ContainerGridReferencePatternsProps } from "./types";

export async function ContainerGridReferencePatterns({
  locale,
}: Readonly<ContainerGridReferencePatternsProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.referencePatterns.components.gridReferencePatterns",
  });

  const items = REFERENCE_PATTERN_DEFINITIONS.map((definition) => ({
    codePath: definition.codePath,
    description: t(definition.descriptionKey as Parameters<typeof t>[0]),
    kind: t(definition.kindKey as Parameters<typeof t>[0]),
    title: t(definition.titleKey as Parameters<typeof t>[0]),
  }));

  return (
    <GridReferencePatterns
      description={t("description")}
      heading={t("heading")}
      items={items}
    />
  );
}
