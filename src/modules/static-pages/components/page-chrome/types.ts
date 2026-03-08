import type { Locale } from "next-intl";
import type { ReactNode } from "react";

export interface PageChromeProps {
  locale: Locale;

  children?: ReactNode;

  onSwitchLocale: (locale: Locale) => void;
}
