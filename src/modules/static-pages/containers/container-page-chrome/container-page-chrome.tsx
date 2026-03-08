"use client";

import { PageChrome } from "@/modules/static-pages/components/page-chrome";
import { ContainerVibeControls } from "@/modules/static-pages/containers/container-vibe-controls";
import { usePageChrome } from "@/modules/static-pages/hooks/use-page-chrome";

import type { ContainerPageChromeProps } from "./types";

export function ContainerPageChrome({
  locale,
}: Readonly<ContainerPageChromeProps>) {
  const { onLocaleSwitch } = usePageChrome({ locale });

  return (
    <PageChrome locale={locale} onLocaleSwitch={onLocaleSwitch}>
      <ContainerVibeControls />
    </PageChrome>
  );
}
