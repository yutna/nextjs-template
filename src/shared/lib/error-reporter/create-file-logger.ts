import fs from "node:fs";
import pino from "pino";

import { LOG_DIR, LOG_FILE } from "./constants";

export function createFileLogger(): pino.Logger {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    return pino(
      {
        base: { service: "nextjs-app" },
        level: "error",
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      pino.destination({ dest: LOG_FILE, sync: false }),
    );
  } catch {
    // Filesystem is read-only (e.g. Vercel) — fall back to console transport
    return pino({ level: "error" });
  }
}
