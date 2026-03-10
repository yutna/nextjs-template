import { LuBrain, LuFileText, LuGitBranch, LuZap } from "react-icons/lu";

import type { CopilotFeature } from "./types";

export const COPILOT_FEATURES: CopilotFeature[] = [
  {
    descriptionKey: "feature1Description",
    icon: LuFileText,
    titleKey: "feature1Title",
  },
  {
    descriptionKey: "feature2Description",
    icon: LuBrain,
    titleKey: "feature2Title",
  },
  {
    descriptionKey: "feature3Description",
    icon: LuGitBranch,
    titleKey: "feature3Title",
  },
  {
    descriptionKey: "feature4Description",
    icon: LuZap,
    titleKey: "feature4Title",
  },
];
