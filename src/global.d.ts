import type { en } from "@/messages/en";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof en;
  }
}
