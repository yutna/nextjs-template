import type { ReactNode } from "react";

export interface ErrorBoundaryFallbackProps {
  error: Error;
  // React error boundary API — name fixed by framework contract.
  // eslint-disable-next-line project/enforce-event-prop-naming
  reset: () => void;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Custom fallback rendered when an error is caught.
   * Receives the error and a reset function to clear the boundary.
   */
  renderFallback?: (props: ErrorBoundaryFallbackProps) => ReactNode;
}

export interface ErrorBoundaryState {
  error: Error | null;
}
