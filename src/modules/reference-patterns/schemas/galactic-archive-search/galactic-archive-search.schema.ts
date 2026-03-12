import { z } from "zod";

export const galacticArchiveSearchSchema = z.object({
  query: z.string().trim().min(2).max(60),
});
