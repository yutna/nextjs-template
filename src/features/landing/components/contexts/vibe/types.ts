export interface VibeContextValue {
  isVibeOn: boolean;
  volume: number;

  handleChangeVolume: (volume: number) => void;
  handleToggleVibe: () => void;
}
