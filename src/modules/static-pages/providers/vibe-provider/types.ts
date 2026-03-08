import type { ReactNode } from "react";

export interface VibeProviderProps {
  children: ReactNode;
}

export interface VibeState {
  isVibeOn: boolean;
  volume: number;
}
