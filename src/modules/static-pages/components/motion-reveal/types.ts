import { type ReactNode } from "react";

export interface MotionRevealProps {
  children: ReactNode;
  variant?: "fadeInUp" | "fadeIn" | "scaleIn";
  delay?: number;
  className?: string;
}
