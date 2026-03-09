import { z } from "zod";

export const reportErrorSchema = z.object({
  boundary: z
    .enum(["app", "global", "route-handler", "server-action"])
    .optional(),
  digest: z.string().optional(),
  message: z.string(),
  meta: z.record(z.string(), z.unknown()).optional(),
});
