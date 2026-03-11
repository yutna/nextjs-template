import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GalacticArchiveSearchResult } from "@/modules/reference-patterns/lib/galactic-archive-view-models";

const mockUseQueryStates = vi.hoisted(() => vi.fn());
const mockSetQueryState = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockUseSWR = vi.hoisted(() => vi.fn());
const mockUseGalacticArchiveAudio = vi.hoisted(() => vi.fn());
const mockHandleToggleSound = vi.hoisted(() => vi.fn());
const mockPlaySideCue = vi.hoisted(() => vi.fn());

vi.mock("nuqs", async () => {
  const actual = await vi.importActual<typeof import("nuqs")>("nuqs");

  return {
    ...actual,
    useQueryStates: mockUseQueryStates,
  };
});
vi.mock("swr", () => ({
  default: mockUseSWR,
}));
vi.mock("@/modules/reference-patterns/hooks/use-galactic-archive-audio", () => ({
  useGalacticArchiveAudio: mockUseGalacticArchiveAudio,
}));

import { useGalacticArchiveExperience } from "./use-galactic-archive-experience";

const initialSearchResults: ReadonlyArray<GalacticArchiveSearchResult> = [
  {
    birthYear: "19BBY",
    filmCount: 4,
    gender: "male",
    name: "Luke Skywalker",
    starshipCount: 2,
    url: "https://swapi.dev/api/people/1/",
  },
];

describe("useGalacticArchiveExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQueryStates.mockReturnValue([
      { search: "", side: null },
      mockSetQueryState,
    ]);
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    });
    mockUseGalacticArchiveAudio.mockReturnValue({
      handleToggleSound: mockHandleToggleSound,
      isSoundEnabled: true,
      playSideCue: mockPlaySideCue,
    });
    Object.defineProperty(document, "cookie", {
      configurable: true,
      value: "",
      writable: true,
    });
  });

  it("falls back to the initial side and results when search is inactive", () => {
    const { result } = renderHook(() =>
      useGalacticArchiveExperience({
        initialSearchQuery: "",
        initialSearchResults,
        initialSide: "light",
      }),
    );

    expect(result.current.currentSide).toBe("light");
    expect(result.current.searchResults).toEqual(initialSearchResults);
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), {
      fallbackData: undefined,
      keepPreviousData: true,
      revalidateOnFocus: false,
    });
  });

  it("updates the search query in URL state", () => {
    const { result } = renderHook(() =>
      useGalacticArchiveExperience({
        initialSearchQuery: "",
        initialSearchResults,
        initialSide: "light",
      }),
    );

    act(() => {
      result.current.handleChangeSearch("Leia");
    });

    expect(mockSetQueryState).toHaveBeenCalledWith({ search: "Leia" });
  });

  it("persists the selected side and plays the cue when switching sides", () => {
    const { result } = renderHook(() =>
      useGalacticArchiveExperience({
        initialSearchQuery: "",
        initialSearchResults,
        initialSide: "light",
      }),
    );

    act(() => {
      result.current.handleSelectSide("dark");
    });

    expect(document.cookie).toContain("galactic-archive-side=dark");
    expect(mockPlaySideCue).toHaveBeenCalledWith("dark");
    expect(mockSetQueryState).toHaveBeenCalledWith({ side: "dark" });
  });

  it("skips side effects when the selected side is already active", () => {
    mockUseQueryStates.mockReturnValue([
      { search: "", side: "dark" },
      mockSetQueryState,
    ]);

    const { result } = renderHook(() =>
      useGalacticArchiveExperience({
        initialSearchQuery: "",
        initialSearchResults,
        initialSide: "light",
      }),
    );

    act(() => {
      result.current.handleSelectSide("dark");
    });

    expect(mockPlaySideCue).not.toHaveBeenCalled();
    expect(mockSetQueryState).not.toHaveBeenCalled();
  });

  it("returns live SWR results when the search query is active", () => {
    const liveResults: ReadonlyArray<GalacticArchiveSearchResult> = [
      {
        birthYear: "41.9BBY",
        filmCount: 6,
        gender: "male",
        name: "Darth Vader",
        starshipCount: 1,
        url: "https://swapi.dev/api/people/4/",
      },
    ];

    mockUseQueryStates.mockReturnValue([
      { search: "Vader", side: null },
      mockSetQueryState,
    ]);
    mockUseSWR.mockReturnValue({
      data: liveResults,
      error: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() =>
      useGalacticArchiveExperience({
        initialSearchQuery: "Luke",
        initialSearchResults,
        initialSide: "light",
      }),
    );

    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/reference-patterns/galactic-archive/search?query=Vader",
      expect.any(Function),
      {
        fallbackData: undefined,
        keepPreviousData: true,
        revalidateOnFocus: false,
      },
    );
    expect(result.current.isSearchLoading).toBe(true);
    expect(result.current.searchResults).toEqual(liveResults);
  });
});
