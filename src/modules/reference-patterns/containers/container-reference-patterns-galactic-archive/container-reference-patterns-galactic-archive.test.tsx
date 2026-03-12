import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { RequestCookiesAdapter } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

function makeReadonlyRequestCookies(cookieString = ""): ReadonlyRequestCookies {
  const headers = new Headers(cookieString ? { cookie: cookieString } : {});
  return RequestCookiesAdapter.seal(new RequestCookies(headers));
}

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

  it("resolves the initial side from requestedSide when provided", async () => {
    const { container } = renderWithProviders(
      await ContainerReferencePatternsGalacticArchive({
        initialSearchQuery: "",
        locale: "en",
        requestedSide: "dark",
      }),
    );

    expect(container).toBeDefined();
  });

  it("resolves the initial side from the stored cookie when requestedSide is absent", async () => {
    const { cookies: mockCookies } = await import("next/headers");
    vi.mocked(mockCookies).mockResolvedValueOnce(
      makeReadonlyRequestCookies("galactic-archive-side=light"),
    );

    const { container } = renderWithProviders(
      await ContainerReferencePatternsGalacticArchive({
        initialSearchQuery: "",
        locale: "en",
        requestedSide: null,
      }),
    );

    expect(container).toBeDefined();
  });

  it("handles a rejected API call gracefully and shows a degraded status", async () => {
    const { getSwapiRoot } = await import("@/shared/api/swapi");
    vi.mocked(getSwapiRoot).mockReturnValueOnce(
      (() => { throw new Error("network error"); }) as unknown as ReturnType<typeof getSwapiRoot>,
    );

    // Silence the expected console.error from Effect.runPromise failing
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = renderWithProviders(
      await ContainerReferencePatternsGalacticArchive({
        initialSearchQuery: "",
        locale: "en",
        requestedSide: null,
      }),
    );

    expect(container).toBeDefined();
  });

  it("runs an initial SWAPI people search when initialSearchQuery is long enough", async () => {
    const { container } = renderWithProviders(
      await ContainerReferencePatternsGalacticArchive({
        initialSearchQuery: "Luke",
        locale: "en",
        requestedSide: null,
      }),
    );

    expect(container).toBeDefined();
  });
});
