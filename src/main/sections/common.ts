import type { Platform } from '@shared/platforms';
import { BRAND, FONT } from '../brand';

/**
 * Shared helpers + per-platform sizing for detail-page sections.
 *
 * Web keeps the existing 880 px wide block with 24 px padding.
 * iOS/Android use 375 / 360 px wide with tighter 16 px padding and
 * no stroke (the sections get stacked into a scroll view).
 */

export interface SectionMetrics {
  width: number;
  padding: number;
  radius: number;
  gap: number;
  headingSize: number;
  bodySize: number;
  metaSize: number;
  stroke: boolean;
  shadow: boolean;
}

export const SECTION_METRICS: Record<Platform, SectionMetrics> = {
  web: {
    width: 880,
    padding: 24,
    radius: 16,
    gap: 16,
    headingSize: 18,
    bodySize: 14,
    metaSize: 12,
    stroke: true,
    shadow: false,
  },
  ios: {
    width: 343,
    padding: 20,
    radius: 16,
    gap: 12,
    headingSize: 17,
    bodySize: 14,
    metaSize: 12,
    stroke: false,
    shadow: false,
  },
  android: {
    width: 360,
    padding: 20,
    radius: 12,
    gap: 12,
    headingSize: 17,
    bodySize: 14,
    metaSize: 12,
    stroke: false,
    shadow: false,
  },
};

export function metrics(platform: Platform): SectionMetrics {
  return SECTION_METRICS[platform];
}

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
 * Creates a platform-aware section frame. Mobile sections are
 * edge-to-edge within a vertical scroll; web sections are cards.
 */
export function sectionFrame(name: string, platform: Platform): FrameNode {
  const m = metrics(platform);
  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'FIXED';
  frame.resizeWithoutConstraints(m.width, 1);
  frame.paddingTop = frame.paddingBottom = m.padding;
  frame.paddingLeft = frame.paddingRight = m.padding;
  frame.itemSpacing = m.gap;
  frame.cornerRadius = m.radius;
  frame.fills = [{ type: 'SOLID', color: BRAND.white }];
  if (m.stroke) {
    frame.strokes = [{ type: 'SOLID', color: BRAND.border }];
    frame.strokeWeight = 1;
  }
  return frame;
}

export function sectionHeading(label: string, platform: Platform): TextNode {
  return makeText(
    'sectionHeading',
    label,
    FONT.bold,
    metrics(platform).headingSize,
    BRAND.textPrimary,
  );
}

export function divider(width: number): FrameNode {
  const d = figma.createFrame();
  d.name = 'divider';
  d.resizeWithoutConstraints(width, 1);
  d.layoutAlign = 'STRETCH';
  d.fills = [{ type: 'SOLID', color: BRAND.border }];
  return d;
}

/** Legacy constants still used by existing gallery builder. */
export const SECTION_WIDTH = 880;
export const SECTION_PADDING = 24;
export const SECTION_RADIUS = 16;
export const SECTION_GAP = 16;
