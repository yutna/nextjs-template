export const GALACTIC_ARCHIVE_SIDE_VALUES = ["light", "dark"] as const;

export type GalacticArchiveSide = (typeof GALACTIC_ARCHIVE_SIDE_VALUES)[number];

export interface GalacticArchiveQueryState {
  search: string;
  side: GalacticArchiveSide | null;
}
