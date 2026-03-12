import type { z } from "zod";
import type { galacticArchiveSearchSchema } from "./galactic-archive-search.schema";

export type GalacticArchiveSearchInput = z.infer<typeof galacticArchiveSearchSchema>;
