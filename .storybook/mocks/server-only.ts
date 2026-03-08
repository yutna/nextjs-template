// Storybook mock: neutralises `import "server-only"` in server components.
// Real server-only throws when imported in a browser environment; this mock
// is a no-op so async server components render safely in Storybook.
export {};
