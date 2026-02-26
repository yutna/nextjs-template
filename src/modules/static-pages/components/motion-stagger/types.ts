import type { ReactNode } from "react";

export interface MotionStaggerProps {
  children: ReactNode;

  className?: string;
  staggerDelay?: number;
}
