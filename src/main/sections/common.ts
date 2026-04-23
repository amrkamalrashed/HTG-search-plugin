import { BRAND, FONT } from '../brand';

/** Shared helpers for building detail-page sections. */

export const SECTION_WIDTH = 880;
export const SECTION_RADIUS = 16;
export const SECTION_PADDING = 24;
export const SECTION_GAP = 16;

export function makeText(
  name: string,
  characters: string,
  font: FontName,
  size: number,
  color: RGB,
): TextNode {
  const t = figma.createText();
  t.name = name;
  t.fontName = font;
  t.fontSize = size;
  t.characters = characters;
  t.fills = [{ type: 'SOLID', color }];
  return t;
}

export function hframe(name: string, gap = 0): FrameNode {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = 'HORIZONTAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.counterAxisAlignItems = 'CENTER';
  f.itemSpacing = gap;
  f.fills = [];
  return f;
}

export function vframe(name: string, gap = 0): FrameNode {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = 'VERTICAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.itemSpacing = gap;
  f.fills = [];
  return f;
}

/**
 * Creates a section-sized card frame (outer wrapper). Section-specific
 * builders populate its children.
 */
export function sectionFrame(name: string, width = SECTION_WIDTH): FrameNode {
  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'FIXED';
  frame.resize(width, 1);
  frame.paddingTop = frame.paddingBottom = SECTION_PADDING;
  frame.paddingLeft = frame.paddingRight = SECTION_PADDING;
  frame.itemSpacing = SECTION_GAP;
  frame.cornerRadius = SECTION_RADIUS;
  frame.fills = [{ type: 'SOLID', color: BRAND.white }];
  frame.strokes = [{ type: 'SOLID', color: BRAND.border }];
  frame.strokeWeight = 1;
  return frame;
}

export function sectionHeading(label: string): TextNode {
  return makeText('sectionHeading', label, FONT.bold, 18, BRAND.textPrimary);
}
