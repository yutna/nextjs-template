import "server-only";

import { Effect } from "effect";

import { createSwapiListResponseSchema, swapiPersonSchema } from "./schemas";
import { swapiClient } from "./swapi-client";

export function searchSwapiPeople(query: string) {
  return Effect.map(
    swapiClient({
      cache: "no-store",
      endpoint: `/people/?search=${encodeURIComponent(query.trim())}&format=json`,
      schema: createSwapiListResponseSchema(swapiPersonSchema),
    }),
    (response) => response.results,
  );
}
