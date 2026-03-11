import type { GalacticArchiveSide } from "@/modules/reference-patterns/lib/galactic-archive-query-state";
import type { GalacticArchiveSearchResult } from "@/modules/reference-patterns/lib/galactic-archive-view-models";

export interface UseGalacticArchiveExperienceOptions {
  initialSearchQuery: string;
  initialSearchResults: ReadonlyArray<GalacticArchiveSearchResult>;
  initialSide: GalacticArchiveSide;
}

export interface UseGalacticArchiveExperienceReturn {
  currentSide: GalacticArchiveSide;
  handleChangeSearch: (value: string) => void;
  handleSelectSide: (side: GalacticArchiveSide) => void;
  handleToggleSound: () => void;
  isSearchLoading: boolean;
  isSoundEnabled: boolean;
  searchError?: string;
  searchQuery: string;
  searchResults: ReadonlyArray<GalacticArchiveSearchResult>;
}
