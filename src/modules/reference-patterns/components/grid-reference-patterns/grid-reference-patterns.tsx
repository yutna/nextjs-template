import { Box, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";

import type { GridReferencePatternsProps } from "./types";

export function GridReferencePatterns({
  description,
  heading,
  items,
}: Readonly<GridReferencePatternsProps>) {
  return (
    <Box
      as="section"
      bg={{ _dark: "gray.900", base: "gray.50" }}
      px={{ base: 6, md: 8 }}
      py={{ base: 16, md: 24 }}
    >
      <Box maxW="6xl" mx="auto">
        <VStack align="stretch" gap={8}>
          <VStack align="stretch" gap={3}>
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
                bg={{ _dark: "gray.950", base: "white" }}
                border="1px solid"
                borderColor={{ _dark: "gray.800", base: "gray.200" }}
                borderRadius="xl"
                key={item.codePath}
                p={{ base: 5, md: 6 }}
              >
                <VStack align="stretch" gap={3}>
                  <Text
                    color={{ _dark: "blue.300", base: "blue.600" }}
                    fontFamily="mono"
                    fontSize="xs"
                    fontWeight="semibold"
                    letterSpacing="wider"
                    textTransform="uppercase"
                  >
                    {item.kind}
                  </Text>
                  <Heading as="h2" color={{ _dark: "white", base: "gray.900" }} size="md">
                    {item.title}
                  </Heading>
                  <Text color={{ _dark: "gray.400", base: "gray.600" }}>
                    {item.description}
                  </Text>
                  <Box
                    bg={{ _dark: "gray.900", base: "gray.950" }}
                    borderRadius="lg"
                    px={3}
                    py={2}
                  >
                    <Text color="green.400" fontFamily="mono" fontSize="xs">
                      {item.codePath}
                    </Text>
                  </Box>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    </Box>
  );
}
