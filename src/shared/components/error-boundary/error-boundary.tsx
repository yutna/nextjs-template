"use client";

import { Component } from "react";

import type { ErrorInfo } from "react";
import type { ErrorBoundaryProps, ErrorBoundaryState } from "./types";

/**
 * React class-based Error Boundary for wrapping arbitrary subtrees.
 * Use this to isolate rendering errors to a section of the page
 * rather than letting them bubble up to the Next.js error boundary.
 *
 * @example
 * <ErrorBoundary fallback={({ error, reset }) => <MyFallback error={error} reset={reset} />}>
 *   <SomeFeatureSection />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Wire to reportError() in SETUP_ERROR_LOGGING branch
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  override render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      return fallback?.({ error, reset: this.reset }) ?? null;
    }

    return children;
  }
}
