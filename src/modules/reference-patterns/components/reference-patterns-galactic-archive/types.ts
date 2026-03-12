import type { GalacticArchiveSide } from "@/modules/reference-patterns/lib/galactic-archive-query-state";
import type {
  GalacticArchiveProjectMetadata,
  GalacticArchiveSearchResult,
  GalacticArchiveStarshipSpotlight,
  GalacticArchiveTimelineEntry,
} from "@/modules/reference-patterns/lib/galactic-archive-view-models";

export interface GalacticArchiveSystemState {
  label: string;
  online: boolean;
}

export interface GalacticArchiveHeroSideOption {
  description: string;
  label: string;
  side: GalacticArchiveSide;
}

export interface GalacticArchiveHeroContent {
  description: string;
  eyebrow: string;
  heading: string;
  sideOptions: ReadonlyArray<GalacticArchiveHeroSideOption>;
  soundDisabledLabel: string;
  soundEnabledLabel: string;
  statusDescription: string;
  statusLabel: string;
  systems: ReadonlyArray<GalacticArchiveSystemState>;
}

export interface GalacticArchiveMetric {
  label: string;
  value: string;
}

export interface GalacticArchiveAboutContent {
  descriptions: Record<GalacticArchiveSide, string>;
  heading: string;
  metrics: ReadonlyArray<GalacticArchiveMetric>;
  titles: Record<GalacticArchiveSide, string>;
}

export interface GalacticArchiveSkillCard {
  description: string;
  side: GalacticArchiveSide;
  title: string;
}

export interface GalacticArchiveSkillsContent {
  description: string;
  heading: string;
  items: ReadonlyArray<GalacticArchiveSkillCard>;
}

export interface GalacticArchiveFeaturedCharacterCard {
  birthYear: string;
  filmCount: number;
  name: string;
  profileTitle: string;
  side: GalacticArchiveSide;
  starshipCount: number;
  starshipNames: ReadonlyArray<string>;
}

export interface GalacticArchiveFeaturedCollection {
  heading: string;
  items: ReadonlyArray<GalacticArchiveFeaturedCharacterCard>;
  side: GalacticArchiveSide;
}

export interface GalacticArchiveFeaturedLabels {
  birthYear: string;
  films: string;
  noStarships: string;
  starships: string;
}

export interface GalacticArchiveFeaturedContent {
  collections: ReadonlyArray<GalacticArchiveFeaturedCollection>;
  heading: string;
  labels: GalacticArchiveFeaturedLabels;
}

export interface GalacticArchiveProjectCard extends GalacticArchiveProjectMetadata {
  description: string;
  title: string;
}

export interface GalacticArchiveProjectsLabels {
  film: string;
  manufacturer: string;
  shipClass: string;
}

export interface GalacticArchiveProjectsContent {
  description: string;
  heading: string;
  items: ReadonlyArray<GalacticArchiveProjectCard>;
  labels: GalacticArchiveProjectsLabels;
}

export interface GalacticArchiveStarshipsLabels {
  crew: string;
  hyperdrive: string;
  manufacturer: string;
  speed: string;
}

export interface GalacticArchiveStarshipsContent {
  description: string;
  heading: string;
  items: ReadonlyArray<GalacticArchiveStarshipSpotlight>;
  labels: GalacticArchiveStarshipsLabels;
}

export interface GalacticArchiveTimelineCard extends GalacticArchiveTimelineEntry {
  episodeLabel: string;
}

export interface GalacticArchiveTimelineLabels {
  director: string;
  release: string;
}

export interface GalacticArchiveTimelineContent {
  description: string;
  heading: string;
  items: ReadonlyArray<GalacticArchiveTimelineCard>;
  labels: GalacticArchiveTimelineLabels;
}

export interface GalacticArchiveSearchContent {
  birthYearLabel: string;
  description: string;
  emptyDescription: string;
  emptyTitle: string;
  errorPrefix: string;
  filmsLabel: string;
  genderLabel: string;
  heading: string;
  hint: string;
  label: string;
  placeholder: string;
  starshipsLabel: string;
}

export interface GalacticArchiveContactContent {
  channelLabel: string;
  channelValue: string;
  descriptions: Record<GalacticArchiveSide, string>;
  heading: string;
  primaryActionHref: string;
  primaryActionLabel: string;
  responseLabel: string;
  responseValue: string;
  secondaryActionHref: string;
  secondaryActionLabel: string;
}

export interface ReferencePatternsGalacticArchiveProps {
  about: GalacticArchiveAboutContent;
  contact: GalacticArchiveContactContent;
  currentSide: GalacticArchiveSide;
  featured: GalacticArchiveFeaturedContent;
  hero: GalacticArchiveHeroContent;
  isSearchLoading: boolean;
  isSoundEnabled: boolean;
  onChangeSearch: (value: string) => void;
  onSelectSide: (side: GalacticArchiveSide) => void;
  onToggleSound: () => void;
  projects: GalacticArchiveProjectsContent;
  search: GalacticArchiveSearchContent;
  searchError?: string;
  searchQuery: string;
  searchResults: ReadonlyArray<GalacticArchiveSearchResult>;
  skills: GalacticArchiveSkillsContent;
  starships: GalacticArchiveStarshipsContent;
  timeline: GalacticArchiveTimelineContent;
}
