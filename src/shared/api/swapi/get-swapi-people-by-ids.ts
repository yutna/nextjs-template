import "server-only";

import { Effect } from "effect";

import { swapiPersonSchema } from "./schemas";
import { swapiClient } from "./swapi-client";

export function getSwapiPeopleByIds(ids: ReadonlyArray<number>) {
  return Effect.all(
    ids.map((id) =>
      swapiClient({
        endpoint: `/people/${id}/?format=json`,
        schema: swapiPersonSchema,
      }),
    ),
  );
}
