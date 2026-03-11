import type { Locale } from "next-intl";
import type { GalacticArchiveSide } from "@/modules/reference-patterns/lib/galactic-archive-query-state";

export interface ContainerReferencePatternsGalacticArchiveProps {
  initialSearchQuery: string;
  locale: Locale;
  requestedSide: GalacticArchiveSide | null;
}
