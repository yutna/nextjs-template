import "server-only";

import { cache } from "react";

import { swapiRootSchema } from "./schemas";
import { swapiClient } from "./swapi-client";

export const getSwapiRoot = cache(function getSwapiRoot() {
  return swapiClient({
    endpoint: "/",
    schema: swapiRootSchema,
  });
});
