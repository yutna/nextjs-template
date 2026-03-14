import path from "node:path";

export const LOG_DIR = path.join(process.cwd(), "tmp", "logs");
export const LOG_FILE = path.join(LOG_DIR, "error.log");
