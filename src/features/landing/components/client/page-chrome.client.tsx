"use client";

import { VibeControlsPanel } from "@/features/landing/components/client/vibe-controls.client";
import { usePageChrome } from "@/features/landing/components/hooks/use-page-chrome";
import { PageChrome } from "@/features/landing/components/page-chrome";

import type { Locale } from "next-intl";

interface PageChromeClientProps {
  locale: Locale;
}

export function PageChromeClient({
  locale,
}: Readonly<PageChromeClientProps>) {
  const { handleSwitchLocale } = usePageChrome({ locale });

  return (
    <PageChrome locale={locale} onSwitchLocale={handleSwitchLocale}>
      <VibeControlsPanel />
    </PageChrome>
  );
}
