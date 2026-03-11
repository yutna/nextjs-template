import {
  GALACTIC_ARCHIVE_FEATURED_CHARACTER_DEFINITIONS,
  GALACTIC_ARCHIVE_PROJECT_DEFINITIONS,
  GALACTIC_ARCHIVE_STARSHIP_SPOTLIGHT_NAMES,
} from "@/modules/reference-patterns/constants/galactic-archive-curation";

import type {
  SwapiFilm,
  SwapiPerson,
  SwapiRoot,
  SwapiStarship,
} from "@/shared/api/swapi";
import type {
  GalacticArchiveSearchResult,
  GalacticArchiveViewModel,
} from "./types";

const OPENING_CRAWL_PREVIEW_LENGTH = 180;

interface BuildGalacticArchiveViewModelOptions {
  featuredPeople: ReadonlyArray<SwapiPerson>;
  films: ReadonlyArray<SwapiFilm>;
  root: null | SwapiRoot;
  starships: ReadonlyArray<SwapiStarship>;
}

function buildOpeningCrawlPreview(openingCrawl: string): string {
  const normalizedCrawl = openingCrawl.replace(/\s+/g, " ").trim();

  if (normalizedCrawl.length <= OPENING_CRAWL_PREVIEW_LENGTH) {
    return normalizedCrawl;
  }

  return `${normalizedCrawl.slice(0, OPENING_CRAWL_PREVIEW_LENGTH).trimEnd()}...`;
}

function buildStarshipsByName(starships: ReadonlyArray<SwapiStarship>) {
  return new Map(starships.map((starship) => [starship.name, starship]));
}

function buildStarshipsByUrl(starships: ReadonlyArray<SwapiStarship>) {
  return new Map(starships.map((starship) => [starship.url, starship]));
}

function extractSwapiId(url: string): null | number {
  const match = /\/(\d+)\/?$/.exec(url);

  return match ? Number(match[1]) : null;
}

export function normalizeGalacticArchiveSearchResults(
  people: ReadonlyArray<SwapiPerson>,
): ReadonlyArray<GalacticArchiveSearchResult> {
  return people.map((person) => ({
    birthYear: person.birth_year,
    filmCount: person.films.length,
    gender: person.gender,
    name: person.name,
    starshipCount: person.starships.length,
    url: person.url,
  }));
}

export function buildGalacticArchiveViewModel({
  featuredPeople,
  films,
  root,
  starships,
}: Readonly<BuildGalacticArchiveViewModelOptions>): GalacticArchiveViewModel {
  const starshipsByName = buildStarshipsByName(starships);
  const starshipsByUrl = buildStarshipsByUrl(starships);
  const peopleById = new Map(
    featuredPeople.map((person) => [extractSwapiId(person.url), person]),
  );

  return {
    apiStatus: {
      filmsOnline: films.length > 0,
      peopleOnline: featuredPeople.length > 0,
      rootOnline: root !== null,
      starshipsOnline: starships.length > 0,
    },
    featuredCharacters: GALACTIC_ARCHIVE_FEATURED_CHARACTER_DEFINITIONS.flatMap(
      ({ id, profileKey, side }) => {
        const person = peopleById.get(id);

        if (!person) {
          return [];
        }

        return [
          {
            birthYear: person.birth_year,
            filmCount: person.films.length,
            name: person.name,
            profileKey,
            side,
            starshipCount: person.starships.length,
            starshipNames: person.starships
              .map((starshipUrl) => starshipsByUrl.get(starshipUrl)?.name)
              .filter((starshipName): starshipName is string => Boolean(starshipName))
              .slice(0, 2),
          },
        ];
      },
    ),
    projectMetadata: GALACTIC_ARCHIVE_PROJECT_DEFINITIONS.flatMap(
      ({ episodeId, projectKey, shipName, side }) => {
        const film = films.find((item) => item.episode_id === episodeId);
        const starship = starshipsByName.get(shipName);

        if (!film || !starship) {
          return [];
        }

        return [
          {
            featuredFilmTitle: film.title,
            manufacturer: starship.manufacturer,
            projectKey,
            shipClass: starship.starship_class,
            shipName: starship.name,
            side,
          },
        ];
      },
    ),
    starshipSpotlights: GALACTIC_ARCHIVE_STARSHIP_SPOTLIGHT_NAMES.flatMap(
      (shipName, index) => {
        const starship = starshipsByName.get(shipName);

        if (!starship) {
          return [];
        }

        return [
          {
            crew: starship.crew,
            hyperdriveRating: starship.hyperdrive_rating,
            manufacturer: starship.manufacturer,
            maxAtmospheringSpeed: starship.max_atmosphering_speed,
            name: starship.name,
            shipClass: starship.starship_class,
            side: index < 2 ? "light" : "dark",
          },
        ];
      },
    ),
    timeline: films.map((film) => ({
      director: film.director,
      episodeId: film.episode_id,
      openingCrawl: buildOpeningCrawlPreview(film.opening_crawl),
      releaseDate: film.release_date,
      title: film.title,
    })),
  };
}
