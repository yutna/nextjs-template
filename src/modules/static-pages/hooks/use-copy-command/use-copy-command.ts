"use client";

import { useImmer } from "use-immer";

import { HERO_INSTALL_COMMAND } from "@/modules/static-pages/components/copy-command/constants";

import type { UseCopyCommandReturn } from "./types";

const COPIED_RESET_DELAY_MS = 2000;

export function useCopyCommand(): UseCopyCommandReturn {
  const [state, updateState] = useImmer({ copied: false });

  async function handleCopy() {
    await navigator.clipboard.writeText(HERO_INSTALL_COMMAND);
    updateState((draft) => {
      draft.copied = true;
    });
    setTimeout(() => {
      updateState((draft) => {
        draft.copied = false;
      });
    }, COPIED_RESET_DELAY_MS);
  }

  return { handleCopy, isCopied: state.copied };
}
