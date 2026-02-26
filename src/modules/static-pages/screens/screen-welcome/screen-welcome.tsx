import "server-only";

import { Box } from "@chakra-ui/react";

import { GradientMesh } from "@/modules/static-pages/components/gradient-mesh";
import { SectionDemo } from "@/modules/static-pages/components/section-demo";
import { SectionFeatures } from "@/modules/static-pages/components/section-features";
import { SectionFooter } from "@/modules/static-pages/components/section-footer";
import { SectionHero } from "@/modules/static-pages/components/section-hero";
import { SectionStats } from "@/modules/static-pages/components/section-stats";
import { SectionTechStack } from "@/modules/static-pages/components/section-tech-stack";

import type { WelcomeScreenProps } from "./types";

export async function WelcomeScreen({ locale }: Readonly<WelcomeScreenProps>) {
  return (
    <Box as="main" overflow="hidden" position="relative">
      <GradientMesh />

      <SectionHero locale={locale} />
      <SectionFeatures locale={locale} />
      <SectionTechStack locale={locale} />
      <SectionStats locale={locale} />
      <SectionDemo locale={locale} />
      <SectionFooter locale={locale} />
    </Box>
  );
}
