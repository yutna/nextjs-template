"use client";

import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Link as ChakraLink,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { motion } from "motion/react";

import { GALACTIC_ARCHIVE_SIDE_CONFIG } from "@/modules/reference-patterns/constants/galactic-archive-side-config";
import { Link } from "@/shared/lib/navigation";

import { ReferencePatternsGalacticArchiveSceneLoader } from "./reference-patterns-galactic-archive-scene-loader";

import type {
  GalacticArchiveFeaturedCollection,
  GalacticArchiveFeaturedLabels,
  GalacticArchiveProjectCard,
  GalacticArchiveProjectsLabels,
  ReferencePatternsGalacticArchiveProps,
} from "./types";

const MotionDiv = motion.div;

function buildTransition(currentSide: "dark" | "light") {
  return {
    duration: currentSide === "light" ? 0.62 : 0.38,
    ease: "easeOut",
  } as const;
}

function FeaturedCollection({
  collection,
  currentSide,
  labels,
  mutedTextColor,
}: Readonly<{
  collection: GalacticArchiveFeaturedCollection;
  currentSide: "dark" | "light";
  labels: GalacticArchiveFeaturedLabels;
  mutedTextColor: string;
}>) {
  return (
    <Box
      bg={currentSide === collection.side ? "whiteAlpha.120" : "blackAlpha.350"}
      border="1px solid"
      borderColor={collection.side === "light" ? "cyan.400" : "red.500"}
      borderRadius={currentSide === "light" ? "3xl" : "xl"}
      p={{ base: 5, md: 6 }}
    >
      <VStack align="stretch" gap={4}>
        <Heading as="h3" color="white" size="md">
          {collection.heading}
        </Heading>
        <VStack align="stretch" gap={3}>
          {collection.items.map((item) => (
            <MotionDiv
              key={item.name}
              transition={buildTransition(currentSide)}
              whileHover={{
                scale: currentSide === "light" ? 1.01 : 1.03,
                y: currentSide === "light" ? -4 : -6,
              }}
            >
              <Box
                bg="blackAlpha.420"
                border="1px solid"
                borderColor={item.side === "light" ? "cyan.300" : "red.400"}
                borderRadius={currentSide === "light" ? "2xl" : "lg"}
                boxShadow={`0 0 28px ${
                  item.side === "light"
                    ? "rgba(126, 240, 255, 0.12)"
                    : "rgba(255, 82, 82, 0.16)"
                }`}
                p={4}
              >
                <VStack align="stretch" gap={2}>
                  <HStack justify="space-between" wrap="wrap">
                    <Heading as="h4" color="white" size="sm">
                      {item.name}
                    </Heading>
                    <Badge colorPalette={item.side === "light" ? "blue" : "red"}>
                      {item.profileTitle}
                    </Badge>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, sm: 3 }} gap={2}>
                    <Box>
                      <Text color={mutedTextColor} fontSize="xs" textTransform="uppercase">
                        {labels.birthYear}
                      </Text>
                      <Text color="white" fontWeight="semibold">
                        {item.birthYear}
                      </Text>
                    </Box>
                    <Box>
                      <Text color={mutedTextColor} fontSize="xs" textTransform="uppercase">
                        {labels.films}
                      </Text>
                      <Text color="white" fontWeight="semibold">
                        {item.filmCount}
                      </Text>
                    </Box>
                    <Box>
                      <Text color={mutedTextColor} fontSize="xs" textTransform="uppercase">
                        {labels.starships}
                      </Text>
                      <Text color="white" fontWeight="semibold">
                        {item.starshipCount}
                      </Text>
                    </Box>
                  </SimpleGrid>
                  <Text color={mutedTextColor} fontSize="sm">
                    {item.starshipNames.length > 0
                      ? item.starshipNames.join(" • ")
                      : labels.noStarships}
                  </Text>
                </VStack>
              </Box>
            </MotionDiv>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}

function ProjectCard({
  currentSide,
  item,
  labels,
}: Readonly<{
  currentSide: "dark" | "light";
  item: GalacticArchiveProjectCard;
  labels: GalacticArchiveProjectsLabels;
}>) {
  return (
    <MotionDiv
      transition={buildTransition(currentSide)}
      whileHover={{
        rotateX: currentSide === "light" ? -4 : -8,
        rotateY: currentSide === "light" ? 6 : 10,
        scale: currentSide === "light" ? 1.01 : 1.03,
        y: currentSide === "light" ? -6 : -10,
      }}
    >
      <Box
        bg={currentSide === item.side ? "whiteAlpha.120" : "blackAlpha.450"}
        border="1px solid"
        borderColor={item.side === "light" ? "cyan.400" : "red.500"}
        borderRadius={currentSide === "light" ? "3xl" : "xl"}
        boxShadow={`0 0 32px ${
          item.side === "light"
            ? "rgba(126, 240, 255, 0.18)"
            : "rgba(255, 82, 82, 0.2)"
        }`}
        h="full"
        p={5}
      >
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between" wrap="wrap">
            <Heading as="h3" color="white" size="md">
              {item.title}
            </Heading>
            <Badge colorPalette={item.side === "light" ? "blue" : "red"}>
              {item.shipName}
            </Badge>
          </HStack>
          <Text color="gray.200">{item.description}</Text>
          <SimpleGrid columns={1} gap={2}>
            <Box>
              <Text color="gray.400" fontSize="xs" textTransform="uppercase">
                {labels.film}
              </Text>
              <Text color="white">{item.featuredFilmTitle}</Text>
            </Box>
            <Box>
              <Text color="gray.400" fontSize="xs" textTransform="uppercase">
                {labels.shipClass}
              </Text>
              <Text color="white">{item.shipClass}</Text>
            </Box>
            <Box>
              <Text color="gray.400" fontSize="xs" textTransform="uppercase">
                {labels.manufacturer}
              </Text>
              <Text color="white">{item.manufacturer}</Text>
            </Box>
          </SimpleGrid>
        </VStack>
      </Box>
    </MotionDiv>
  );
}

export function ReferencePatternsGalacticArchive({
  about,
  contact,
  currentSide,
  featured,
  hero,
  isSearchLoading,
  isSoundEnabled,
  onChangeSearch,
  onSelectSide,
  onToggleSound,
  projects,
  search,
  searchError,
  searchQuery,
  searchResults,
  skills,
  starships,
  timeline,
}: Readonly<ReferencePatternsGalacticArchiveProps>) {
  const sideConfig = GALACTIC_ARCHIVE_SIDE_CONFIG[currentSide];
  const currentAboutDescription = about.descriptions[currentSide];
  const currentAboutTitle = about.titles[currentSide];
  const currentContactDescription = contact.descriptions[currentSide];
  const transition = buildTransition(currentSide);

  return (
    <Box
      as="main"
      bg={`linear-gradient(180deg, ${sideConfig.gradientFrom} 0%, ${sideConfig.gradientTo} 100%)`}
      color="white"
      minH="100vh"
      overflow="hidden"
      position="relative"
      px={{ base: 5, md: 8 }}
      py={{ base: 12, md: 20 }}
    >
      <Box inset={0} opacity={currentSide === "light" ? 0.95 : 1} pointerEvents="none" position="absolute">
        <ReferencePatternsGalacticArchiveSceneLoader side={currentSide} />
      </Box>

      <Box maxW="7xl" mx="auto" position="relative" zIndex={1}>
        <VStack align="stretch" gap={{ base: 8, md: 10 }}>
          <MotionDiv animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 24 }} transition={transition}>
            <SimpleGrid columns={{ base: 1, xl: 2 }} gap={{ base: 6, xl: 8 }}>
              <Box
                backdropFilter="blur(18px)"
                bg={sideConfig.panelSurface}
                border="1px solid"
                borderColor={sideConfig.cardBorderColor}
                borderRadius={currentSide === "light" ? "4xl" : "2xl"}
                boxShadow={`0 0 48px ${sideConfig.glowColor}`}
                p={{ base: 6, md: 8 }}
              >
                <VStack align="stretch" gap={5}>
                  <Badge colorPalette={currentSide === "light" ? "blue" : "red"} maxW="fit-content">
                    {hero.eyebrow}
                  </Badge>
                  <Heading as="h1" lineHeight="0.95" size="4xl">
                    {hero.heading}
                  </Heading>
                  <Text color={sideConfig.mutedTextColor} fontSize="lg" maxW="2xl">
                    {hero.description}
                  </Text>
                  <HStack align="stretch" gap={3} wrap="wrap">
                    <Box
                      bg="blackAlpha.350"
                      border="1px solid"
                      borderColor={sideConfig.cardBorderColor}
                      borderRadius={currentSide === "light" ? "2xl" : "lg"}
                      minW={{ base: "full", sm: "320px" }}
                      p={4}
                    >
                      <VStack align="stretch" gap={3}>
                        <HStack justify="space-between" wrap="wrap">
                          <Text color="white" fontWeight="semibold">
                            {hero.statusLabel}
                          </Text>
                          <Badge colorPalette={hero.systems.every((system) => system.online) ? "green" : "orange"}>
                            {hero.statusDescription}
                          </Badge>
                        </HStack>
                        <HStack gap={2} wrap="wrap">
                          {hero.systems.map((system) => (
                            <Badge
                              colorPalette={system.online ? "green" : "orange"}
                              key={system.label}
                              variant="subtle"
                            >
                              {system.label}
                            </Badge>
                          ))}
                        </HStack>
                      </VStack>
                    </Box>
                    <Button
                      alignSelf="start"
                      colorPalette={currentSide === "light" ? "blue" : "red"}
                      onClick={onToggleSound}
                      variant="outline"
                    >
                      {isSoundEnabled
                        ? hero.soundEnabledLabel
                        : hero.soundDisabledLabel}
                    </Button>
                  </HStack>
                </VStack>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                {hero.sideOptions.map((option) => {
                  const isActive = option.side === currentSide;

                  return (
                    <MotionDiv
                      key={option.side}
                      transition={transition}
                      whileHover={{
                        scale: isActive ? 1.015 : 1.03,
                        y: currentSide === "light" ? -6 : -10,
                      }}
                    >
                      <Button
                        aria-pressed={isActive}
                        bg={isActive ? sideConfig.cardSurface : "blackAlpha.420"}
                        border="1px solid"
                        borderColor={option.side === "light" ? "cyan.400" : "red.500"}
                        borderRadius={currentSide === "light" ? "3xl" : "lg"}
                        boxShadow={isActive ? `0 0 36px ${sideConfig.glowColor}` : undefined}
                        color="white"
                        h="full"
                        justifyContent="start"
                        minH="220px"
                        onClick={() => onSelectSide(option.side)}
                        p={0}
                        textAlign="left"
                        variant="ghost"
                        w="full"
                      >
                        <VStack align="stretch" gap={4} p={6} w="full">
                          <Badge colorPalette={option.side === "light" ? "blue" : "red"} maxW="fit-content">
                            {option.label}
                          </Badge>
                          <Heading as="h2" size="lg">
                            {option.label}
                          </Heading>
                          <Text color={sideConfig.mutedTextColor}>{option.description}</Text>
                        </VStack>
                      </Button>
                    </MotionDiv>
                  );
                })}
              </SimpleGrid>
            </SimpleGrid>
          </MotionDiv>

          <SimpleGrid columns={{ base: 1, xl: 2 }} gap={6}>
            <MotionDiv animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={transition}>
              <Box
                bg={sideConfig.panelSurface}
                border="1px solid"
                borderColor={sideConfig.cardBorderColor}
                borderRadius={currentSide === "light" ? "3xl" : "xl"}
                p={{ base: 5, md: 6 }}
              >
                <VStack align="stretch" gap={4}>
                  <Heading as="h2" size="lg">
                    {about.heading}
                  </Heading>
                  <Badge colorPalette={currentSide === "light" ? "blue" : "red"} maxW="fit-content">
                    {currentAboutTitle}
                  </Badge>
                  <Text color={sideConfig.mutedTextColor}>{currentAboutDescription}</Text>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                    {about.metrics.map((metric) => (
                      <Box bg="blackAlpha.320" borderRadius="2xl" key={metric.label} p={4}>
                        <Text color={sideConfig.mutedTextColor} fontSize="xs" textTransform="uppercase">
                          {metric.label}
                        </Text>
                        <Text color="white" fontWeight="semibold" mt={2}>
                          {metric.value}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </VStack>
              </Box>
            </MotionDiv>

            <MotionDiv animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={transition}>
              <Box
                bg={sideConfig.panelSurface}
                border="1px solid"
                borderColor={sideConfig.cardBorderColor}
                borderRadius={currentSide === "light" ? "3xl" : "xl"}
                p={{ base: 5, md: 6 }}
              >
                <VStack align="stretch" gap={4}>
                  <Heading as="h2" size="lg">
                    {search.heading}
                  </Heading>
                  <Text color={sideConfig.mutedTextColor}>{search.description}</Text>
                  <VStack align="stretch" gap={2}>
                    <Text color={sideConfig.mutedTextColor} fontSize="sm">
                      {search.label}
                    </Text>
                    <Input
                      bg="blackAlpha.380"
                      borderColor={sideConfig.cardBorderColor}
                      onChange={(event) => onChangeSearch(event.currentTarget.value)}
                      placeholder={search.placeholder}
                      value={searchQuery}
                    />
                    <Text color={sideConfig.mutedTextColor} fontSize="sm">
                      {search.hint}
                    </Text>
                  </VStack>
                  <Box aria-live="polite" minH="180px">
                    {searchError ? (
                      <Text color="orange.200">
                        {search.errorPrefix}: {searchError}
                      </Text>
                    ) : isSearchLoading ? (
                      <Text color={sideConfig.mutedTextColor}>{search.hint}</Text>
                    ) : searchQuery.trim().length < 2 ? (
                      <VStack align="stretch" gap={2}>
                        <Text color="white" fontWeight="semibold">
                          {search.emptyTitle}
                        </Text>
                        <Text color={sideConfig.mutedTextColor}>
                          {search.emptyDescription}
                        </Text>
                      </VStack>
                    ) : (
                      <VStack align="stretch" gap={3}>
                        {searchResults.map((result) => (
                          <Box
                            bg="blackAlpha.350"
                            border="1px solid"
                            borderColor={sideConfig.cardBorderColor}
                            borderRadius={currentSide === "light" ? "2xl" : "lg"}
                            key={result.url}
                            p={4}
                          >
                            <VStack align="stretch" gap={2}>
                              <Heading as="h3" size="sm">
                                {result.name}
                              </Heading>
                              <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
                                <Text color={sideConfig.mutedTextColor}>
                                  {search.birthYearLabel}: {result.birthYear}
                                </Text>
                                <Text color={sideConfig.mutedTextColor}>
                                  {search.genderLabel}: {result.gender}
                                </Text>
                                <Text color={sideConfig.mutedTextColor}>
                                  {search.filmsLabel}: {result.filmCount}
                                </Text>
                                <Text color={sideConfig.mutedTextColor}>
                                  {search.starshipsLabel}: {result.starshipCount}
                                </Text>
                              </SimpleGrid>
                            </VStack>
                          </Box>
                        ))}
                        {searchResults.length === 0 ? (
                          <Text color={sideConfig.mutedTextColor}>
                            {search.emptyDescription}
                          </Text>
                        ) : null}
                      </VStack>
                    )}
                  </Box>
                </VStack>
              </Box>
            </MotionDiv>
          </SimpleGrid>

          <MotionDiv animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 24 }} transition={transition}>
            <Box>
              <Heading as="h2" mb={2} size="lg">
                {skills.heading}
              </Heading>
              <Text color={sideConfig.mutedTextColor} maxW="3xl" mb={4}>
                {skills.description}
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
                {skills.items.map((item) => (
                  <MotionDiv key={item.title} transition={transition} whileHover={{ scale: 1.02, y: -4 }}>
                    <Box
                      bg={sideConfig.panelSurface}
                      border="1px solid"
                      borderColor={item.side === "light" ? "cyan.400" : "red.500"}
                      borderRadius={currentSide === "light" ? "3xl" : "xl"}
                      h="full"
                      p={5}
                    >
                      <VStack align="stretch" gap={3}>
                        <Badge colorPalette={item.side === "light" ? "blue" : "red"} maxW="fit-content">
                          {item.side === "light" ? "Kyber" : "Fracture"}
                        </Badge>
                        <Heading as="h3" size="md">
                          {item.title}
                        </Heading>
                        <Text color={sideConfig.mutedTextColor}>{item.description}</Text>
                      </VStack>
                    </Box>
                  </MotionDiv>
                ))}
              </SimpleGrid>
            </Box>
          </MotionDiv>

          <MotionDiv animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 24 }} transition={transition}>
            <Box>
              <Heading as="h2" mb={4} size="lg">
                {featured.heading}
              </Heading>
              <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
                {featured.collections.map((collection) => (
                  <FeaturedCollection
                    collection={collection}
                    currentSide={currentSide}
                    key={collection.heading}
                    labels={featured.labels}
                    mutedTextColor={sideConfig.mutedTextColor}
                  />
                ))}
              </SimpleGrid>
            </Box>
          </MotionDiv>

          <MotionDiv animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 24 }} transition={transition}>
            <Box>
              <Heading as="h2" mb={2} size="lg">
                {projects.heading}
              </Heading>
              <Text color={sideConfig.mutedTextColor} maxW="3xl" mb={4}>
                {projects.description}
              </Text>
              <SimpleGrid columns={{ base: 1, xl: 3 }} gap={4}>
                {projects.items.map((item) => (
                  <ProjectCard
                    currentSide={currentSide}
                    item={item}
                    key={item.projectKey}
                    labels={projects.labels}
                  />
                ))}
              </SimpleGrid>
            </Box>
          </MotionDiv>

          <MotionDiv animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 24 }} transition={transition}>
            <Box>
              <Heading as="h2" mb={2} size="lg">
                {starships.heading}
              </Heading>
              <Text color={sideConfig.mutedTextColor} maxW="3xl" mb={4}>
                {starships.description}
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                {starships.items.map((item) => (
                  <Box
                    bg={sideConfig.panelSurface}
                    border="1px solid"
                    borderColor={item.side === "light" ? "cyan.400" : "red.500"}
                    borderRadius={currentSide === "light" ? "3xl" : "xl"}
                    key={item.name}
                    p={5}
                  >
                    <VStack align="stretch" gap={3}>
                      <HStack justify="space-between" wrap="wrap">
                        <Heading as="h3" size="md">
                          {item.name}
                        </Heading>
                        <Badge colorPalette={item.side === "light" ? "blue" : "red"}>
                          {item.shipClass}
                        </Badge>
                      </HStack>
                      <SimpleGrid columns={1} gap={2}>
                        <Text color={sideConfig.mutedTextColor}>
                          {starships.labels.manufacturer}: {item.manufacturer}
                        </Text>
                        <Text color={sideConfig.mutedTextColor}>
                          {starships.labels.crew}: {item.crew}
                        </Text>
                        <Text color={sideConfig.mutedTextColor}>
                          {starships.labels.hyperdrive}: {item.hyperdriveRating}
                        </Text>
                        <Text color={sideConfig.mutedTextColor}>
                          {starships.labels.speed}: {item.maxAtmospheringSpeed}
                        </Text>
                      </SimpleGrid>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </MotionDiv>

          <MotionDiv animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 24 }} transition={transition}>
            <Box>
              <Heading as="h2" mb={2} size="lg">
                {timeline.heading}
              </Heading>
              <Text color={sideConfig.mutedTextColor} maxW="3xl" mb={4}>
                {timeline.description}
              </Text>
              <VStack align="stretch" gap={4}>
                {timeline.items.map((item) => (
                  <Box
                    bg={sideConfig.panelSurface}
                    borderLeft="4px solid"
                    borderLeftColor={sideConfig.cardBorderColor}
                    borderRadius={currentSide === "light" ? "3xl" : "xl"}
                    key={item.title}
                    p={5}
                  >
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between" wrap="wrap">
                        <Heading as="h3" size="md">
                          {item.title}
                        </Heading>
                        <Badge colorPalette={currentSide === "light" ? "blue" : "red"}>
                          {item.episodeLabel}
                        </Badge>
                      </HStack>
                      <Text color={sideConfig.mutedTextColor}>{item.openingCrawl}</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
                        <Text color={sideConfig.mutedTextColor}>
                          {timeline.labels.director}: {item.director}
                        </Text>
                        <Text color={sideConfig.mutedTextColor}>
                          {timeline.labels.release}: {item.releaseDate}
                        </Text>
                      </SimpleGrid>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </MotionDiv>

          <MotionDiv animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 24 }} transition={transition}>
            <Box
              bg={sideConfig.panelSurface}
              border="1px solid"
              borderColor={sideConfig.cardBorderColor}
              borderRadius={currentSide === "light" ? "4xl" : "2xl"}
              p={{ base: 5, md: 6 }}
            >
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
                <VStack align="stretch" gap={3}>
                  <Heading as="h2" size="lg">
                    {contact.heading}
                  </Heading>
                  <Text color={sideConfig.mutedTextColor}>{currentContactDescription}</Text>
                  <HStack gap={3} wrap="wrap">
                    <ChakraLink
                      _hover={{ textDecoration: "none" }}
                      bg={currentSide === "light" ? "blue.500" : "red.500"}
                      borderRadius="full"
                      color="white"
                      href={contact.primaryActionHref}
                      px={5}
                      py={2.5}
                      textDecoration="none"
                    >
                      {contact.primaryActionLabel}
                    </ChakraLink>
                    <Link href={contact.secondaryActionHref}>
                      <Text color={sideConfig.accentColor} fontWeight="semibold">
                        {contact.secondaryActionLabel}
                      </Text>
                    </Link>
                  </HStack>
                </VStack>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box bg="blackAlpha.320" borderRadius="2xl" p={4}>
                    <Text color={sideConfig.mutedTextColor} fontSize="xs" textTransform="uppercase">
                      {contact.channelLabel}
                    </Text>
                    <Text color="white" fontWeight="semibold" mt={2}>
                      {contact.channelValue}
                    </Text>
                  </Box>
                  <Box bg="blackAlpha.320" borderRadius="2xl" p={4}>
                    <Text color={sideConfig.mutedTextColor} fontSize="xs" textTransform="uppercase">
                      {contact.responseLabel}
                    </Text>
                    <Text color="white" fontWeight="semibold" mt={2}>
                      {contact.responseValue}
                    </Text>
                  </Box>
                </SimpleGrid>
              </SimpleGrid>
            </Box>
          </MotionDiv>
        </VStack>
      </Box>
    </Box>
  );
}
