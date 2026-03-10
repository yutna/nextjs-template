export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isNetworkError(err: unknown): boolean {
  if (!(err instanceof TypeError)) return false;

  const message = err.message.trim().toLowerCase();

  return message === "failed to fetch" || message === "fetch failed";
}
