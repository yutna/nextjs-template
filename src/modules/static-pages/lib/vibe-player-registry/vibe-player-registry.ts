// Module-level singleton for the active YouTube player command function.
// Client-side only. At most one VibeBackground is mounted at a time.
type PlayerCommandFn = (func: string, args?: unknown[]) => void;

let commandFn: null | PlayerCommandFn = null;

export function registerVibePlayerCommand(fn: null | PlayerCommandFn): void {
  commandFn = fn;
}

export function sendVibePlayerCommand(func: string, args?: unknown[]): void {
  commandFn?.(func, args);
}
