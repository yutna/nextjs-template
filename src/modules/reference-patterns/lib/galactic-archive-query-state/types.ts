import type { GALACTIC_ARCHIVE_SIDE_VALUES } from "./constants";

export type GalacticArchiveSide = (typeof GALACTIC_ARCHIVE_SIDE_VALUES)[number];

export interface GalacticArchiveQueryState {
  search: string;
  side: GalacticArchiveSide | null;
}
