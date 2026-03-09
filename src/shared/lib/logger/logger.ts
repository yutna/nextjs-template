import "server-only";

import pino from "pino";

import { env } from "@/shared/config/env";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV !== "production"
      ? { target: "pino-pretty" }
      : undefined,
});
