import type { Locale } from "next-intl";
import type { IconType } from "react-icons";

export interface LandingStrengthsProps {
  locale: Locale;
}

export interface Strength {
  descriptionKey: string;
  icon: IconType;
  titleKey: string;
}
