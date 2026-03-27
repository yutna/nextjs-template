import type { PlayerCommandFn } from "./types";

// Module-level singleton for the active YouTube player command function.
// At most one VibeBackground is mounted at a time.
let commandFn: null | PlayerCommandFn = null;

export function registerVibePlayerCommand(fn: null | PlayerCommandFn): void {
  commandFn = fn;
}

export function sendVibePlayerCommand(func: string, args?: unknown[]): void {
  commandFn?.(func, args);
}
