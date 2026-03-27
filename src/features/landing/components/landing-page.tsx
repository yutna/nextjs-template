import "server-only";

import { Box } from "@chakra-ui/react";

import { PageChromeClient } from "@/features/landing/components/client/page-chrome.client";
import { LandingAiWorkflow } from "@/features/landing/components/landing-ai-workflow";
import { LandingCliUsage } from "@/features/landing/components/landing-cli-usage";
import { LandingCopilot } from "@/features/landing/components/landing-copilot";
import { LandingCta } from "@/features/landing/components/landing-cta";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { LandingHeroSection } from "@/features/landing/components/landing-hero-section";
import { LandingStrengths } from "@/features/landing/components/landing-strengths";
import { LandingTechStack } from "@/features/landing/components/landing-tech-stack";
import { VibeProvider } from "@/features/landing/components/providers/vibe-provider";

import type { Locale } from "next-intl";

interface LandingPageProps {
  locale: Locale;
}

export async function LandingPage({
  locale,
}: Readonly<LandingPageProps>) {
  return (
    <VibeProvider>
      <Box as="main" position="relative">
        <PageChromeClient locale={locale} />
        <LandingHeroSection locale={locale} />
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
