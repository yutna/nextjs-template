import type { GalacticArchiveSide } from "@/modules/reference-patterns/lib/galactic-archive-query-state";

export interface GalacticArchiveApiStatus {
  filmsOnline: boolean;
  peopleOnline: boolean;
  rootOnline: boolean;
  starshipsOnline: boolean;
}

export interface GalacticArchiveFeaturedCharacter {
  birthYear: string;
  filmCount: number;
  name: string;
  profileKey: string;
  side: GalacticArchiveSide;
  starshipCount: number;
  starshipNames: ReadonlyArray<string>;
}

export interface GalacticArchiveProjectMetadata {
  featuredFilmTitle: string;
  manufacturer: string;
  projectKey: string;
  shipClass: string;
  shipName: string;
  side: GalacticArchiveSide;
}

export interface GalacticArchiveSearchResult {
  birthYear: string;
  filmCount: number;
  gender: string;
  name: string;
  starshipCount: number;
  url: string;
}

export interface GalacticArchiveStarshipSpotlight {
  crew: string;
  hyperdriveRating: string;
  manufacturer: string;
  maxAtmospheringSpeed: string;
  name: string;
  shipClass: string;
  side: GalacticArchiveSide;
}

export interface GalacticArchiveTimelineEntry {
  director: string;
  episodeId: number;
  openingCrawl: string;
  releaseDate: string;
  title: string;
}

export interface GalacticArchiveViewModel {
  apiStatus: GalacticArchiveApiStatus;
  featuredCharacters: ReadonlyArray<GalacticArchiveFeaturedCharacter>;
  projectMetadata: ReadonlyArray<GalacticArchiveProjectMetadata>;
  starshipSpotlights: ReadonlyArray<GalacticArchiveStarshipSpotlight>;
  timeline: ReadonlyArray<GalacticArchiveTimelineEntry>;
}
