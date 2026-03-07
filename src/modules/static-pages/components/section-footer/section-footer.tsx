import "server-only";

import { Box, Flex, Separator, Text } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import type { SectionFooterProps } from "./types";

export async function SectionFooter({ locale }: Readonly<SectionFooterProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.sectionFooter",
  });

  const year = new Date().getFullYear();

  return (
    <Box
      as="footer"
      pb={{ base: 8, md: 12 }}
      pt={{ base: 12, md: 16 }}
      px={{ base: 6, md: 8 }}
    >
      <Box maxW="5xl" mx="auto">
        <Separator
          borderColor={{ _dark: "gray.800", base: "gray.200" }}
          mb={{ base: 8, md: 12 }}
        />

        <Flex
          align="center"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 0 }}
          justify="space-between"
        >
          {/* Built with */}
          <Flex align="center" gap={2}>
            <Text color={{ _dark: "gray.400", base: "gray.500" }} fontSize="sm">
              {t("builtWith")}
            </Text>
            <svg
              aria-hidden="true"
              fill="currentColor"
              height="14"
              stroke="none"
              style={{ color: "var(--chakra-colors-red-400)" }}
              viewBox="0 0 24 24"
              width="14"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </Flex>

          {/* GitHub link — centered */}
          <Text
            _hover={{ color: { _dark: "gray.200", base: "gray.800" } }}
            asChild
            color={{ _dark: "gray.400", base: "gray.500" }}
            fontSize="sm"
            fontWeight="medium"
            transition="color 0.2s ease"
          >
            <a
              href="https://github.com/yutna/nextjs-template"
              rel="noopener noreferrer"
              style={{
                alignItems: "center",
                display: "inline-flex",
                gap: "6px",
              }}
              target="_blank"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              {t("github")}
            </a>
          </Text>

          {/* Copyright */}
          <Text color={{ _dark: "gray.500", base: "gray.400" }} fontSize="xs">
            {t("copyright", { year: String(year) })}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
