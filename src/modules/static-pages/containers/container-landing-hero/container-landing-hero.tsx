import "server-only";

import { Box } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { LandingHero } from "@/modules/static-pages/components/landing-hero";
import { ScrollIndicator } from "@/modules/static-pages/components/scroll-indicator";
import { ContainerCopyCommand } from "@/modules/static-pages/containers/container-copy-command";
import { ContainerVibeBackground } from "@/modules/static-pages/containers/container-vibe-background";

import type { ContainerLandingHeroProps } from "./types";

export async function ContainerLandingHero({
  locale,
}: Readonly<ContainerLandingHeroProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.landingHero",
  });

  return (
    <Box
      alignItems="center"
      as="section"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      minH="100vh"
      position="relative"
    >
      <ContainerVibeBackground />
      <LandingHero
        copyCommand={<ContainerCopyCommand />}
        getStarted={t("getStarted")}
        subtitle={t("subtitle")}
        title={t("title")}
      />
      <ScrollIndicator />
    </Box>
  );
}
