"use client";

import { Box, Button, Grid, GridItem, HStack, VStack } from "@chakra-ui/react";
import { useTranslations } from "next-intl";

import { CardThemePreset } from "@/modules/theme-settings/components/card-theme-preset";
import { PreviewTheme } from "@/modules/theme-settings/components/preview-theme";
import { THEME_PRESETS } from "@/modules/theme-settings/constants/theme-presets";
import { useThemeSettings } from "@/modules/theme-settings/hooks/use-theme-settings";

export function ContainerThemeSettings() {
  const t = useTranslations("modules.themeSettings.actions");
  const {
    activePresetId,
    handleResetToDefault,
    handleSavePreset,
    handleSelectPreset,
    pendingPresetId,
    previewVars,
  } = useThemeSettings();

  return (
    <Grid
      alignItems="start"
      gap={6}
      templateColumns={{ base: "1fr", md: "280px 1fr" }}
    >
      <GridItem>
        <VStack
          align="stretch"
          gap={3}
          maxH={{ md: "80vh" }}
          overflowY={{ md: "auto" }}
        >
          {THEME_PRESETS.map((preset) => (
            <CardThemePreset
              isActive={preset.id === (pendingPresetId ?? activePresetId)}
              key={preset.id}
              onClickSelect={handleSelectPreset}
              preset={preset}
            />
          ))}
        </VStack>
      </GridItem>
      <GridItem>
        <VStack align="stretch" gap={4}>
          <Box css={previewVars}>
            <PreviewTheme />
          </Box>
          <HStack gap={3} justifyContent="flex-end">
            <Button onClick={handleResetToDefault} variant="outline">
              {t("reset")}
            </Button>
            <Button colorPalette="blue" onClick={handleSavePreset}>
              {t("save")}
            </Button>
          </HStack>
        </VStack>
      </GridItem>
    </Grid>
  );
}
