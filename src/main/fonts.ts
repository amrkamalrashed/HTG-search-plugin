import { FONT } from './brand';

let loaded: Promise<void> | null = null;

export function loadBrandFonts(): Promise<void> {
  if (!loaded) {
    loaded = Promise.all([
      figma.loadFontAsync(FONT.regular),
      figma.loadFontAsync(FONT.medium),
      figma.loadFontAsync(FONT.semibold),
      figma.loadFontAsync(FONT.bold),
    ]).then(() => undefined);
  }
  return loaded;
}
