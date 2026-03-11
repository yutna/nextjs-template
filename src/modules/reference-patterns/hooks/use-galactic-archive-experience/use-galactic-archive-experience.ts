"use client";

import { useQueryStates } from "nuqs";
import { useDeferredValue } from "react";
import useSWR from "swr";

import { useGalacticArchiveAudio } from "@/modules/reference-patterns/hooks/use-galactic-archive-audio";
import { galacticArchiveQueryParsers } from "@/modules/reference-patterns/lib/galactic-archive-query-state/galactic-archive-query-state";

import type { GalacticArchiveSide } from "@/modules/reference-patterns/lib/galactic-archive-query-state";
import type { GalacticArchiveSearchResult } from "@/modules/reference-patterns/lib/galactic-archive-view-models";
import type {
  UseGalacticArchiveExperienceOptions,
  UseGalacticArchiveExperienceReturn,
} from "./types";

const GALACTIC_ARCHIVE_SIDE_COOKIE = "galactic-archive-side";

interface GalacticArchiveSearchResponse {
  error?: string;
  results?: ReadonlyArray<GalacticArchiveSearchResult>;
}

async function searchResultsFetcher(
  path: string,
): Promise<ReadonlyArray<GalacticArchiveSearchResult>> {
  const response = await fetch(path);
  const payload = (await response.json()) as GalacticArchiveSearchResponse;

  if (!response.ok || !payload.results) {
    throw new Error(payload.error ?? "Search request failed.");
  }

  return payload.results;
}

export function useGalacticArchiveExperience({
  initialSearchQuery,
  initialSearchResults,
  initialSide,
}: Readonly<UseGalacticArchiveExperienceOptions>): UseGalacticArchiveExperienceReturn {
  const { handleToggleSound, isSoundEnabled, playSideCue } =
    useGalacticArchiveAudio();
  const [queryState, setQueryState] = useQueryStates(galacticArchiveQueryParsers, {
    history: "replace",
  });
  const deferredSearchQuery = useDeferredValue(queryState.search);
  const normalizedDeferredSearchQuery = deferredSearchQuery.trim();
  const normalizedInitialSearchQuery = initialSearchQuery.trim();
  const shouldSearch = normalizedDeferredSearchQuery.length >= 2;
  const currentSide = queryState.side ?? initialSide;
  const { data, error, isLoading } = useSWR(
    shouldSearch
      ? `/api/reference-patterns/galactic-archive/search?query=${encodeURIComponent(
          normalizedDeferredSearchQuery,
        )}`
      : null,
    searchResultsFetcher,
    {
      fallbackData:
        normalizedDeferredSearchQuery === normalizedInitialSearchQuery &&
        normalizedInitialSearchQuery.length >= 2
          ? initialSearchResults
          : undefined,
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  function handleChangeSearch(value: string) {
    void setQueryState({ search: value });
  }

  function handleSelectSide(side: GalacticArchiveSide) {
    if (side === currentSide) {
      return;
    }

    document.cookie = `${GALACTIC_ARCHIVE_SIDE_COOKIE}=${side}; Path=/; Max-Age=31536000; SameSite=Lax`;
    playSideCue(side);
    void setQueryState({ side });
  }

  return {
    currentSide,
    handleChangeSearch,
    handleSelectSide,
    handleToggleSound,
    isSearchLoading: isLoading,
    isSoundEnabled,
    searchError: error instanceof Error ? error.message : undefined,
    searchQuery: queryState.search,
    searchResults: shouldSearch ? data ?? [] : initialSearchResults,
  };
}
