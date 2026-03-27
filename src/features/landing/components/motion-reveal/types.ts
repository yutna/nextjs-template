import type { ReactNode } from "react";

export interface MotionRevealProps {
  children?: ReactNode;
  className?: string;
  delay?: number;
  variant?: "fadeIn" | "fadeInUp" | "scaleIn";
}
