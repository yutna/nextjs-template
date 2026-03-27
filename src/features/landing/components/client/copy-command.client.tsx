"use client";

import { CopyCommand } from "@/features/landing/components/copy-command";
import { useCopyCommand } from "@/features/landing/components/hooks/use-copy-command";
import { useVibe } from "@/features/landing/components/hooks/use-vibe";

export function CopyCommandButton() {
  const { handleCopy, isCopied } = useCopyCommand();
  const { isVibeOn } = useVibe();

  return (
    <CopyCommand isCopied={isCopied} isVibeOn={isVibeOn} onCopy={handleCopy} />
  );
}
