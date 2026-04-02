import { test as base } from "@playwright/test";

type Fixtures = {
  localePath: (path: string, locale?: string) => string;
};

export const test = base.extend<Fixtures>({
  localePath: async ({}, use) => {
    await use((path: string, locale = "en") => {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      return `/${locale}${normalizedPath}`;
    });
  },
});

export { expect } from "@playwright/test";
