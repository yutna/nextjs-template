import "server-only";

import { z } from "zod";

const swapiUrlSchema = z.string().url();

export function createSwapiListResponseSchema<ItemSchema extends z.ZodTypeAny>(
  itemSchema: ItemSchema,
) {
  return z.object({
    count: z.number().int().nonnegative(),
    next: swapiUrlSchema.nullable(),
    previous: swapiUrlSchema.nullable(),
    results: z.array(itemSchema),
  });
}

export const swapiRootSchema = z.object({
  films: swapiUrlSchema,
  people: swapiUrlSchema,
  planets: swapiUrlSchema,
  species: swapiUrlSchema,
  starships: swapiUrlSchema,
  vehicles: swapiUrlSchema,
});

export const swapiFilmSchema = z.object({
  characters: z.array(swapiUrlSchema),
  created: z.string(),
  director: z.string(),
  edited: z.string(),
  episode_id: z.number().int(),
  opening_crawl: z.string(),
  planets: z.array(swapiUrlSchema),
  producer: z.string(),
  release_date: z.string(),
  species: z.array(swapiUrlSchema),
  starships: z.array(swapiUrlSchema),
  title: z.string(),
  url: swapiUrlSchema,
  vehicles: z.array(swapiUrlSchema),
});

export const swapiPersonSchema = z.object({
  birth_year: z.string(),
  created: z.string(),
  edited: z.string(),
  eye_color: z.string(),
  films: z.array(swapiUrlSchema),
  gender: z.string(),
  hair_color: z.string(),
  height: z.string(),
  homeworld: swapiUrlSchema,
  mass: z.string(),
  name: z.string(),
  skin_color: z.string(),
  species: z.array(swapiUrlSchema),
  starships: z.array(swapiUrlSchema),
  url: swapiUrlSchema,
  vehicles: z.array(swapiUrlSchema),
});

export const swapiStarshipSchema = z.object({
  cargo_capacity: z.string(),
  consumables: z.string(),
  cost_in_credits: z.string(),
  created: z.string(),
  crew: z.string(),
  edited: z.string(),
  films: z.array(swapiUrlSchema),
  hyperdrive_rating: z.string(),
  length: z.string(),
  manufacturer: z.string(),
  max_atmosphering_speed: z.string(),
  MGLT: z.string(),
  model: z.string(),
  name: z.string(),
  passengers: z.string(),
  pilots: z.array(swapiUrlSchema),
  starship_class: z.string(),
  url: swapiUrlSchema,
});
