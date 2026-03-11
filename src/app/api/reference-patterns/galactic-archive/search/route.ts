import "server-only";

import { Effect } from "effect";
import { NextResponse } from "next/server";

import { normalizeGalacticArchiveSearchResults } from "@/modules/reference-patterns/lib/galactic-archive-view-models";
import { galacticArchiveSearchSchema } from "@/modules/reference-patterns/schemas/galactic-archive-search";
import {
  searchSwapiPeople,
  SwapiRequestError,
  SwapiValidationError,
} from "@/shared/api/swapi";

function buildErrorMessage(error: unknown): string {
  if (error instanceof SwapiRequestError || error instanceof SwapiValidationError) {
    return error.message;
  }

  return "Live SWAPI search is temporarily unavailable.";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsedQuery = galacticArchiveSearchSchema.safeParse({
    query: searchParams.get("query") ?? "",
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        error: "Search query must be between 2 and 60 characters.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const people = await Effect.runPromise(searchSwapiPeople(parsedQuery.data.query));

    return NextResponse.json({
      results: normalizeGalacticArchiveSearchResults(people),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: buildErrorMessage(error),
      },
      {
        status: 502,
      },
    );
  }
}
