import fs from "node:fs";
import pino from "pino";

import { LOG_DIR, LOG_FILE } from "./constants";

export function createFileLogger(): pino.Logger {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    return pino(
      {
        level: "error",
        base: { service: "nextjs-app" },
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      pino.destination({ dest: LOG_FILE, sync: false }),
    );
  } catch {
    // Filesystem is read-only (e.g. Vercel) — fall back to console transport
    return pino({ level: "error" });
  }
}
