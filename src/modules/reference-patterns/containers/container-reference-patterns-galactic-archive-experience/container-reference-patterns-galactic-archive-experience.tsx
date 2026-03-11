"use client";

import { ReferencePatternsGalacticArchive } from "@/modules/reference-patterns/components/reference-patterns-galactic-archive";
import { useGalacticArchiveExperience } from "@/modules/reference-patterns/hooks/use-galactic-archive-experience";

import type { ContainerReferencePatternsGalacticArchiveExperienceProps } from "./types";

export function ContainerReferencePatternsGalacticArchiveExperience({
  about,
  contact,
  featured,
  hero,
  initialSearchQuery,
  initialSearchResults,
  initialSide,
  projects,
  search,
  skills,
  starships,
  timeline,
}: Readonly<ContainerReferencePatternsGalacticArchiveExperienceProps>) {
  const {
    currentSide,
    handleChangeSearch,
    handleSelectSide,
    handleToggleSound,
    isSearchLoading,
    isSoundEnabled,
    searchError,
    searchQuery,
    searchResults,
  } = useGalacticArchiveExperience({
    initialSearchQuery,
    initialSearchResults,
    initialSide,
  });

  return (
    <ReferencePatternsGalacticArchive
      about={about}
      contact={contact}
      currentSide={currentSide}
      featured={featured}
      hero={hero}
      isSearchLoading={isSearchLoading}
      isSoundEnabled={isSoundEnabled}
      onChangeSearch={handleChangeSearch}
      onSelectSide={handleSelectSide}
      onToggleSound={handleToggleSound}
      projects={projects}
      search={search}
      searchError={searchError}
      searchQuery={searchQuery}
      searchResults={searchResults}
      skills={skills}
      starships={starships}
      timeline={timeline}
    />
  );
}
