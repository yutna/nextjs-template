export interface UseCopyCommandReturn {
  handleCopy: () => Promise<void>;
  isCopied: boolean;
}
