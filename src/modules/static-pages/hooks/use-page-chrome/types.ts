import type { Locale } from "next-intl";

export interface UsePageChromeOptions {
  locale: Locale;
}

export interface UsePageChromeReturn {
  onLocaleSwitch: (next: Locale) => void;
}
