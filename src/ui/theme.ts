import type { Theme } from '@shared/messages';

/**
 * Apply a theme override to the iframe's <html> element. We never strip
 * the `figma-dark` class Figma sets — that one tracks the host Figma
 * theme. Instead the plugin layers a `data-theme` attribute on top:
 *
 *   - 'auto'   → follow `figma-dark` (no data-theme attr)
 *   - 'light'  → force light (data-theme="light", overrides figma-dark)
 *   - 'dark'   → force dark  (data-theme="dark")
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'auto') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

/** Resolved boolean: is the iframe currently rendering as dark? */
export function isDark(theme: Theme): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  const cl = document.documentElement.classList;
  return cl.contains('figma-dark') || cl.contains('figma-darker');
}
