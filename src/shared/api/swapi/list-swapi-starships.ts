import "server-only";

import { Effect } from "effect";
import { cache } from "react";

import { createSwapiListResponseSchema, swapiStarshipSchema } from "./schemas";
import { swapiClient } from "./swapi-client";

export const listSwapiStarships = cache(function listSwapiStarships() {
  return Effect.map(
    swapiClient({
      endpoint: "/starships/?format=json",
      schema: createSwapiListResponseSchema(swapiStarshipSchema),
    }),
    (response) => response.results,
  );
});
