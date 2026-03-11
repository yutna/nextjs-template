import type { GalacticArchiveSide } from "@/modules/reference-patterns/lib/galactic-archive-query-state";

export interface GalacticArchiveFeaturedCharacterDefinition {
  id: number;
  profileKey: string;
  side: GalacticArchiveSide;
}

export interface GalacticArchiveProjectDefinition {
  episodeId: number;
  projectKey: string;
  shipName: string;
  side: GalacticArchiveSide;
}

export const GALACTIC_ARCHIVE_FEATURED_CHARACTER_DEFINITIONS: ReadonlyArray<
  GalacticArchiveFeaturedCharacterDefinition
> = [
  { id: 1, profileKey: "luke", side: "light" },
  { id: 5, profileKey: "leia", side: "light" },
  { id: 10, profileKey: "obiWan", side: "light" },
  { id: 20, profileKey: "yoda", side: "light" },
  { id: 4, profileKey: "vader", side: "dark" },
  { id: 21, profileKey: "palpatine", side: "dark" },
  { id: 22, profileKey: "bobaFett", side: "dark" },
  { id: 12, profileKey: "tarkin", side: "dark" },
];

export const GALACTIC_ARCHIVE_PROJECT_DEFINITIONS: ReadonlyArray<
  GalacticArchiveProjectDefinition
> = [
  {
    episodeId: 4,
    projectKey: "auroraRelay",
    shipName: "Millennium Falcon",
    side: "light",
  },
  {
    episodeId: 5,
    projectKey: "kyberAtlas",
    shipName: "X-wing",
    side: "light",
  },
  {
    episodeId: 4,
    projectKey: "shadowCommand",
    shipName: "Death Star",
    side: "dark",
  },
];

export const GALACTIC_ARCHIVE_STARSHIP_SPOTLIGHT_NAMES = [
  "Millennium Falcon",
  "X-wing",
  "Death Star",
] as const;
