import {
  LuBot,
  LuGlobe,
  LuMoon,
  LuRocket,
  LuServer,
  LuShieldCheck,
} from "react-icons/lu";

import type { Strength } from "./types";

export const STRENGTHS: Strength[] = [
  {
    descriptionKey: "strength1Description",
    icon: LuServer,
    titleKey: "strength1Title",
  },
  {
    descriptionKey: "strength2Description",
    icon: LuShieldCheck,
    titleKey: "strength2Title",
  },
  {
    descriptionKey: "strength3Description",
    icon: LuBot,
    titleKey: "strength3Title",
  },
  {
    descriptionKey: "strength4Description",
    icon: LuGlobe,
    titleKey: "strength4Title",
  },
  {
    descriptionKey: "strength5Description",
    icon: LuMoon,
    titleKey: "strength5Title",
  },
  {
    descriptionKey: "strength6Description",
    icon: LuRocket,
    titleKey: "strength6Title",
  },
];
