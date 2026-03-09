import "server-only";

import { Container, Heading, Text } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { ContainerThemeSettings } from "@/modules/theme-settings/containers/container-theme-settings";

import type { ScreenThemeSettingsProps } from "./types";

export async function ScreenThemeSettings({
  locale,
}: Readonly<ScreenThemeSettingsProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.themeSettings.screen",
  });

  return (
    <Container maxW="6xl" py={8}>
      <Heading mb={2}>{t("heading")}</Heading>
      <Text color="fg.muted" mb={6}>
        {t("subheading")}
      </Text>
      <ContainerThemeSettings />
    </Container>
  );
}
