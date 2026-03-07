import type { th } from "@/messages/th";
import type { formats } from "@/shared/config/i18n/formats";

declare module "next-intl" {
  interface AppConfig {
    Formats: typeof formats;
    Messages: typeof th;
  }
}
