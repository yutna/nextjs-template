import type { Locale } from "next-intl";

export interface UsePageChromeOptions {
  locale: Locale;
}

export interface UsePageChromeReturn {
  handleSwitchLocale: (next: Locale) => void;
}
