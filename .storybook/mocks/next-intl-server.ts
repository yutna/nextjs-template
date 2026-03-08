// Storybook mock for `next-intl/server`.
// Provides locale-aware getTranslations / getLocale / getMessages
// that read from the compiled src/messages tree.
// The `_setMockLocale` setter is called by the preview decorator to
// keep the locale in sync with the Storybook toolbar selection.

import { messages } from "../../src/messages";

type Locale = keyof typeof messages;

let _currentLocale: Locale = "en";

export function _setMockLocale(locale: string) {
  _currentLocale = locale as Locale;
}

function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): Record<string, unknown> | undefined {
  return path
    .split(".")
    .reduce<Record<string, unknown> | undefined>((acc, key) => {
      if (acc != null && typeof acc === "object" && key in acc) {
        return acc[key] as Record<string, unknown>;
      }
      return undefined;
    }, obj);
}

type TranslationValues = Record<string, number | string>;

function interpolate(template: string, values?: TranslationValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    String(values[key] ?? `{${key}}`),
  );
}

type TranslatorFn = {
  (key: string, values?: TranslationValues): string;
  rich(key: string, values?: Record<string, unknown>): string;
};

export async function getTranslations({
  locale,
  namespace,
}: {
  locale?: string;
  namespace?: string;
} = {}): Promise<TranslatorFn> {
  const loc = (locale as Locale) ?? _currentLocale;
  const localeMessages = messages[loc] as Record<string, unknown>;
  const ns = namespace
    ? getNestedValue(localeMessages, namespace)
    : localeMessages;

  const t = (key: string, values?: TranslationValues): string => {
    const raw = ns ? (ns[key] as string | undefined) : undefined;
    return interpolate(raw ?? key, values);
  };

  // Minimal rich-text support: strip tags and return plain string
  t.rich = (key: string, values?: Record<string, unknown>): string => {
    const raw = ns ? (ns[key] as string | undefined) : undefined;
    return interpolate(raw ?? key, values as TranslationValues | undefined);
  };

  return t;
}

export async function getLocale(): Promise<string> {
  return _currentLocale;
}

export async function getMessages(): Promise<Record<string, unknown>> {
  return messages[_currentLocale] as Record<string, unknown>;
}
