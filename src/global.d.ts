import type { formats } from "@/shared/config/i18n/formats";
import type { th } from "@/messages/th";

declare module "next-intl" {
  interface AppConfig {
    Formats: typeof formats;
    Messages: typeof th;
  }
}
