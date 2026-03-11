import "server-only";

import { Box, ClientOnly, Heading, Text, VStack } from "@chakra-ui/react";
import { Effect } from "effect";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

import { GALACTIC_ARCHIVE_FEATURED_CHARACTER_DEFINITIONS } from "@/modules/reference-patterns/constants/galactic-archive-curation";
import {
  ContainerReferencePatternsGalacticArchiveExperience,
} from "@/modules/reference-patterns/containers/container-reference-patterns-galactic-archive-experience";
import {
  buildGalacticArchiveViewModel,
  normalizeGalacticArchiveSearchResults,
} from "@/modules/reference-patterns/lib/galactic-archive-view-models";
import {
  getSwapiPeopleByIds,
  getSwapiRoot,
  listSwapiFilms,
  listSwapiStarships,
  searchSwapiPeople,
} from "@/shared/api/swapi";
import { routes } from "@/shared/routes";

import type { GalacticArchiveSide } from "@/modules/reference-patterns/lib/galactic-archive-query-state";
import type { ContainerReferencePatternsGalacticArchiveProps } from "./types";

const FEATURED_CHARACTER_IDS = GALACTIC_ARCHIVE_FEATURED_CHARACTER_DEFINITIONS.map(
  ({ id }) => id,
);
const FEATURED_PROFILE_TITLE_KEYS = {
  bobaFett: "featured.profiles.bobaFett.title",
  leia: "featured.profiles.leia.title",
  luke: "featured.profiles.luke.title",
  obiWan: "featured.profiles.obiWan.title",
  palpatine: "featured.profiles.palpatine.title",
  tarkin: "featured.profiles.tarkin.title",
  vader: "featured.profiles.vader.title",
  yoda: "featured.profiles.yoda.title",
} as const;
const PROJECT_COPY_KEYS = {
  auroraRelay: {
    description: "projects.items.auroraRelay.description",
    title: "projects.items.auroraRelay.title",
  },
  kyberAtlas: {
    description: "projects.items.kyberAtlas.description",
    title: "projects.items.kyberAtlas.title",
  },
  shadowCommand: {
    description: "projects.items.shadowCommand.description",
    title: "projects.items.shadowCommand.title",
  },
} as const;
const SKILL_ITEMS = [
  { key: "systemDesign", side: "light" },
  { key: "experienceDirection", side: "light" },
  { key: "motionSystems", side: "light" },
  { key: "performance", side: "dark" },
  { key: "tooling", side: "dark" },
  { key: "storytelling", side: "dark" },
] as const;

async function getStoredSide(): Promise<GalacticArchiveSide | null> {
  const cookieStore = await cookies();
  const storedSide = cookieStore.get("galactic-archive-side")?.value;

  return storedSide === "light" || storedSide === "dark" ? storedSide : null;
}

export async function ContainerReferencePatternsGalacticArchive({
  initialSearchQuery,
  locale,
  requestedSide,
}: Readonly<ContainerReferencePatternsGalacticArchiveProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.referencePatterns.components.referencePatternsGalacticArchive",
  });
  const normalizedSearchQuery = initialSearchQuery.trim();
  const storedSide = await getStoredSide();
  const initialSide = requestedSide ?? storedSide ?? "light";
  const [
    rootResult,
    filmsResult,
    starshipsResult,
    featuredPeopleResult,
    initialSearchResult,
  ] = await Promise.allSettled([
    Effect.runPromise(getSwapiRoot()),
    Effect.runPromise(listSwapiFilms()),
    Effect.runPromise(listSwapiStarships()),
    Effect.runPromise(getSwapiPeopleByIds(FEATURED_CHARACTER_IDS)),
    normalizedSearchQuery.length >= 2
      ? Effect.runPromise(searchSwapiPeople(normalizedSearchQuery))
      : Promise.resolve([]),
  ]);

  const root = rootResult.status === "fulfilled" ? rootResult.value : null;
  const films = filmsResult.status === "fulfilled" ? filmsResult.value : [];
  const starships =
    starshipsResult.status === "fulfilled" ? starshipsResult.value : [];
  const featuredPeople =
    featuredPeopleResult.status === "fulfilled" ? featuredPeopleResult.value : [];
  const initialSearchPeople =
    initialSearchResult.status === "fulfilled" ? initialSearchResult.value : [];
  const viewModel = buildGalacticArchiveViewModel({
    featuredPeople,
    films,
    root,
    starships,
  });
  const onlineSystemCount = [
    viewModel.apiStatus.rootOnline,
    viewModel.apiStatus.filmsOnline,
    viewModel.apiStatus.peopleOnline,
    viewModel.apiStatus.starshipsOnline,
  ].filter(Boolean).length;

  return (
    <ClientOnly
      fallback={
        <Box
          as="main"
          bg="linear-gradient(180deg, #020817 0%, #111827 100%)"
          color="white"
          minH="100vh"
          px={{ base: 5, md: 8 }}
          py={{ base: 12, md: 20 }}
        >
          <VStack align="stretch" gap={4} maxW="4xl" mx="auto">
            <Text color="cyan.200" fontWeight="semibold">
              {t("hero.eyebrow")}
            </Text>
            <Heading as="h1" size="4xl">
              {t("hero.heading")}
            </Heading>
            <Text color="whiteAlpha.800" fontSize="lg">
              {t("hero.description")}
            </Text>
          </VStack>
        </Box>
      }
    >
      <ContainerReferencePatternsGalacticArchiveExperience
      about={{
        descriptions: {
          dark: t("about.descriptions.dark"),
          light: t("about.descriptions.light"),
        },
        heading: t("about.heading"),
        metrics: [
          {
            label: t("about.metrics.stackLabel"),
            value: t("about.metrics.stackValue"),
          },
          {
            label: t("about.metrics.missionModesLabel"),
            value: t("about.metrics.missionModesValue"),
          },
          {
            label: t("about.metrics.liveSystemsLabel"),
            value: `${onlineSystemCount}/4`,
          },
        ],
        titles: {
          dark: t("about.titles.dark"),
          light: t("about.titles.light"),
        },
      }}
      contact={{
        channelLabel: t("contact.channelLabel"),
        channelValue: t("contact.channelValue"),
        descriptions: {
          dark: t("contact.descriptions.dark"),
          light: t("contact.descriptions.light"),
        },
        heading: t("contact.heading"),
        primaryActionHref: `mailto:${t("contact.channelValue")}`,
        primaryActionLabel: t("contact.primaryActionLabel"),
        responseLabel: t("contact.responseLabel"),
        responseValue: t("contact.responseValue"),
        secondaryActionHref: routes.public.referencePatterns.workflowFoundations.path(),
        secondaryActionLabel: t("contact.secondaryActionLabel"),
      }}
      featured={{
        collections: [
          {
            heading: t("featured.collections.light"),
            items: viewModel.featuredCharacters
              .filter((character) => character.side === "light")
              .map((character) => ({
                birthYear: character.birthYear,
                filmCount: character.filmCount,
                name: character.name,
                profileTitle: t(
                  FEATURED_PROFILE_TITLE_KEYS[
                    character.profileKey as keyof typeof FEATURED_PROFILE_TITLE_KEYS
                  ],
                ),
                side: character.side,
                starshipCount: character.starshipCount,
                starshipNames: character.starshipNames,
              })),
            side: "light",
          },
          {
            heading: t("featured.collections.dark"),
            items: viewModel.featuredCharacters
              .filter((character) => character.side === "dark")
              .map((character) => ({
                birthYear: character.birthYear,
                filmCount: character.filmCount,
                name: character.name,
                profileTitle: t(
                  FEATURED_PROFILE_TITLE_KEYS[
                    character.profileKey as keyof typeof FEATURED_PROFILE_TITLE_KEYS
                  ],
                ),
                side: character.side,
                starshipCount: character.starshipCount,
                starshipNames: character.starshipNames,
              })),
            side: "dark",
          },
        ],
        heading: t("featured.heading"),
        labels: {
          birthYear: t("featured.labels.birthYear"),
          films: t("featured.labels.films"),
          noStarships: t("featured.labels.noStarships"),
          starships: t("featured.labels.starships"),
        },
      }}
      hero={{
        description: t("hero.description"),
        eyebrow: t("hero.eyebrow"),
        heading: t("hero.heading"),
        sideOptions: [
          {
            description: t("hero.sideOptions.light.description"),
            label: t("hero.sideOptions.light.label"),
            side: "light",
          },
          {
            description: t("hero.sideOptions.dark.description"),
            label: t("hero.sideOptions.dark.label"),
            side: "dark",
          },
        ],
        soundDisabledLabel: t("hero.soundDisabled"),
        soundEnabledLabel: t("hero.soundEnabled"),
        statusDescription:
          onlineSystemCount === 4
            ? t("hero.status.syncedDescription")
            : t("hero.status.degradedDescription"),
        statusLabel:
          onlineSystemCount === 4
            ? t("hero.status.syncedLabel")
            : t("hero.status.degradedLabel"),
        systems: [
          {
            label: t("hero.systems.root"),
            online: viewModel.apiStatus.rootOnline,
          },
          {
            label: t("hero.systems.films"),
            online: viewModel.apiStatus.filmsOnline,
          },
          {
            label: t("hero.systems.people"),
            online: viewModel.apiStatus.peopleOnline,
          },
          {
            label: t("hero.systems.starships"),
            online: viewModel.apiStatus.starshipsOnline,
          },
        ],
      }}
      initialSearchQuery={normalizedSearchQuery}
      initialSearchResults={normalizeGalacticArchiveSearchResults(
        initialSearchPeople,
      )}
      initialSide={initialSide}
      projects={{
        description: t("projects.description"),
        heading: t("projects.heading"),
        items: viewModel.projectMetadata.map((project) => ({
          ...project,
          description: t(
            PROJECT_COPY_KEYS[
              project.projectKey as keyof typeof PROJECT_COPY_KEYS
            ].description,
          ),
          title: t(
            PROJECT_COPY_KEYS[
              project.projectKey as keyof typeof PROJECT_COPY_KEYS
            ].title,
          ),
        })),
        labels: {
          film: t("projects.labels.film"),
          manufacturer: t("projects.labels.manufacturer"),
          shipClass: t("projects.labels.shipClass"),
        },
      }}
      search={{
        birthYearLabel: t("search.birthYearLabel"),
        description: t("search.description"),
        emptyDescription: t("search.emptyDescription"),
        emptyTitle: t("search.emptyTitle"),
        errorPrefix: t("search.errorPrefix"),
        filmsLabel: t("search.filmsLabel"),
        genderLabel: t("search.genderLabel"),
        heading: t("search.heading"),
        hint: t("search.hint"),
        label: t("search.label"),
        placeholder: t("search.placeholder"),
        starshipsLabel: t("search.starshipsLabel"),
      }}
      skills={{
        description: t("skills.description"),
        heading: t("skills.heading"),
        items: SKILL_ITEMS.map((item) => ({
          description: t(`skills.items.${item.key}.description`),
          side: item.side,
          title: t(`skills.items.${item.key}.title`),
        })),
      }}
      starships={{
        description: t("starships.description"),
        heading: t("starships.heading"),
        items: viewModel.starshipSpotlights,
        labels: {
          crew: t("starships.labels.crew"),
          hyperdrive: t("starships.labels.hyperdrive"),
          manufacturer: t("starships.labels.manufacturer"),
          speed: t("starships.labels.speed"),
        },
      }}
      timeline={{
        description: t("timeline.description"),
        heading: t("timeline.heading"),
        items: viewModel.timeline.map((entry) => ({
          ...entry,
          episodeLabel: `${t("timeline.episodePrefix")} ${entry.episodeId}`,
        })),
        labels: {
          director: t("timeline.labels.director"),
          release: t("timeline.labels.release"),
        },
      }}
      />
    </ClientOnly>
  );
}
