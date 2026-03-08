export interface VibeControlsProps {
  isDesktop: boolean;
  isVibeOn: boolean;
  volume: number;

  onChangeVolume: (volume: number) => void;
  onToggleVibe: () => void;
}
