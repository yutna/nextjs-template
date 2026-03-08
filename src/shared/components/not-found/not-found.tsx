import "server-only";

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { getLocale, getTranslations } from "next-intl/server";
import { LuHouse } from "react-icons/lu";

import { Link } from "@/shared/lib/navigation";
import { routes } from "@/shared/routes";

import { ButtonGoBackClient } from "./button-go-back-client";

export async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({
    locale,
    namespace: "shared.components.notFound",
  });

  return (
    <Flex
      align="center"
      bgGradient="to-br"
      gradientFrom={{ _dark: "gray.950", base: "gray.50" }}
      gradientTo={{ _dark: "blue.950", base: "purple.50" }}
      justify="center"
      minH="100vh"
      px={6}
      py={16}
    >
      <VStack gap={8} maxW="lg" textAlign="center">
        {/* 404 gradient number */}
        <Box
          bgClip="text"
          bgGradient="to-r"
          css={{ color: "transparent" }}
          fontSize={{ base: "8rem", md: "11rem" }}
          fontWeight="black"
          gradientFrom="blue.400"
          gradientTo="purple.500"
          lineHeight={1}
          userSelect="none"
        >
          404
        </Box>

        {/* Decorative divider */}
        <Box
          bgGradient="to-r"
          borderRadius="full"
          gradientFrom="blue.400"
          gradientTo="purple.500"
          h={1}
          w={16}
        />

        {/* Heading */}
        <VStack gap={3}>
          <Heading
            as="h1"
            color={{ _dark: "gray.100", base: "gray.800" }}
            fontWeight="bold"
            size={{ base: "2xl", md: "3xl" }}
          >
            {t("heading")}
          </Heading>
          <Text
            color={{ _dark: "gray.400", base: "gray.500" }}
            fontSize={{ base: "md", md: "lg" }}
            maxW="sm"
          >
            {t("description")}
          </Text>
        </VStack>

        {/* Actions */}
        <HStack flexWrap="wrap" gap={4} justify="center">
          <ButtonGoBackClient label={t("goBack")} />
          <Button asChild colorPalette="blue" size="lg">
            <Link href={routes.root.path()}>
              <LuHouse />
              {t("goHome")}
            </Link>
          </Button>
        </HStack>
      </VStack>
    </Flex>
  );
}
