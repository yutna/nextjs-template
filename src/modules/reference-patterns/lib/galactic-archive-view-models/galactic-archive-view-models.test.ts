import { describe, expect, it } from "vitest";

import {
  buildGalacticArchiveViewModel,
  normalizeGalacticArchiveSearchResults,
} from "./galactic-archive-view-models";

import type { SwapiFilm, SwapiPerson, SwapiRoot, SwapiStarship } from "@/shared/api/swapi";

function createPerson(overrides: Partial<SwapiPerson>): SwapiPerson {
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
    name: "Luke Skywalker",
    skin_color: "fair",
    species: [],
    starships: [],
    url: "https://swapi.dev/api/people/1/",
    vehicles: [],
    ...overrides,
  };
}

function createFilm(overrides: Partial<SwapiFilm>): SwapiFilm {
  return {
    characters: [],
    created: "2026-01-01T00:00:00.000Z",
    director: "George Lucas",
    edited: "2026-01-01T00:00:00.000Z",
    episode_id: 4,
    opening_crawl: "Opening crawl ".repeat(20),
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

function createStarship(overrides: Partial<SwapiStarship>): SwapiStarship {
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

describe("galacticArchiveViewModels", () => {
  it("normalizes live search results", () => {
    const results = normalizeGalacticArchiveSearchResults([
      createPerson({
        films: ["https://swapi.dev/api/films/1/", "https://swapi.dev/api/films/2/"],
        gender: "female",
        name: "Leia Organa",
        starships: ["https://swapi.dev/api/starships/12/"],
        url: "https://swapi.dev/api/people/5/",
      }),
    ]);

    expect(results).toEqual([
      {
        birthYear: "19BBY",
        filmCount: 2,
        gender: "female",
        name: "Leia Organa",
        starshipCount: 1,
        url: "https://swapi.dev/api/people/5/",
      },
    ]);
  });

  it("builds curated portfolio metadata from SWAPI resources", () => {
    const root: SwapiRoot = {
      films: "https://swapi.dev/api/films/",
      people: "https://swapi.dev/api/people/",
      planets: "https://swapi.dev/api/planets/",
      species: "https://swapi.dev/api/species/",
      starships: "https://swapi.dev/api/starships/",
      vehicles: "https://swapi.dev/api/vehicles/",
    };
    const films = [
      createFilm({ episode_id: 4, title: "A New Hope" }),
      createFilm({ episode_id: 5, title: "The Empire Strikes Back", url: "https://swapi.dev/api/films/2/" }),
    ];
    const featuredPeople = [
      createPerson({
        films: ["https://swapi.dev/api/films/1/", "https://swapi.dev/api/films/2/"],
        name: "Luke Skywalker",
        starships: ["https://swapi.dev/api/starships/12/"],
        url: "https://swapi.dev/api/people/1/",
      }),
      createPerson({
        birth_year: "41.9BBY",
        films: ["https://swapi.dev/api/films/1/"],
        name: "Darth Vader",
        starships: ["https://swapi.dev/api/starships/9/"],
        url: "https://swapi.dev/api/people/4/",
      }),
    ];
    const starships = [
      createStarship({ name: "Millennium Falcon", url: "https://swapi.dev/api/starships/10/" }),
      createStarship({
        hyperdrive_rating: "1.0",
        manufacturer: "Incom Corporation",
        max_atmosphering_speed: "1050",
        model: "T-65 X-wing",
        name: "X-wing",
        starship_class: "Starfighter",
        url: "https://swapi.dev/api/starships/12/",
      }),
      createStarship({
        crew: "342953",
        hyperdrive_rating: "4.0",
        manufacturer: "Imperial Department of Military Research",
        model: "DS-1 Orbital Battle Station",
        name: "Death Star",
        starship_class: "Deep Space Mobile Battlestation",
        url: "https://swapi.dev/api/starships/9/",
      }),
    ];

    const viewModel = buildGalacticArchiveViewModel({
      featuredPeople,
      films,
      root,
      starships,
    });

    expect(viewModel.apiStatus).toEqual({
      filmsOnline: true,
      peopleOnline: true,
      rootOnline: true,
      starshipsOnline: true,
    });
    expect(viewModel.featuredCharacters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Luke Skywalker",
          profileKey: "luke",
          side: "light",
          starshipNames: ["X-wing"],
        }),
        expect.objectContaining({
          name: "Darth Vader",
          profileKey: "vader",
          side: "dark",
          starshipNames: ["Death Star"],
        }),
      ]),
    );
    expect(viewModel.projectMetadata).toEqual([
      expect.objectContaining({ projectKey: "auroraRelay", shipName: "Millennium Falcon" }),
      expect.objectContaining({ projectKey: "kyberAtlas", shipName: "X-wing" }),
      expect.objectContaining({ projectKey: "shadowCommand", shipName: "Death Star" }),
    ]);
    expect(viewModel.starshipSpotlights).toEqual([
      expect.objectContaining({ name: "Millennium Falcon", side: "light" }),
      expect.objectContaining({ name: "X-wing", side: "light" }),
      expect.objectContaining({ name: "Death Star", side: "dark" }),
    ]);
    expect(viewModel.timeline).toEqual([
      expect.objectContaining({
        director: "George Lucas",
        episodeId: 4,
        openingCrawl: expect.stringMatching(/\.\.\.$/),
        title: "A New Hope",
      }),
      expect.objectContaining({
        episodeId: 5,
        title: "The Empire Strikes Back",
      }),
    ]);
  });
});
