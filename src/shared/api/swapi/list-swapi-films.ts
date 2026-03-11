import "server-only";

import { Effect } from "effect";
import { cache } from "react";

import { createSwapiListResponseSchema, swapiFilmSchema } from "./schemas";
import { swapiClient } from "./swapi-client";

export const listSwapiFilms = cache(function listSwapiFilms() {
  return Effect.map(
    swapiClient({
      endpoint: "/films/?format=json",
      schema: createSwapiListResponseSchema(swapiFilmSchema),
    }),
    (response) =>
      response.results.toSorted((left, right) => left.episode_id - right.episode_id),
  );
});
