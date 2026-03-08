import "server-only";

import { Box } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { LandingHero } from "@/modules/static-pages/components/landing-hero";
import { ScrollIndicator } from "@/modules/static-pages/components/scroll-indicator";
import { VibeBackground } from "@/modules/static-pages/components/vibe-background";

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
      <VibeBackground />
      <LandingHero
        getStarted={t("getStarted")}
        subtitle={t("subtitle")}
        title={t("title")}
      />
      <ScrollIndicator />
    </Box>
  );
}
