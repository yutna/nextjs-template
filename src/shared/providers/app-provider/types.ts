import type { AbstractIntlMessages } from "next-intl";
import type { ReactNode } from "react";

export interface AppProviderProps {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
  now: Date;
  timeZone: string;
}
