import "server-only";

import type { z } from "zod";
import type {
  swapiFilmSchema,
  swapiPersonSchema,
  swapiRootSchema,
  swapiStarshipSchema,
} from "./schemas";

export interface SwapiListResponse<T> {
  count: number;
  next: null | string;
  previous: null | string;
  results: ReadonlyArray<T>;
}

export type SwapiFilm = z.infer<typeof swapiFilmSchema>;
export type SwapiPerson = z.infer<typeof swapiPersonSchema>;
export type SwapiRoot = z.infer<typeof swapiRootSchema>;
export type SwapiStarship = z.infer<typeof swapiStarshipSchema>;
