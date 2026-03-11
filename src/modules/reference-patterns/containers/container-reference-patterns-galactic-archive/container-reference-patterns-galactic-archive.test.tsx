import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerReferencePatternsGalacticArchive } from "./container-reference-patterns-galactic-archive";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));
vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));
vi.mock(
  "@/modules/reference-patterns/containers/container-reference-patterns-galactic-archive-experience",
  () => ({
    ContainerReferencePatternsGalacticArchiveExperience: () => null,
  }),
);
vi.mock("@/modules/reference-patterns/lib/galactic-archive-view-models", () => ({
  buildGalacticArchiveViewModel: vi.fn().mockReturnValue({
    apiStatus: {
      filmsOnline: true,
      peopleOnline: true,
      rootOnline: true,
      starshipsOnline: true,
    },
    featuredCharacters: [],
    projectMetadata: [],
    starshipSpotlights: [],
    timeline: [],
  }),
  normalizeGalacticArchiveSearchResults: vi.fn().mockReturnValue([]),
}));
vi.mock("@/shared/routes", () => ({
  routes: {
    public: {
      referencePatterns: {
        workflowFoundations: {
          path: () => "/reference-patterns/workflow-foundations",
        },
      },
    },
  },
}));
vi.mock("@/shared/api/swapi", async () => {
  const { Effect } = await import("effect");

  return {
    getSwapiPeopleByIds: vi.fn().mockReturnValue(Effect.succeed([])),
    getSwapiRoot: vi.fn().mockReturnValue(
      Effect.succeed({
        films: "https://swapi.dev/api/films/",
        people: "https://swapi.dev/api/people/",
        planets: "https://swapi.dev/api/planets/",
        species: "https://swapi.dev/api/species/",
        starships: "https://swapi.dev/api/starships/",
        vehicles: "https://swapi.dev/api/vehicles/",
      }),
    ),
    listSwapiFilms: vi.fn().mockReturnValue(Effect.succeed([])),
    listSwapiStarships: vi.fn().mockReturnValue(Effect.succeed([])),
    searchSwapiPeople: vi.fn().mockReturnValue(Effect.succeed([])),
  };
});

describe("ContainerReferencePatternsGalacticArchive", () => {
  it("renders without errors", async () => {
    const { container } = renderWithProviders(
      await ContainerReferencePatternsGalacticArchive({
        initialSearchQuery: "",
        locale: "en",
        requestedSide: null,
      }),
    );

    expect(container).toBeDefined();
  });
});
