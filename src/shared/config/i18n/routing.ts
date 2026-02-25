import { defineRouting } from "next-intl/routing";

import { LOCALES } from "@/shared/constants/locale";

export const routing = defineRouting({
  // Used when no locale matches
  defaultLocale: LOCALES[0],
  // A list of all locales that are supported
  locales: LOCALES,
});
