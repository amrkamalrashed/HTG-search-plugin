/**
 * HomeToGo brand tokens, tuned against the reference card screenshot
 * (see docs/BRAND.md). Consumed by the Figma scene-graph builder in
 * src/main/generate.ts. RGB values are 0..1 for Figma's color API.
 */
export const BRAND = {
  // Purple / pink gradient (primary CTA + rating star accent)
  violet: { r: 0.420, g: 0.259, b: 0.910 },      // #6B42E8
  magenta: { r: 0.820, g: 0.286, b: 0.773 },     // #D149C5

  // Coral accent (used for discount pills on the image, not for CTAs)
  coral: { r: 0.988, g: 0.302, b: 0.357 },       // #FC4D5B

  // Text
  textPrimary: { r: 0.055, g: 0.094, b: 0.141 }, // #0E1824
  textSecondary: { r: 0.357, g: 0.420, b: 0.494 }, // #5B6B7E
  textTertiary: { r: 0.584, g: 0.639, b: 0.702 }, // #95A3B3

  // Surfaces
  border: { r: 0.882, g: 0.902, b: 0.925 },      // #E1E6EC
  surface: { r: 0.969, g: 0.976, b: 0.988 },     // #F7F9FC
  white: { r: 1, g: 1, b: 1 },

  // Status
  greatDealGreen: { r: 0.133, g: 0.624, b: 0.431 }, // #22A06E
} as const;

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
