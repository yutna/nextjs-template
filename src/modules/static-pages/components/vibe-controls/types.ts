export interface VibeControlsProps {
  isDesktop: boolean;
  isVibeOn: boolean;
  volume: number;

  onVibeToggle: () => void;
  onVolumeChange: (volume: number) => void;
}
