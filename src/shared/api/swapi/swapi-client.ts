import "server-only";

import { Effect } from "effect";

import { fetchClient } from "@/shared/lib/fetcher";

import { SwapiRequestError, SwapiValidationError } from "./errors";

import type { ZodType } from "zod";

const SWAPI_BASE_URL = "https://swapi.dev/api";
const SWAPI_REVALIDATE_SECONDS = 60 * 60 * 12;

interface SwapiClientOptions<Success> {
  cache?: RequestCache;
  endpoint: string;
  schema: ZodType<Success>;
}

export function swapiClient<Success>({
  cache = "force-cache",
  endpoint,
  schema,
}: Readonly<SwapiClientOptions<Success>>) {
  return Effect.flatMap(
    Effect.tryPromise({
      catch: (error) => new SwapiRequestError(endpoint, error),
      try: () =>
        fetchClient<unknown>({
          cache,
          next:
            cache === "no-store"
              ? undefined
              : { revalidate: SWAPI_REVALIDATE_SECONDS },
          path: `${SWAPI_BASE_URL}${endpoint}`,
        }),
    }),
    (data) =>
      Effect.try({
        catch: (error) => new SwapiValidationError(endpoint, error),
        try: () => schema.parse(data),
      }),
  );
}
