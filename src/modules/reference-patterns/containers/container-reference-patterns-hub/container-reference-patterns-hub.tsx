import "server-only";

import { getTranslations } from "next-intl/server";

import { ReferencePatternsHub } from "@/modules/reference-patterns/components/reference-patterns-hub";
import { routes } from "@/shared/routes";

import type { ContainerReferencePatternsHubProps } from "./types";

export async function ContainerReferencePatternsHub({
  locale,
}: Readonly<ContainerReferencePatternsHubProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.referencePatterns.components.referencePatternsHub",
  });

  return (
    <ReferencePatternsHub
      actionLabel={t("actionLabel")}
      description={t("description")}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      items={[
        {
          description: t("items.workflowFoundations.description"),
          href: routes.public.referencePatterns.workflowFoundations.path(),
          statusLabel: t("items.workflowFoundations.statusLabel"),
          title: t("items.workflowFoundations.title"),
        },
        {
          description: t("items.galacticArchive.description"),
          href: routes.public.referencePatterns.galacticArchive.path(),
          statusLabel: t("items.galacticArchive.statusLabel"),
          title: t("items.galacticArchive.title"),
        },
      ]}
    />
  );
}
