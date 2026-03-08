import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { messages } from "../src/messages";
import { formats } from "../src/shared/config/i18n/formats";
import { TIME_ZONE } from "../src/shared/constants/timezone";
import { Provider } from "../src/shared/vendor/chakra-ui/provider";
import { _setMockLocale } from "./mocks/next-intl-server";

import type { Decorator, Preview } from "@storybook/nextjs-vite";

type Locale = keyof typeof messages;

const withProviders: Decorator = (Story, context) => {
  const locale = (context.globals["locale"] as Locale) ?? "en";
  const colorMode =
    (context.globals["colorMode"] as "dark" | "light") ?? "light";

  // Keep the server-side mock in sync with the toolbar locale
  _setMockLocale(locale);

  return (
    <NextIntlClientProvider
      formats={formats}
      locale={locale}
      messages={messages[locale]}
      now={new Date()}
      timeZone={TIME_ZONE}
    >
      <NuqsAdapter>
        <Provider forcedTheme={colorMode}>{Story()}</Provider>
      </NuqsAdapter>
    </NextIntlClientProvider>
  );
};

const preview: Preview = {
  decorators: [withProviders],

  globalTypes: {
    colorMode: {
      description: "Color mode",
      toolbar: {
        dynamicTitle: true,
        icon: "circlehollow",
        items: [
          { icon: "sun", title: "Light", value: "light" },
          { icon: "moon", title: "Dark", value: "dark" },
        ],
        title: "Color Mode",
      },
    },
    locale: {
      description: "Locale / language",
      toolbar: {
        icon: "globe",
        items: [
          { right: "🇺🇸", title: "English", value: "en" },
          { right: "🇹🇭", title: "Thai", value: "th" },
        ],
        showName: true,
        title: "Locale",
      },
    },
  },

  globals: {
    colorMode: "light",
    locale: "en",
  },

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
