import type {
  GalacticArchiveAboutContent,
  GalacticArchiveContactContent,
  GalacticArchiveFeaturedContent,
  GalacticArchiveHeroContent,
  GalacticArchiveProjectsContent,
  GalacticArchiveSearchContent,
  GalacticArchiveSkillsContent,
  GalacticArchiveStarshipsContent,
  GalacticArchiveTimelineContent,
} from "@/modules/reference-patterns/components/reference-patterns-galactic-archive";
import type { GalacticArchiveSide } from "@/modules/reference-patterns/lib/galactic-archive-query-state";
import type { GalacticArchiveSearchResult } from "@/modules/reference-patterns/lib/galactic-archive-view-models";

export interface ContainerReferencePatternsGalacticArchiveExperienceProps {
  about: GalacticArchiveAboutContent;
  contact: GalacticArchiveContactContent;
  featured: GalacticArchiveFeaturedContent;
  hero: GalacticArchiveHeroContent;
  initialSearchQuery: string;
  initialSearchResults: ReadonlyArray<GalacticArchiveSearchResult>;
  initialSide: GalacticArchiveSide;
  projects: GalacticArchiveProjectsContent;
  search: GalacticArchiveSearchContent;
  skills: GalacticArchiveSkillsContent;
  starships: GalacticArchiveStarshipsContent;
  timeline: GalacticArchiveTimelineContent;
}
