import { Badge, Box, Button, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";

import { Link } from "@/shared/lib/navigation";

import type { ReferencePatternsHubProps } from "./types";

export function ReferencePatternsHub({
  actionLabel,
  description,
  eyebrow,
  heading,
  items,
}: Readonly<ReferencePatternsHubProps>) {
  return (
    <Box
      as="main"
      bg={{ _dark: "gray.950", base: "gray.50" }}
      px={{ base: 6, md: 8 }}
      py={{ base: 16, md: 24 }}
    >
      <Box maxW="6xl" mx="auto">
        <VStack align="stretch" gap={8}>
          <VStack align="stretch" gap={3}>
            <Text
              color={{ _dark: "blue.300", base: "blue.600" }}
              fontFamily="mono"
              fontSize="xs"
              fontWeight="semibold"
              letterSpacing="widest"
              textTransform="uppercase"
            >
              {eyebrow}
            </Text>
            <Heading as="h1" color={{ _dark: "white", base: "gray.900" }} size="2xl">
              {heading}
            </Heading>
            <Text color={{ _dark: "gray.400", base: "gray.600" }} maxW="4xl">
              {description}
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {items.map((item) => (
              <Box
                bg={{ _dark: "gray.900", base: "white" }}
                border="1px solid"
                borderColor={{ _dark: "gray.800", base: "gray.200" }}
                borderRadius="xl"
                key={item.href}
                p={{ base: 5, md: 6 }}
              >
                <VStack align="stretch" gap={4}>
                  <Badge alignSelf="flex-start" colorPalette="blue" variant="subtle">
                    {item.statusLabel}
                  </Badge>
                  <VStack align="stretch" gap={2}>
                    <Heading as="h2" color={{ _dark: "white", base: "gray.900" }} size="md">
                      {item.title}
                    </Heading>
                    <Text color={{ _dark: "gray.400", base: "gray.600" }}>
                      {item.description}
                    </Text>
                  </VStack>
                  <Button alignSelf="flex-start" asChild variant="outline">
                    <Link href={item.href}>{actionLabel}</Link>
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    </Box>
  );
}
