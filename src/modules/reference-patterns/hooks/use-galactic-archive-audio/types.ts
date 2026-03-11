import type { GalacticArchiveSide } from "@/modules/reference-patterns/lib/galactic-archive-query-state";

export interface UseGalacticArchiveAudioReturn {
  handleToggleSound: () => void;
  isSoundEnabled: boolean;
  playSideCue: (side: GalacticArchiveSide) => void;
}
