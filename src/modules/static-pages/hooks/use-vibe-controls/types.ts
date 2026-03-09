export interface UseVibeControlsReturn {
  isDesktop: boolean;
  isVibeOn: boolean;
  volume: number;

  handleChangeVolume: (volume: number) => void;
  handleToggleVibe: () => void;
}
