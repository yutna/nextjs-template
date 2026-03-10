"use client";

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  ClientOnly,
  EmptyState,
  Field,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  NativeSelect,
  Separator,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import {
  LuChartColumnBig,
  LuLayers3,
  LuMessageSquareWarning,
  LuPalette,
  LuSwatchBook,
} from "react-icons/lu";

import { THEME_PREVIEW_GROUPS } from "@/modules/theme-settings/constants/preview-groups";
import { LOCALES } from "@/shared/constants/locale";

import type { PreviewThemeProps } from "./types";

const PALETTE_TOKENS = [
  "blue",
  "green",
  "orange",
  "pink",
  "purple",
  "teal",
] as const;

export function PreviewTheme({
  activePreviewGroup,
  colorMode,
  hasPendingChanges,
  locale,
  onChangePreviewGroup,
  onClickReset,
  onClickSave,
  onSwitchColorMode,
  onSwitchLocale,
  presetId,
}: Readonly<PreviewThemeProps>) {
  const t = useTranslations("modules.themeSettings.components.previewTheme");
  const tPreset = useTranslations("modules.themeSettings.presets");

  function handleChangePreviewGroup(details: { value: null | string }) {
    if (!details.value) {
      return;
    }

    onChangePreviewGroup(
      details.value as PreviewThemeProps["activePreviewGroup"],
    );
  }

  return (
    <Card.Root w="full">
      <Card.Header gap={5}>
        <Stack
          align={{ base: "stretch", lg: "center" }}
          direction={{ base: "column", lg: "row" }}
          gap={4}
          justify="space-between"
        >
          <VStack align="start" flex="1" gap={2}>
            <Badge
              colorPalette={hasPendingChanges ? "orange" : "green"}
              variant="subtle"
            >
              {hasPendingChanges ? t("controls.pending") : t("controls.saved")}
            </Badge>
            <VStack align="start" gap={1}>
              <Heading size="lg">{tPreset(`${presetId}.name`)}</Heading>
              <Text color="fg.muted">{tPreset(`${presetId}.description`)}</Text>
            </VStack>
          </VStack>
          <Stack
            align={{ base: "stretch", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={3}
          >
            <VStack align="start" gap={2}>
              <Text color="fg.muted" fontSize="sm" fontWeight="medium">
                {t("controls.language")}
              </Text>
              <HStack gap={2}>
                {LOCALES.map((localeOption) => {
                  const isActive = localeOption === locale;

                  return (
                    <Button
                      colorPalette="blue"
                      key={localeOption}
                      onClick={() => onSwitchLocale(localeOption)}
                      size="sm"
                      variant={isActive ? "solid" : "outline"}
                    >
                      {localeOption.toUpperCase()}
                    </Button>
                  );
                })}
              </HStack>
            </VStack>
            <VStack align="start" gap={2}>
              <Text color="fg.muted" fontSize="sm" fontWeight="medium">
                {t("controls.appearance")}
              </Text>
              <ClientOnly
                fallback={
                  <HStack gap={2}>
                    <Button disabled size="sm" variant="outline">
                      {t("controls.light")}
                    </Button>
                    <Button disabled size="sm" variant="outline">
                      {t("controls.dark")}
                    </Button>
                  </HStack>
                }
              >
                <HStack gap={2}>
                  {(["light", "dark"] as const).map((mode) => {
                    const isActive = mode === colorMode;

                    return (
                      <Button
                        colorPalette="blue"
                        key={mode}
                        onClick={() => onSwitchColorMode(mode)}
                        size="sm"
                        variant={isActive ? "solid" : "outline"}
                      >
                        {t(`controls.${mode}`)}
                      </Button>
                    );
                  })}
                </HStack>
              </ClientOnly>
            </VStack>
          </Stack>
        </Stack>
      </Card.Header>
      <Card.Body>
        <Tabs.Root
          colorPalette="blue"
          css={{
            "--tabs-indicator-bg": "colors.bg",
            "--tabs-indicator-shadow": "shadows.xs",
            "--tabs-trigger-radius": "radii.full",
          }}
          lazyMount
          onValueChange={handleChangePreviewGroup}
          value={activePreviewGroup}
          variant="plain"
        >
          <Tabs.List bg="bg.muted" flexWrap="wrap" gap={1} p={1} rounded="l3">
            {THEME_PREVIEW_GROUPS.map((group) => (
              <Tabs.Trigger key={group} value={group} whiteSpace="nowrap">
                {t(`tabs.${group}`)}
              </Tabs.Trigger>
            ))}
            <Tabs.Indicator rounded="l2" />
          </Tabs.List>
          <Tabs.Content value="overview">
            <VStack align="stretch" gap={6} pt={5}>
              <VStack align="start" gap={1}>
                <Badge colorPalette="purple" variant="subtle">
                  {t("overview.eyebrow")}
                </Badge>
                <Heading size="xl">{t("overview.title")}</Heading>
                <Text color="fg.muted">{t("overview.description")}</Text>
              </VStack>
              <HStack flexWrap="wrap" gap={3}>
                <Button colorPalette="blue">
                  {t("overview.primaryAction")}
                </Button>
                <Button colorPalette="blue" variant="outline">
                  {t("overview.secondaryAction")}
                </Button>
                <Button variant="ghost">{t("overview.ghostAction")}</Button>
              </HStack>
              <HStack flexWrap="wrap" gap={2}>
                <Badge colorPalette="green">{t("overview.badgeStable")}</Badge>
                <Badge colorPalette="blue">{t("overview.badgeNew")}</Badge>
                <Badge colorPalette="purple">
                  {t("overview.badgePopular")}
                </Badge>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Card.Root variant="outline">
                  <Card.Header>
                    <Heading size="md">{t("overview.cardTitle")}</Heading>
                    <Text color="fg.muted">
                      {t("overview.cardDescription")}
                    </Text>
                  </Card.Header>
                  <Card.Footer>
                    <Button colorPalette="teal" variant="subtle">
                      {t("overview.cardAction")}
                    </Button>
                  </Card.Footer>
                </Card.Root>
                <Card.Root variant="subtle">
                  <Card.Header>
                    <Text color="fg.muted" fontSize="sm">
                      {t("overview.metricLabel")}
                    </Text>
                    <Heading size="2xl">{t("overview.metricValue")}</Heading>
                    <Text color="fg.muted">{t("overview.metricCaption")}</Text>
                  </Card.Header>
                </Card.Root>
              </SimpleGrid>
            </VStack>
          </Tabs.Content>
          <Tabs.Content value="forms">
            <VStack align="stretch" gap={6} pt={5}>
              <VStack align="start" gap={1}>
                <Heading size="lg">{t("forms.title")}</Heading>
                <Text color="fg.muted">{t("forms.description")}</Text>
              </VStack>
              <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
                <VStack align="stretch" gap={4}>
                  <Field.Root>
                    <Field.Label>{t("forms.emailLabel")}</Field.Label>
                    <Input placeholder={t("forms.emailPlaceholder")} />
                    <Field.HelperText>
                      {t("forms.emailHelper")}
                    </Field.HelperText>
                  </Field.Root>
                  <Field.Root invalid>
                    <Field.Label>{t("forms.emailErrorLabel")}</Field.Label>
                    <Input placeholder={t("forms.emailPlaceholder")} />
                    <Field.ErrorText>{t("forms.emailError")}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t("forms.roleLabel")}</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field defaultValue="designer">
                        <option value="designer">
                          {t("forms.roleDesigner")}
                        </option>
                        <option value="engineer">
                          {t("forms.roleEngineer")}
                        </option>
                        <option value="product">
                          {t("forms.roleProduct")}
                        </option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                </VStack>
                <VStack align="stretch" gap={4}>
                  <Field.Root>
                    <Field.Label>{t("forms.notesLabel")}</Field.Label>
                    <Textarea placeholder={t("forms.notesPlaceholder")} />
                  </Field.Root>
                  <Checkbox.Root colorPalette="blue" defaultChecked variant="solid">
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label>{t("forms.checkboxLabel")}</Checkbox.Label>
                  </Checkbox.Root>
                  <Switch.Root
                    colorPalette="blue"
                    defaultChecked
                    variant="solid"
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Switch.Label>{t("forms.switchLabel")}</Switch.Label>
                  </Switch.Root>
                  <Button alignSelf="flex-start" colorPalette="blue">
                    {t("forms.submit")}
                  </Button>
                </VStack>
              </SimpleGrid>
            </VStack>
          </Tabs.Content>
          <Tabs.Content value="feedback">
            <VStack align="stretch" gap={6} pt={5}>
              <VStack align="start" gap={1}>
                <Heading size="lg">{t("feedback.title")}</Heading>
                <Text color="fg.muted">{t("feedback.description")}</Text>
              </VStack>
              <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
                <VStack align="stretch" gap={4}>
                  <Alert.Root status="info" variant="subtle">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>{t("feedback.infoTitle")}</Alert.Title>
                      <Alert.Description>
                        {t("feedback.infoDescription")}
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                  <Alert.Root status="warning" variant="surface">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>{t("feedback.warningTitle")}</Alert.Title>
                      <Alert.Description>
                        {t("feedback.warningDescription")}
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                </VStack>
                <Card.Root variant="outline">
                  <Card.Header>
                    <Text color="fg.muted" fontSize="sm">
                      {t("feedback.loadingLabel")}
                    </Text>
                  </Card.Header>
                  <Card.Body gap={3}>
                    <Skeleton height="12px" />
                    <Skeleton height="12px" width="80%" />
                    <Skeleton height="96px" />
                  </Card.Body>
                </Card.Root>
              </SimpleGrid>
              <EmptyState.Root borderWidth="1px" rounded="l3" size="sm">
                <EmptyState.Content>
                  <EmptyState.Indicator>
                    <LuMessageSquareWarning />
                  </EmptyState.Indicator>
                  <VStack textAlign="center">
                    <EmptyState.Title>
                      {t("feedback.emptyTitle")}
                    </EmptyState.Title>
                    <EmptyState.Description>
                      {t("feedback.emptyDescription")}
                    </EmptyState.Description>
                  </VStack>
                  <HStack>
                    <Button colorPalette="blue">
                      {t("feedback.emptyPrimary")}
                    </Button>
                    <Button variant="outline">
                      {t("feedback.emptySecondary")}
                    </Button>
                  </HStack>
                </EmptyState.Content>
              </EmptyState.Root>
            </VStack>
          </Tabs.Content>
          <Tabs.Content value="surfaces">
            <VStack align="stretch" gap={6} pt={5}>
              <VStack align="start" gap={1}>
                <Heading size="lg">{t("surfaces.title")}</Heading>
                <Text color="fg.muted">{t("surfaces.description")}</Text>
              </VStack>
              <Card.Root variant="outline">
                <Card.Body p={0}>
                  <Table.Root size="sm">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>
                          {t("surfaces.tableProject")}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                          {t("surfaces.tableOwner")}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                          {t("surfaces.tableStatus")}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader textAlign="end">
                          {t("surfaces.tableRevenue")}
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>{t("surfaces.rowOneProject")}</Table.Cell>
                        <Table.Cell>{t("surfaces.rowOneOwner")}</Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette="green">
                            {t("surfaces.rowOneStatus")}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell textAlign="end">
                          {t("surfaces.rowOneRevenue")}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>{t("surfaces.rowTwoProject")}</Table.Cell>
                        <Table.Cell>{t("surfaces.rowTwoOwner")}</Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette="orange">
                            {t("surfaces.rowTwoStatus")}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell textAlign="end">
                          {t("surfaces.rowTwoRevenue")}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>{t("surfaces.rowThreeProject")}</Table.Cell>
                        <Table.Cell>{t("surfaces.rowThreeOwner")}</Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette="purple">
                            {t("surfaces.rowThreeStatus")}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell textAlign="end">
                          {t("surfaces.rowThreeRevenue")}
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                </Card.Body>
              </Card.Root>
              <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
                <Card.Root variant="subtle">
                  <Card.Header>
                    <Heading size="md">{t("surfaces.surfaceTitle")}</Heading>
                    <Text color="fg.muted">
                      {t("surfaces.surfaceDescription")}
                    </Text>
                  </Card.Header>
                  <Card.Footer justifyContent="space-between">
                    <Badge colorPalette="teal" variant="subtle">
                      {t("surfaces.surfaceBadge")}
                    </Badge>
                    <Button colorPalette="teal" variant="ghost">
                      {t("surfaces.surfaceAction")}
                    </Button>
                  </Card.Footer>
                </Card.Root>
                <Card.Root variant="outline">
                  <Card.Body>
                    <VStack align="start" gap={2}>
                      <Text fontWeight="medium">{t("surfaces.noteTitle")}</Text>
                      <Text color="fg.muted">
                        {t("surfaces.noteDescription")}
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </SimpleGrid>
            </VStack>
          </Tabs.Content>
          <Tabs.Content value="tokens">
            <VStack align="stretch" gap={6} pt={5}>
              <VStack align="start" gap={1}>
                <Heading size="lg">{t("tokens.title")}</Heading>
                <Text color="fg.muted">{t("tokens.description")}</Text>
              </VStack>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
                {PALETTE_TOKENS.map((palette) => (
                  <Card.Root key={palette} variant="outline">
                    <Card.Header gap={3}>
                      <HStack justify="space-between" w="full">
                        <Text fontWeight="medium">
                          {t(`tokens.palette.${palette}`)}
                        </Text>
                        <LuPalette />
                      </HStack>
                      <Grid gap={2} templateColumns="repeat(3, minmax(0, 1fr))">
                        <GridItem>
                          <Box bg={`${palette}.solid`} h="14" rounded="l2" />
                          <Text fontSize="xs" mt={2}>
                            {t("tokens.solid")}
                          </Text>
                        </GridItem>
                        <GridItem>
                          <Box bg={`${palette}.muted`} h="14" rounded="l2" />
                          <Text fontSize="xs" mt={2}>
                            {t("tokens.muted")}
                          </Text>
                        </GridItem>
                        <GridItem>
                          <Box bg={`${palette}.subtle`} h="14" rounded="l2" />
                          <Text fontSize="xs" mt={2}>
                            {t("tokens.subtle")}
                          </Text>
                        </GridItem>
                      </Grid>
                    </Card.Header>
                  </Card.Root>
                ))}
              </SimpleGrid>
              <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
                <Card.Root variant="subtle">
                  <Card.Header>
                    <HStack justify="space-between" w="full">
                      <Heading size="sm">{t("tokens.radiusTitle")}</Heading>
                      <LuLayers3 />
                    </HStack>
                  </Card.Header>
                  <Card.Body>
                    <HStack gap={3}>
                      <Box
                        bg="blue.subtle"
                        css={{ borderRadius: "var(--chakra-radii-l1)" }}
                        h="16"
                        w="16"
                      />
                      <Box
                        bg="blue.muted"
                        css={{ borderRadius: "var(--chakra-radii-l2)" }}
                        h="16"
                        w="16"
                      />
                      <Box
                        bg="blue.solid"
                        css={{ borderRadius: "var(--chakra-radii-l3)" }}
                        h="16"
                        w="16"
                      />
                    </HStack>
                  </Card.Body>
                </Card.Root>
                <Card.Root variant="outline">
                  <Card.Header>
                    <HStack justify="space-between" w="full">
                      <Heading size="sm">{t("tokens.surfaceTitle")}</Heading>
                      <LuSwatchBook />
                    </HStack>
                  </Card.Header>
                  <Card.Body gap={3}>
                    <Box borderWidth="1px" p={3} rounded="l2">
                      <Text fontWeight="medium">
                        {t("tokens.surfaceDefault")}
                      </Text>
                    </Box>
                    <Box bg="bg.muted" p={3} rounded="l2">
                      <Text fontWeight="medium">
                        {t("tokens.surfaceMuted")}
                      </Text>
                    </Box>
                    <Separator />
                    <HStack
                      color="fg.muted"
                      fontSize="sm"
                      justify="space-between"
                    >
                      <Text>{t("tokens.caption")}</Text>
                      <LuChartColumnBig />
                    </HStack>
                  </Card.Body>
                </Card.Root>
              </SimpleGrid>
            </VStack>
          </Tabs.Content>
        </Tabs.Root>
      </Card.Body>
      <Card.Footer justifyContent="flex-end">
        <HStack gap={3}>
          <Button onClick={onClickReset} variant="outline">
            {t("actions.reset")}
          </Button>
          <Button colorPalette="blue" onClick={onClickSave}>
            {t("actions.save")}
          </Button>
        </HStack>
      </Card.Footer>
    </Card.Root>
  );
}
