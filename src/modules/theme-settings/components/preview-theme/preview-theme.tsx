"use client";

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";

export function PreviewTheme() {
  return (
    <Card.Root w="full">
      <Card.Header>
        <Heading size="lg">Theme Preview</Heading>
        <Text color="fg.muted" fontSize="sm" mt={1}>
          This panel shows how the selected theme looks with real components.
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={6}>
          {/* Typography */}
          <VStack align="start" gap={1}>
            <Heading size="xl">Heading XL</Heading>
            <Heading size="lg">Heading LG</Heading>
            <Heading size="md">Heading MD</Heading>
            <Text>
              Body text — the quick brown fox jumps over the lazy dog.
            </Text>
            <Text color="fg.muted" fontSize="sm">
              Muted text — secondary information displayed in a softer tone.
            </Text>
          </VStack>

          {/* Buttons */}
          <HStack flexWrap="wrap" gap={2}>
            <Button colorPalette="blue">Solid</Button>
            <Button colorPalette="blue" variant="outline">
              Outline
            </Button>
            <Button colorPalette="blue" variant="ghost">
              Ghost
            </Button>
            <Button colorPalette="blue" variant="subtle">
              Subtle
            </Button>
          </HStack>

          {/* Badges */}
          <HStack flexWrap="wrap" gap={2}>
            <Badge colorPalette="green">Success</Badge>
            <Badge colorPalette="red">Error</Badge>
            <Badge colorPalette="orange">Warning</Badge>
            <Badge colorPalette="blue">Info</Badge>
          </HStack>

          {/* Input */}
          <Input colorPalette="blue" placeholder="Type something…" />

          {/* Alert */}
          <Alert.Root status="info">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Theme applied</Alert.Title>
              <Alert.Description>
                Changes are previewed instantly. Click Save to persist.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>

          {/* Avatars */}
          <Group>
            <Avatar.Root colorPalette="blue">
              <Avatar.Fallback name="Alice Smith" />
            </Avatar.Root>
            <Avatar.Root colorPalette="green">
              <Avatar.Fallback name="Bob Jones" />
            </Avatar.Root>
            <Avatar.Root colorPalette="orange">
              <Avatar.Fallback name="Carol White" />
            </Avatar.Root>
          </Group>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
