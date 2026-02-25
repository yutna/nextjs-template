import { type ReactNode } from "react";

export interface MotionStaggerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}
