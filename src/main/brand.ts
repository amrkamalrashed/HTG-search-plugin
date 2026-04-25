/**
 * HomeToGo brand tokens, tuned against the reference card screenshot
 * (see docs/BRAND.md). Consumed by the Figma scene-graph builder in
 * src/main/generate.ts. RGB values are 0..1 for Figma's color API.
 *
 * Two token sets — light (default) and dark (Appearance: dark). The
 * exported `BRAND` is a Proxy that reads the active set, so every
 * `BRAND.white` / `BRAND.textPrimary` / etc. in the builders resolves
 * to the correct variant without touching any builder code. Call
 * `setBrandAppearance('dark')` at the top of buildCard / buildSection
 * to switch the active set for that drop. The plugin is single-flow
 * (one drop completes before the next starts) so a module-level
 * pointer is safe.
 */
export type Appearance = 'light' | 'dark';

interface BrandTokens {
  violet: RGB;
  magenta: RGB;
  coral: RGB;
  textPrimary: RGB;
  textSecondary: RGB;
  textTertiary: RGB;
  border: RGB;
  surface: RGB;
  white: RGB;
  greatDealGreen: RGB;
}

const LIGHT_TOKENS: BrandTokens = {
  violet: { r: 0.420, g: 0.259, b: 0.910 },      // #6B42E8
  magenta: { r: 0.820, g: 0.286, b: 0.773 },     // #D149C5
  coral: { r: 0.988, g: 0.302, b: 0.357 },       // #FC4D5B
  textPrimary: { r: 0.055, g: 0.094, b: 0.141 }, // #0E1824
  textSecondary: { r: 0.357, g: 0.420, b: 0.494 }, // #5B6B7E
  textTertiary: { r: 0.584, g: 0.639, b: 0.702 }, // #95A3B3
  border: { r: 0.882, g: 0.902, b: 0.925 },      // #E1E6EC
  surface: { r: 0.969, g: 0.976, b: 0.988 },     // #F7F9FC
  white: { r: 1, g: 1, b: 1 },
  greatDealGreen: { r: 0.133, g: 0.624, b: 0.431 }, // #22A06E
};

/**
 * Dark-mode variant. Card background → near-black, text → white-ish,
 * borders → translucent white. Brand violet/magenta/coral are unchanged
 * because they read well on either background. The `white` slot becomes
 * the dark card surface — `BRAND.white` is used in generate.ts for card
 * fills, so swapping it cleanly inverts the surface without touching
 * the layout code.
 */
const DARK_TOKENS: BrandTokens = {
  violet: { r: 0.608, g: 0.494, b: 0.961 },      // #9B7EF5
  magenta: { r: 0.886, g: 0.431, b: 0.835 },     // #E26ED5
  coral: { r: 1.0, g: 0.435, b: 0.486 },         // #FF6F7C
  textPrimary: { r: 1, g: 1, b: 1 },             // #FFFFFF
  textSecondary: { r: 0.78, g: 0.78, b: 0.80 },  // ~#C7C7CC
  textTertiary: { r: 0.55, g: 0.55, b: 0.58 },   // ~#8C8C92
  border: { r: 0.30, g: 0.30, b: 0.30 },         // #4D4D4D
  surface: { r: 0.20, g: 0.20, b: 0.20 },        // #333333
  white: { r: 0.137, g: 0.137, b: 0.137 },       // #232323
  greatDealGreen: { r: 0.31, g: 0.77, b: 0.56 }, // #4ECC8E
};

let _activeTokens: BrandTokens = LIGHT_TOKENS;

export function setBrandAppearance(appearance: Appearance | undefined): void {
  _activeTokens = appearance === 'dark' ? DARK_TOKENS : LIGHT_TOKENS;
}

export const BRAND: BrandTokens = new Proxy({} as BrandTokens, {
  get(_target, key: string | symbol) {
    return _activeTokens[key as keyof BrandTokens];
  },
});

export const FONT = {
  regular: { family: 'Inter', style: 'Regular' } as FontName,
  medium: { family: 'Inter', style: 'Medium' } as FontName,
  semibold: { family: 'Inter', style: 'Semi Bold' } as FontName,
  bold: { family: 'Inter', style: 'Bold' } as FontName,
} as const;

export const CARD = {
  width: 880,
  height: 320,
  imageWidth: 340,
  actionsWidth: 200,
  radius: 16,
  padding: 20,
  gap: 8,
} as const;

/**
 * Linear gradient paint used for the "View deal" CTA button.
 */
export const VIEW_DEAL_GRADIENT: GradientPaint = {
  type: 'GRADIENT_LINEAR',
  gradientTransform: [
    [1, 0, 0],
    [0, 1, 0],
  ],
  gradientStops: [
    { position: 0, color: { ...BRAND.violet, a: 1 } },
    { position: 1, color: { ...BRAND.magenta, a: 1 } },
  ],
};
