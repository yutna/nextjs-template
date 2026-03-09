"use client";

import { use } from "react";

import { VibeContext } from "@/modules/static-pages/contexts/vibe";

export function useVibe() {
  const context = use(VibeContext);

  if (!context) {
    throw new Error("useVibe must be used within VibeProvider");
  }

  return context;
}
