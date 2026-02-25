import "server-only";

import { Box, Flex, HStack, Separator, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { type SectionFooterProps } from "./types";

export async function SectionFooter({ locale }: Readonly<SectionFooterProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.welcome",
  });

  const year = new Date().getFullYear();

  return (
    <Box
      as="footer"
      px={{ base: 6, md: 8 }}
      pt={{ base: 12, md: 16 }}
      pb={{ base: 8, md: 12 }}
    >
      <Box maxW="5xl" mx="auto">
        <Separator
          mb={{ base: 8, md: 12 }}
          borderColor={{ base: "gray.200", _dark: "gray.800" }}
        />

        <VStack gap={6} textAlign="center">
          {/* Built with */}
          <Flex align="center" gap={2} wrap="wrap" justify="center">
            <Text fontSize="sm" color={{ base: "gray.500", _dark: "gray.400" }}>
              {t("footerBuiltWith")}
            </Text>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
              style={{ color: "var(--chakra-colors-red-400)" }}
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </Flex>

          {/* Links */}
          <HStack gap={6}>
            <Text
              asChild
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.500", _dark: "gray.400" }}
              _hover={{ color: { base: "gray.800", _dark: "gray.200" } }}
              transition="color 0.2s ease"
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                {t("footerGithub")}
              </a>
            </Text>

            <Text
              asChild
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.500", _dark: "gray.400" }}
              _hover={{ color: { base: "gray.800", _dark: "gray.200" } }}
              transition="color 0.2s ease"
            >
              <a
                href="https://nextjs.org/docs"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 3h6v6" />
                  <path d="M10 14 21 3" />
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                </svg>
                {t("footerDocs")}
              </a>
            </Text>
          </HStack>

          {/* Copyright */}
          <Text fontSize="xs" color={{ base: "gray.400", _dark: "gray.500" }}>
            {t("footerCopyright", { year: String(year) })}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
