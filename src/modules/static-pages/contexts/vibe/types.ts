export interface VibeContextValue {
  isVibeOn: boolean;
  volume: number;

  setVolume: (volume: number) => void;
  toggleVibe: () => void;
}
