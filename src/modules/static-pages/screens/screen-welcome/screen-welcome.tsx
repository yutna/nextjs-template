import "server-only";

import { ContainerWelcomePage } from "@/modules/static-pages/containers/container-welcome-page";

import type { ScreenWelcomeProps } from "./types";

export async function ScreenWelcome({ locale }: Readonly<ScreenWelcomeProps>) {
  return <ContainerWelcomePage locale={locale} />;
}
