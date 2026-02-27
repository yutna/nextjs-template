import type { ReactNode } from "react";

export interface ErrorBoundaryFallbackProps {
  error: Error;
  reset: () => void;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Custom fallback rendered when an error is caught.
   * Receives the error and a reset function to clear the boundary.
   */
  fallback?: (props: ErrorBoundaryFallbackProps) => ReactNode;
}

export interface ErrorBoundaryState {
  error: Error | null;
}
