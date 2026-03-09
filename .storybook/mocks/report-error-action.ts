// Storybook mock for report-error-action.
// The real action uses "use server" and imports node:path (via error-reporter)
// which cannot run in the browser. Provide a no-op stub.
export async function reportErrorAction() {
  // no-op in Storybook
}
