"use client";

import { useTranslations } from "next-intl";
import { useImmer } from "use-immer";

import { HERO_INSTALL_COMMAND } from "@/modules/static-pages/constants/install-command";
import { toaster } from "@/shared/vendor/chakra-ui/toaster";

import { COPIED_RESET_DELAY_MS } from "./constants";

import type { UseCopyCommandReturn } from "./types";

export function useCopyCommand(): UseCopyCommandReturn {
  const t = useTranslations("modules.staticPages.hooks.useCopyCommand");
  const [state, updateState] = useImmer({ copied: false });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(HERO_INSTALL_COMMAND);
    } catch {
      toaster.create({
        closable: true,
        description: t("copyFailedDescription"),
        title: t("copyFailedTitle"),
        type: "error",
      });
      return;
    }

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
