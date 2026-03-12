import { Effect } from "effect";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/shared/lib/fetcher", () => ({
  fetchClient: vi.fn(),
}));

import { fetchClient } from "@/shared/lib/fetcher";

import { SwapiRequestError, SwapiValidationError } from "./errors";
import { getSwapiPeopleByIds } from "./get-swapi-people-by-ids";
import { getSwapiRoot } from "./get-swapi-root";
import { listSwapiFilms } from "./list-swapi-films";
import { listSwapiStarships } from "./list-swapi-starships";
import { createSwapiListResponseSchema, swapiPersonSchema, swapiRootSchema } from "./schemas";
import { searchSwapiPeople } from "./search-swapi-people";
import { swapiClient } from "./swapi-client";

const mockFetchClient = vi.mocked(fetchClient);

describe("SwapiRequestError", () => {
  it("formats an Error instance into a readable message", () => {
    const err = new SwapiRequestError("/people/", new Error("network timeout"));

    expect(err.message).toContain("network timeout");
    expect(err.endpoint).toBe("/people/");
    expect(err._tag).toBe("SwapiRequestError");
  });

  it("formats a non-Error thrown value as 'Unknown error'", () => {
    const err = new SwapiRequestError("/films/", "something weird");

    expect(err.message).toContain("Unknown error");
    expect(err.endpoint).toBe("/films/");
  });
});

describe("SwapiValidationError", () => {
  it("formats an Error instance into a readable message", () => {
    const err = new SwapiValidationError("/starships/", new Error("schema mismatch"));

    expect(err.message).toContain("schema mismatch");
    expect(err.endpoint).toBe("/starships/");
    expect(err._tag).toBe("SwapiValidationError");
  });

  it("formats a non-Error thrown value as 'Unknown error'", () => {
    const err = new SwapiValidationError("/people/1/", 42);

    expect(err.message).toContain("Unknown error");
  });
});

describe("createSwapiListResponseSchema", () => {
  it("validates a well-formed list response", () => {
    const schema = createSwapiListResponseSchema(swapiPersonSchema);
    const raw = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          birth_year: "19BBY",
          created: "2026-01-01T00:00:00.000Z",
          edited: "2026-01-01T00:00:00.000Z",
          eye_color: "blue",
          films: [],
          gender: "male",
          hair_color: "blond",
          height: "172",
          homeworld: "https://swapi.dev/api/planets/1/",
          mass: "77",
          name: "Luke Skywalker",
          skin_color: "fair",
          species: [],
          starships: [],
          url: "https://swapi.dev/api/people/1/",
          vehicles: [],
        },
      ],
    };

    expect(schema.parse(raw).results).toHaveLength(1);
  });
});

describe("swapiRootSchema", () => {
  it("parses a valid SWAPI root response", () => {
    const raw = {
      films: "https://swapi.dev/api/films/",
      people: "https://swapi.dev/api/people/",
      planets: "https://swapi.dev/api/planets/",
      species: "https://swapi.dev/api/species/",
      starships: "https://swapi.dev/api/starships/",
      vehicles: "https://swapi.dev/api/vehicles/",
    };

    expect(swapiRootSchema.parse(raw).films).toBe("https://swapi.dev/api/films/");
  });
});

describe("swapiClient", () => {
  it("resolves with the parsed response on success", async () => {
    const payload = {
      films: "https://swapi.dev/api/films/",
      people: "https://swapi.dev/api/people/",
      planets: "https://swapi.dev/api/planets/",
      species: "https://swapi.dev/api/species/",
      starships: "https://swapi.dev/api/starships/",
      vehicles: "https://swapi.dev/api/vehicles/",
    };
    mockFetchClient.mockResolvedValueOnce(payload);

    const result = await Effect.runPromise(
      swapiClient({ endpoint: "/", schema: swapiRootSchema }),
    );

    expect(result.films).toBe("https://swapi.dev/api/films/");
  });

  it("rejects with SwapiRequestError when the fetch fails", async () => {
    mockFetchClient.mockRejectedValueOnce(new Error("fetch failed"));

    await expect(
      Effect.runPromise(swapiClient({ endpoint: "/people/", schema: swapiPersonSchema })),
    ).rejects.toThrow(/SWAPI request failed/);
  });

  it("rejects with SwapiValidationError when the response fails schema validation", async () => {
    mockFetchClient.mockResolvedValueOnce({ unexpected: true });

    await expect(
      Effect.runPromise(swapiClient({ endpoint: "/people/", schema: swapiPersonSchema })),
    ).rejects.toThrow(/SWAPI validation failed/);
  });
});

describe("getSwapiRoot", () => {
  it("returns an Effect that resolves with the root resource", async () => {
    const payload = {
      films: "https://swapi.dev/api/films/",
      people: "https://swapi.dev/api/people/",
      planets: "https://swapi.dev/api/planets/",
      species: "https://swapi.dev/api/species/",
      starships: "https://swapi.dev/api/starships/",
      vehicles: "https://swapi.dev/api/vehicles/",
    };
    mockFetchClient.mockResolvedValueOnce(payload);

    const result = await Effect.runPromise(getSwapiRoot());

    expect(result.films).toBe("https://swapi.dev/api/films/");
  });
});

describe("listSwapiFilms", () => {
  it("returns a sorted list of films", async () => {
    const payload = {
      count: 2,
      next: null,
      previous: null,
      results: [
        buildMinimalFilm({ episode_id: 5, title: "The Empire Strikes Back", url: "https://swapi.dev/api/films/2/" }),
        buildMinimalFilm({ episode_id: 4, title: "A New Hope", url: "https://swapi.dev/api/films/1/" }),
      ],
    };
    mockFetchClient.mockResolvedValueOnce(payload);

    const result = await Effect.runPromise(listSwapiFilms());

    expect(result[0].title).toBe("A New Hope");
  });
});

describe("listSwapiStarships", () => {
  it("returns a list of starships", async () => {
    const payload = {
      count: 1,
      next: null,
      previous: null,
      results: [buildMinimalStarship()],
    };
    mockFetchClient.mockResolvedValueOnce(payload);

    const result = await Effect.runPromise(listSwapiStarships());

    expect(result).toHaveLength(1);
  });
});

describe("searchSwapiPeople", () => {
  it("returns people matching the search query", async () => {
    const payload = {
      count: 1,
      next: null,
      previous: null,
      results: [buildMinimalPerson({ name: "Luke Skywalker" })],
    };
    mockFetchClient.mockResolvedValueOnce(payload);

    const result = await Effect.runPromise(searchSwapiPeople("Luke"));

    expect(result[0].name).toBe("Luke Skywalker");
  });
});

describe("getSwapiPeopleByIds", () => {
  it("returns people for each requested ID", async () => {
    mockFetchClient
      .mockResolvedValueOnce(buildMinimalPerson({ name: "Luke Skywalker", url: "https://swapi.dev/api/people/1/" }))
      .mockResolvedValueOnce(buildMinimalPerson({ name: "Darth Vader", url: "https://swapi.dev/api/people/4/" }));

    const result = await Effect.runPromise(getSwapiPeopleByIds([1, 4]));

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Luke Skywalker");
  });
});

// ---------------------------------------------------------------------------
// Minimal fixture builders
// ---------------------------------------------------------------------------

function buildMinimalPerson(overrides: Record<string, unknown> = {}) {
  return {
    birth_year: "19BBY",
    created: "2026-01-01T00:00:00.000Z",
    edited: "2026-01-01T00:00:00.000Z",
    eye_color: "blue",
    films: [],
    gender: "male",
    hair_color: "blond",
    height: "172",
    homeworld: "https://swapi.dev/api/planets/1/",
    mass: "77",
    name: "Person",
    skin_color: "fair",
    species: [],
    starships: [],
    url: "https://swapi.dev/api/people/1/",
    vehicles: [],
    ...overrides,
  };
}

function buildMinimalFilm(overrides: Record<string, unknown> = {}) {
  return {
    characters: [],
    created: "2026-01-01T00:00:00.000Z",
    director: "George Lucas",
    edited: "2026-01-01T00:00:00.000Z",
    episode_id: 4,
    opening_crawl: "Long ago...",
    planets: [],
    producer: "Gary Kurtz",
    release_date: "1977-05-25",
    species: [],
    starships: [],
    title: "A New Hope",
    url: "https://swapi.dev/api/films/1/",
    vehicles: [],
    ...overrides,
  };
}

function buildMinimalStarship(overrides: Record<string, unknown> = {}) {
  return {
    cargo_capacity: "100000",
    consumables: "2 months",
    cost_in_credits: "100000",
    created: "2026-01-01T00:00:00.000Z",
    crew: "4",
    edited: "2026-01-01T00:00:00.000Z",
    films: [],
    hyperdrive_rating: "0.5",
    length: "34.37",
    manufacturer: "Corellian Engineering Corporation",
    max_atmosphering_speed: "1050",
    MGLT: "75",
    model: "YT-1300 light freighter",
    name: "Millennium Falcon",
    passengers: "6",
    pilots: [],
    starship_class: "Light freighter",
    url: "https://swapi.dev/api/starships/10/",
    ...overrides,
  };
}
