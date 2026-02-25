import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "@/shared/config/i18n/routing";
import { TIME_ZONE } from "@/shared/constants/timezone";
import { logger } from "@/shared/lib/logger";
import { messages } from "@/messages";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    getMessageFallback({ key, namespace }) {
      return [namespace, key].filter(Boolean).join(".");
    },
    locale,
    messages: messages[locale],
    now: new Date(),
    onError(error) {
      logger.warn({ error }, "next-intl: missing translation");
    },
    timeZone: TIME_ZONE,
  };
});
