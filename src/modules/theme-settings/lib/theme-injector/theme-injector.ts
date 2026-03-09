export function injectThemeCssVars(vars: Record<string, string>): void {
  for (const [key, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(key, value);
  }
}

export function clearThemeCssVars(keys: string[]): void {
  for (const key of keys) {
    document.documentElement.style.removeProperty(key);
  }
}
