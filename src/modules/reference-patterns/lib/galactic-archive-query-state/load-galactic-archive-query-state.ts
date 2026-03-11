import "server-only";

import { createLoader } from "nuqs/server";

import { galacticArchiveQueryParsers } from "./galactic-archive-query-state";

export const loadGalacticArchiveQueryState = createLoader(
  galacticArchiveQueryParsers,
);
