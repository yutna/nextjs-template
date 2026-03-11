import { parseAsString, parseAsStringLiteral } from "nuqs/server";

import { GALACTIC_ARCHIVE_SIDE_VALUES } from "./types";

export const galacticArchiveQueryParsers = {
  search: parseAsString.withDefault(""),
  side: parseAsStringLiteral(GALACTIC_ARCHIVE_SIDE_VALUES),
};
