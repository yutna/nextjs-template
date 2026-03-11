"use client";

import { Box, Button, Heading, Input, Text, Textarea, VStack } from "@chakra-ui/react";

import type { FormReferenceNoteProps } from "./types";

export function FormReferenceNote({
  description,
  emptyPreviewDescription,
  emptyPreviewTitle,
  fieldErrors,
  heading,
  helperText,
  isSubmitting,
  message,
  messageLabel,
  messagePlaceholder,
  onMessageChange,
  onSubmit,
  onTitleChange,
  previewDescription,
  previewHeading,
  serverError,
  submitLabel,
  submittedMessage,
  submittedTitle,
  submittedWordCountLabel,
  submittingLabel,
  title,
  titleLabel,
  titlePlaceholder,
}: Readonly<FormReferenceNoteProps>) {
  return (
    <Box
      as="section"
      bg={{ _dark: "gray.950", base: "white" }}
      px={{ base: 6, md: 8 }}
      py={{ base: 16, md: 24 }}
    >
      <Box maxW="6xl" mx="auto">
        <VStack align="stretch" gap={8}>
          <VStack align="stretch" gap={3}>
            <Heading as="h2" color={{ _dark: "white", base: "gray.900" }} size="xl">
              {heading}
            </Heading>
            <Text color={{ _dark: "gray.400", base: "gray.600" }} maxW="4xl">
              {description}
            </Text>
          </VStack>

          <Box
            bg={{ _dark: "gray.900", base: "gray.50" }}
            border="1px solid"
            borderColor={{ _dark: "gray.800", base: "gray.200" }}
            borderRadius="xl"
            p={{ base: 5, md: 6 }}
          >
            <Box
              as="form"
              onSubmit={(event) => {
                event.preventDefault();
                void onSubmit();
              }}
            >
              <VStack align="stretch" gap={4}>
                <VStack align="stretch" gap={2}>
                  <label htmlFor="reference-note-title">
                    <Text as="span" fontWeight="semibold">
                      {titleLabel}
                    </Text>
                  </label>
                  <Input
                    aria-invalid={fieldErrors.title !== undefined}
                    disabled={isSubmitting}
                    id="reference-note-title"
                    onChange={(event) => onTitleChange(event.currentTarget.value)}
                    placeholder={titlePlaceholder}
                    value={title}
                  />
                  {fieldErrors.title?.map((error) => (
                    <Text color="red.400" fontSize="sm" key={error} role="alert">
                      {error}
                    </Text>
                  ))}
                </VStack>

                <VStack align="stretch" gap={2}>
                  <label htmlFor="reference-note-message">
                    <Text as="span" fontWeight="semibold">
                      {messageLabel}
                    </Text>
                  </label>
                  <Textarea
                    aria-invalid={fieldErrors.message !== undefined}
                    disabled={isSubmitting}
                    id="reference-note-message"
                    minH="10rem"
                    onChange={(event) => onMessageChange(event.currentTarget.value)}
                    placeholder={messagePlaceholder}
                    value={message}
                  />
                  {fieldErrors.message?.map((error) => (
                    <Text color="red.400" fontSize="sm" key={error} role="alert">
                      {error}
                    </Text>
                  ))}
                </VStack>

                <Text color={{ _dark: "gray.500", base: "gray.600" }} fontSize="sm">
                  {helperText}
                </Text>

                {serverError ? (
                  <Box
                    bg={{ _dark: "red.950", base: "red.50" }}
                    border="1px solid"
                    borderColor={{ _dark: "red.800", base: "red.200" }}
                    borderRadius="lg"
                    px={4}
                    py={3}
                  >
                    <Text color={{ _dark: "red.200", base: "red.700" }} role="alert">
                      {serverError}
                    </Text>
                  </Box>
                ) : null}

                <Button alignSelf="flex-start" disabled={isSubmitting} type="submit">
                  {isSubmitting ? submittingLabel : submitLabel}
                </Button>
              </VStack>
            </Box>
          </Box>

          <Box
            border="1px solid"
            borderColor={{ _dark: "gray.800", base: "gray.200" }}
            borderRadius="xl"
            p={{ base: 5, md: 6 }}
          >
            <VStack align="stretch" gap={3}>
              <Heading as="h3" color={{ _dark: "white", base: "gray.900" }} size="md">
                {previewHeading}
              </Heading>
              <Text color={{ _dark: "gray.400", base: "gray.600" }}>
                {previewDescription}
              </Text>

              {submittedTitle && submittedMessage ? (
                <Box
                  bg={{ _dark: "green.950", base: "green.50" }}
                  border="1px solid"
                  borderColor={{ _dark: "green.800", base: "green.200" }}
                  borderRadius="lg"
                  px={4}
                  py={4}
                >
                  <VStack align="stretch" gap={2}>
                    <Text color={{ _dark: "green.200", base: "green.800" }} fontWeight="semibold">
                      {submittedTitle}
                    </Text>
                    <Text
                      color={{ _dark: "green.100", base: "green.900" }}
                      whiteSpace="pre-wrap"
                    >
                      {submittedMessage}
                    </Text>
                    {submittedWordCountLabel ? (
                      <Text color={{ _dark: "green.300", base: "green.700" }} fontSize="sm">
                        {submittedWordCountLabel}
                      </Text>
                    ) : null}
                  </VStack>
                </Box>
              ) : (
                <Box
                  bg={{ _dark: "gray.900", base: "gray.50" }}
                  borderRadius="lg"
                  px={4}
                  py={4}
                >
                  <VStack align="stretch" gap={2}>
                    <Text color={{ _dark: "white", base: "gray.900" }} fontWeight="semibold">
                      {emptyPreviewTitle}
                    </Text>
                    <Text color={{ _dark: "gray.400", base: "gray.600" }}>
                      {emptyPreviewDescription}
                    </Text>
                  </VStack>
                </Box>
              )}
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
