import type { Locale } from "next-intl";
import type { GalacticArchiveSide } from "@/modules/reference-patterns/lib/galactic-archive-query-state";

export interface ScreenReferencePatternsGalacticArchiveProps {
  initialSearchQuery: string;
  locale: Locale;
  requestedSide: GalacticArchiveSide | null;
}
