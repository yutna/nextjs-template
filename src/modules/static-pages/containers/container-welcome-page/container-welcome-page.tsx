import "server-only";

import { Box } from "@chakra-ui/react";

import { LandingAiWorkflow } from "@/modules/static-pages/components/landing-ai-workflow";
import { LandingCliUsage } from "@/modules/static-pages/components/landing-cli-usage";
import { LandingCopilot } from "@/modules/static-pages/components/landing-copilot";
import { LandingCta } from "@/modules/static-pages/components/landing-cta";
import { LandingFooter } from "@/modules/static-pages/components/landing-footer";
import { LandingStrengths } from "@/modules/static-pages/components/landing-strengths";
import { LandingTechStack } from "@/modules/static-pages/components/landing-tech-stack";
import { PageChrome } from "@/modules/static-pages/components/page-chrome";
import { ContainerLandingHero } from "@/modules/static-pages/containers/container-landing-hero";
import { VibeProvider } from "@/modules/static-pages/providers/vibe-provider";

import type { ContainerWelcomePageProps } from "./types";

export async function ContainerWelcomePage({
  locale,
}: Readonly<ContainerWelcomePageProps>) {
  return (
    <VibeProvider>
      <Box as="main" position="relative">
        <PageChrome locale={locale} />
        <ContainerLandingHero locale={locale} />
        <LandingStrengths locale={locale} />
        <LandingAiWorkflow locale={locale} />
        <LandingCopilot locale={locale} />
        <LandingCliUsage locale={locale} />
        <LandingTechStack locale={locale} />
        <LandingCta locale={locale} />
        <LandingFooter locale={locale} />
      </Box>
    </VibeProvider>
  );
}
