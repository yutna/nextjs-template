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
