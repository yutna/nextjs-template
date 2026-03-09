"use client";

import { createContext } from "react";

import type { ThemeSettingsContextValue } from "./types";

export const ThemeSettingsContext =
  createContext<null | ThemeSettingsContextValue>(null);
