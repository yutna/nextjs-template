import type { Locale } from "next-intl";

export interface CodeToken {
  color: string;
  darkColor: string;
  text: string;
}

export interface SectionDemoProps {
  locale: Locale;
}

export interface DemoContentProps {
  codeComment: string;
}
