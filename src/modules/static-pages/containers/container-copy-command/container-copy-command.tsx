"use client";

import { useImmer } from "use-immer";

import { CopyCommand } from "@/modules/static-pages/components/copy-command";
import { HERO_INSTALL_COMMAND } from "@/modules/static-pages/components/copy-command/constants";
import { useVibe } from "@/modules/static-pages/hooks/use-vibe";

export function ContainerCopyCommand() {
  const [state, updateState] = useImmer({ copied: false });
  const { isVibeOn } = useVibe();

  async function handleCopy() {
    await navigator.clipboard.writeText(HERO_INSTALL_COMMAND);
    updateState((draft) => {
      draft.copied = true;
    });
    setTimeout(() => {
      updateState((draft) => {
        draft.copied = false;
      });
    }, 2000);
  }

  return (
    <CopyCommand isCopied={state.copied} isVibeOn={isVibeOn} onCopy={handleCopy} />
  );
}
