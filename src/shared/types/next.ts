/**
 * Props passed by Next.js App Router to error boundary pages
 * (`app/[locale]/error.tsx`, `app/global-error.tsx`).
 */
export interface NextErrorProps {
  error: Error & { digest?: string };
  // Next.js App Router error boundary API — name fixed by framework contract.
  // eslint-disable-next-line project/enforce-event-prop-naming
  reset: () => void;
}
