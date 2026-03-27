"use client";

import { createContext } from "react";

import type { VibeContextValue } from "./types";

export const VibeContext = createContext<null | VibeContextValue>(null);
