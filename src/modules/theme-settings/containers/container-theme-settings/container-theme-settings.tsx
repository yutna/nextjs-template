"use client";

import { Box, Grid, GridItem, VStack } from "@chakra-ui/react";

import { CardThemePreset } from "@/modules/theme-settings/components/card-theme-preset";
import { PreviewTheme } from "@/modules/theme-settings/components/preview-theme";
import { THEME_PRESETS } from "@/modules/theme-settings/constants/theme-presets";
import { useThemeSettings } from "@/modules/theme-settings/hooks/use-theme-settings";

import type { ContainerThemeSettingsProps } from "./types";

export function ContainerThemeSettings({
  locale,
}: Readonly<ContainerThemeSettingsProps>) {
  const {
    activePresetId,
    activePreviewGroup,
    colorMode,
    currentPreset,
    handleChangePreviewGroup,
    handleResetToDefault,
    handleSavePreset,
    handleSelectPreset,
    handleSwitchColorMode,
    handleSwitchLocale,
    hasPendingChanges,
    pendingPresetId,
    previewVars,
  } = useThemeSettings({ locale });

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
        <Box css={previewVars}>
          <PreviewTheme
            activePreviewGroup={activePreviewGroup}
            colorMode={colorMode}
            hasPendingChanges={hasPendingChanges}
            locale={locale}
            onChangePreviewGroup={handleChangePreviewGroup}
            onClickReset={handleResetToDefault}
            onClickSave={handleSavePreset}
            onSwitchColorMode={handleSwitchColorMode}
            onSwitchLocale={handleSwitchLocale}
            presetId={currentPreset.id}
          />
        </Box>
      </GridItem>
    </Grid>
  );
}
