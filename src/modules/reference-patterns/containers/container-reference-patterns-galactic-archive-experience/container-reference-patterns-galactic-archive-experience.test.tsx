import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import type { ContainerReferencePatternsGalacticArchiveExperienceProps } from "./types";

const mockReferencePatternsGalacticArchive = vi.hoisted(() =>
  vi.fn<(_: unknown) => null>(() => null),
);
const mockUseGalacticArchiveExperience = vi.hoisted(() => vi.fn());
const mockHandleChangeSearch = vi.hoisted(() => vi.fn());
const mockHandleSelectSide = vi.hoisted(() => vi.fn());
const mockHandleToggleSound = vi.hoisted(() => vi.fn());

vi.mock("@/modules/reference-patterns/components/reference-patterns-galactic-archive", () => ({
  ReferencePatternsGalacticArchive: mockReferencePatternsGalacticArchive,
}));
vi.mock("@/modules/reference-patterns/hooks/use-galactic-archive-experience", () => ({
  useGalacticArchiveExperience: mockUseGalacticArchiveExperience,
}));

import { ContainerReferencePatternsGalacticArchiveExperience } from "./container-reference-patterns-galactic-archive-experience";

const props = {
  about: {
    descriptions: { dark: "Dark bio", light: "Light bio" },
    heading: "About",
    metrics: [{ label: "Stack", value: "Next.js" }],
    titles: { dark: "Sith", light: "Jedi" },
  },
  contact: {
    channelLabel: "Channel",
    channelValue: "test@example.com",
    descriptions: { dark: "Dark contact", light: "Light contact" },
    heading: "Contact",
    primaryActionHref: "mailto:test@example.com",
    primaryActionLabel: "Open transmission",
    responseLabel: "Response",
    responseValue: "Fast",
    secondaryActionHref: "/reference-patterns/workflow-foundations",
    secondaryActionLabel: "See proof",
  },
  featured: {
    collections: [],
    heading: "Featured",
    labels: {
      birthYear: "Birth year",
      films: "Films",
      noStarships: "No starships",
      starships: "Starships",
    },
  },
  hero: {
    description: "Choose your side",
    eyebrow: "Choose",
    heading: "Galactic Archive",
    sideOptions: [
      { description: "Hope", label: "Light", side: "light" },
      { description: "Power", label: "Dark", side: "dark" },
    ],
    soundDisabledLabel: "Sound off",
    soundEnabledLabel: "Sound on",
    statusDescription: "Synced",
    statusLabel: "Archive",
    systems: [{ label: "SWAPI", online: true }],
  },
  initialSearchQuery: "Luke",
  initialSearchResults: [
    {
      birthYear: "19BBY",
      filmCount: 4,
      gender: "male",
      name: "Luke Skywalker",
      starshipCount: 2,
      url: "https://swapi.dev/api/people/1/",
    },
  ],
  initialSide: "light",
  projects: {
    description: "Projects",
    heading: "Projects",
    items: [],
    labels: {
      film: "Film",
      manufacturer: "Maker",
      shipClass: "Class",
    },
  },
  search: {
    birthYearLabel: "Birth year",
    description: "Search the archive",
    emptyDescription: "Start typing",
    emptyTitle: "No results",
    errorPrefix: "Error",
    filmsLabel: "Films",
    genderLabel: "Gender",
    heading: "Search",
    hint: "Search hint",
    label: "Search label",
    placeholder: "Luke",
    starshipsLabel: "Starships",
  },
  skills: {
    description: "Skills",
    heading: "Skills",
    items: [],
  },
  starships: {
    description: "Starships",
    heading: "Starships",
    items: [],
    labels: {
      crew: "Crew",
      hyperdrive: "Hyperdrive",
      manufacturer: "Manufacturer",
      speed: "Speed",
    },
  },
  timeline: {
    description: "Timeline",
    heading: "Timeline",
    items: [],
    labels: {
      director: "Director",
      release: "Release",
    },
  },
} satisfies ContainerReferencePatternsGalacticArchiveExperienceProps;

describe("ContainerReferencePatternsGalacticArchiveExperience", () => {
  it("passes server content and interactive state into the presenter", () => {
    mockUseGalacticArchiveExperience.mockReturnValue({
      currentSide: "dark",
      handleChangeSearch: mockHandleChangeSearch,
      handleSelectSide: mockHandleSelectSide,
      handleToggleSound: mockHandleToggleSound,
      isSearchLoading: true,
      isSoundEnabled: false,
      searchError: "Transmission jammed",
      searchQuery: "Vader",
      searchResults: props.initialSearchResults,
    });

    renderWithProviders(
      <ContainerReferencePatternsGalacticArchiveExperience {...props} />,
    );

    expect(mockUseGalacticArchiveExperience).toHaveBeenCalledWith({
      initialSearchQuery: "Luke",
      initialSearchResults: props.initialSearchResults,
      initialSide: "light",
    });

    expect(mockReferencePatternsGalacticArchive).toHaveBeenCalled();
    expect(mockReferencePatternsGalacticArchive.mock.calls[0]?.[0]).toMatchObject({
      about: props.about,
      contact: props.contact,
      currentSide: "dark",
      featured: props.featured,
      hero: props.hero,
      isSearchLoading: true,
      isSoundEnabled: false,
      onChangeSearch: mockHandleChangeSearch,
      onSelectSide: mockHandleSelectSide,
      onToggleSound: mockHandleToggleSound,
      projects: props.projects,
      search: props.search,
      searchError: "Transmission jammed",
      searchQuery: "Vader",
      searchResults: props.initialSearchResults,
      skills: props.skills,
      starships: props.starships,
      timeline: props.timeline,
    });
  });
});
