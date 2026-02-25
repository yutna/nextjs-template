/**
 * Props passed by Next.js App Router to error boundary pages
 * (`app/[locale]/error.tsx`, `app/global-error.tsx`).
 */
export interface NextErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
