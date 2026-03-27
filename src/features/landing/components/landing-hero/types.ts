import type { ReactNode } from "react";

export interface LandingHeroProps {
  getStarted: string;
  subtitle: string;
  title: string;

  copyCommand?: ReactNode;
}
