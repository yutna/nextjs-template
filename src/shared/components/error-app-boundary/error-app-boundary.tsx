"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { LuHouse, LuRefreshCw, LuTriangleAlert } from "react-icons/lu";

import { reportErrorAction } from "@/shared/actions/report-error-action";
import { Link } from "@/shared/lib/navigation";
import { routes } from "@/shared/routes";

import type { NextErrorProps } from "@/shared/types/next";

export function ErrorAppBoundary({ error, reset }: NextErrorProps) {
  // Initialize variables / Setup
  const { digest, message } = error;

  // Hooks
  const t = useTranslations("shared.components.error");

  // Effect hooks
  useEffect(() => {
    void reportErrorAction({ boundary: "app", digest, message });
  }, [message, digest]);

  return (
    <Flex
      align="center"
      bgGradient="to-br"
      gradientFrom={{ _dark: "gray.950", base: "orange.50" }}
      gradientTo={{ _dark: "red.950", base: "red.50" }}
      justify="center"
      minH="100vh"
      px={6}
      py={16}
    >
      <VStack gap={8} maxW="lg" textAlign="center">
        {/* Error icon */}
        <Box _dark={{ color: "orange.400" }} color="orange.500">
          <Icon fontSize={{ base: "8rem", md: "11rem" }}>
            <LuTriangleAlert />
          </Icon>
        </Box>

        {/* Decorative divider */}
        <Box
          bgGradient="to-r"
          borderRadius="full"
          gradientFrom="orange.400"
          gradientTo="red.500"
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
          <Button asChild size="lg" variant="outline">
            <Link href={routes.root.path()}>
              <LuHouse />
              {t("goHome")}
            </Link>
          </Button>
          <Button colorPalette="orange" onClick={reset} size="lg">
            <LuRefreshCw />
            {t("tryAgain")}
          </Button>
        </HStack>
      </VStack>
    </Flex>
  );
}
