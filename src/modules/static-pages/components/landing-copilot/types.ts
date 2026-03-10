import type { Locale } from "next-intl";
import type { IconType } from "react-icons";

export interface CopilotFeature {
  descriptionKey: string;
  icon: IconType;
  titleKey: string;
}

export interface LandingCopilotProps {
  locale: Locale;
}
