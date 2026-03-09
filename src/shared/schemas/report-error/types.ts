import type { z } from "zod";
import type { reportErrorSchema } from "./report-error.schema";

export type ReportErrorInput = z.infer<typeof reportErrorSchema>;
