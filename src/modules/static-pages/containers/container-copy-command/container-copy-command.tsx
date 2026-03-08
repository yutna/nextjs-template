"use client";

import { CopyCommand } from "@/modules/static-pages/components/copy-command";
import { useCopyCommand } from "@/modules/static-pages/hooks/use-copy-command";
import { useVibe } from "@/modules/static-pages/hooks/use-vibe";

export function ContainerCopyCommand() {
  const { handleCopy, isCopied } = useCopyCommand();
  const { isVibeOn } = useVibe();

  return (
    <CopyCommand isCopied={isCopied} isVibeOn={isVibeOn} onCopy={handleCopy} />
  );
}
