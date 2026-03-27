import "server-only";

import { Box } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { CopyCommandButton } from "@/features/landing/components/client/copy-command.client";
import { VibeBackgroundPanel } from "@/features/landing/components/client/vibe-background.client";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { ScrollIndicator } from "@/features/landing/components/scroll-indicator";

import type { Locale } from "next-intl";

interface LandingHeroSectionProps {
  locale: Locale;
}

export async function LandingHeroSection({
  locale,
}: Readonly<LandingHeroSectionProps>) {
  const t = await getTranslations({
    locale,
    namespace: "features.landing.components.landingHero",
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
      <VibeBackgroundPanel />
      <LandingHero
        copyCommand={<CopyCommandButton />}
        getStarted={t("getStarted")}
        subtitle={t("subtitle")}
        title={t("title")}
      />
      <ScrollIndicator />
    </Box>
  );
}
