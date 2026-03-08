// Type declaration for the @storybook-preview Vite alias.
// Resolved at runtime via resolve.alias in the storybook Vitest project.
declare module "@storybook-preview" {
  const annotations: Record<string, unknown>;
  export default annotations;
}
