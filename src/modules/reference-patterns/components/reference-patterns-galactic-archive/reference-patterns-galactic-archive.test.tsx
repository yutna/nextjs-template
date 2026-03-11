import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ReferencePatternsGalacticArchive } from "./reference-patterns-galactic-archive";

import type { ReactNode } from "react";

vi.mock("../reference-patterns-galactic-archive-scene", () => ({
  ReferencePatternsGalacticArchiveScene: () => null,
}));
vi.mock("@/shared/lib/navigation", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("ReferencePatternsGalacticArchive", () => {
  it("renders the portfolio sections", () => {
    renderWithProviders(
      <ReferencePatternsGalacticArchive
        about={{
          descriptions: {
            dark: "Dark profile",
            light: "Light profile",
          },
          heading: "About Me",
          metrics: [{ label: "Stack", value: "Next.js" }],
          titles: {
            dark: "Sith dossier",
            light: "Jedi dossier",
          },
        }}
        contact={{
          channelLabel: "Channel",
          channelValue: "test@example.com",
          descriptions: {
            dark: "Dark contact",
            light: "Light contact",
          },
          heading: "Contact",
          primaryActionHref: "mailto:test@example.com",
          primaryActionLabel: "Open transmission",
          responseLabel: "Response",
          responseValue: "Async",
          secondaryActionHref: "/reference-patterns/workflow-foundations",
          secondaryActionLabel: "Inspect workflow proof",
        }}
        currentSide="light"
        featured={{
          collections: [
            {
              heading: "Light Side champions",
              items: [
                {
                  birthYear: "19BBY",
                  filmCount: 4,
                  name: "Luke Skywalker",
                  profileTitle: "Rebel tactician",
                  side: "light",
                  starshipCount: 2,
                  starshipNames: ["X-wing"],
                },
              ],
              side: "light",
            },
            {
              heading: "Dark Side operators",
              items: [],
              side: "dark",
            },
          ],
          heading: "Light Side vs Dark Side",
          labels: {
            birthYear: "Birth year",
            films: "Films",
            noStarships: "No starships",
            starships: "Starships",
          },
        }}
        hero={{
          description: "Choose your side.",
          eyebrow: "Choose Your Side",
          heading: "Galactic Archive Portfolio",
          sideOptions: [
            {
              description: "Light description",
              label: "Light Side",
              side: "light",
            },
            {
              description: "Dark description",
              label: "Dark Side",
              side: "dark",
            },
          ],
          soundDisabledLabel: "Sound off",
          soundEnabledLabel: "Sound on",
          statusDescription: "All systems online",
          statusLabel: "Archive synchronized",
          systems: [{ label: "Films", online: true }],
        }}
        isSearchLoading={false}
        isSoundEnabled
        onChangeSearch={() => undefined}
        onSelectSide={() => undefined}
        onToggleSound={() => undefined}
        projects={{
          description: "Projects section",
          heading: "Projects",
          items: [
            {
              description: "Project description",
              featuredFilmTitle: "A New Hope",
              manufacturer: "Corellian",
              projectKey: "auroraRelay",
              shipClass: "Freighter",
              shipName: "Millennium Falcon",
              side: "light",
              title: "Aurora Relay",
            },
          ],
          labels: {
            film: "Film",
            manufacturer: "Manufacturer",
            shipClass: "Class",
          },
        }}
        search={{
          birthYearLabel: "Birth year",
          description: "Search description",
          emptyDescription: "Type to search",
          emptyTitle: "No search results yet",
          errorPrefix: "Search error",
          filmsLabel: "Films",
          genderLabel: "Gender",
          heading: "Live archive search",
          hint: "Hint",
          label: "Search characters",
          placeholder: "Try Luke",
          starshipsLabel: "Starships",
        }}
        searchQuery=""
        searchResults={[]}
        skills={{
          description: "Skills description",
          heading: "Skills",
          items: [
            {
              description: "Skill description",
              side: "light",
              title: "System design",
            },
          ],
        }}
        starships={{
          description: "Starship description",
          heading: "Starship spotlight",
          items: [
            {
              crew: "4",
              hyperdriveRating: "0.5",
              manufacturer: "Corellian",
              maxAtmospheringSpeed: "1050",
              name: "Millennium Falcon",
              shipClass: "Freighter",
              side: "light",
            },
          ],
          labels: {
            crew: "Crew",
            hyperdrive: "Hyperdrive",
            manufacturer: "Manufacturer",
            speed: "Speed",
          },
        }}
        timeline={{
          description: "Timeline description",
          heading: "Timeline",
          items: [
            {
              director: "George Lucas",
              episodeId: 4,
              episodeLabel: "Episode 4",
              openingCrawl: "It is a period of civil war.",
              releaseDate: "1977-05-25",
              title: "A New Hope",
            },
          ],
          labels: {
            director: "Director",
            release: "Release",
          },
        }}
      />,
    );

    expect(screen.getByText("Galactic Archive Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Live archive search")).toBeInTheDocument();
    expect(screen.getByText("Aurora Relay")).toBeInTheDocument();
  });
});
