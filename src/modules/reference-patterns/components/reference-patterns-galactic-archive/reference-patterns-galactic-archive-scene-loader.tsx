import dynamic from "next/dynamic";

import type { ReferencePatternsGalacticArchiveSceneProps } from "@/modules/reference-patterns/components/reference-patterns-galactic-archive-scene";

export const ReferencePatternsGalacticArchiveSceneLoader = dynamic<ReferencePatternsGalacticArchiveSceneProps>(
  () =>
    import("@/modules/reference-patterns/components/reference-patterns-galactic-archive-scene").then(
      (module) => module.ReferencePatternsGalacticArchiveScene,
    ),
  {
    loading: () => <div aria-hidden />,
    ssr: false,
  },
);
