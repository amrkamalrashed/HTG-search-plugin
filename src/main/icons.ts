/**
 * Minimal inline SVG icons used by the canvas card builder.
 * figma.createNodeFromSvg parses these and returns a FrameNode with
 * vector children; callers tint the strokes/fills after insertion.
 *
 * Kept tiny on purpose — this is a PoC. When HTG shares the real icon
 * set, replace these strings with the production SVGs.
 */

const svg = (body: string, size = 20) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#5B6B7E" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICON = {
  share: svg('<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>'),
  heart: svg('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'),
  fullscreen: svg('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>', 16),
  wifi: svg('<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>', 18),
  snowflake: svg('<line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>', 18),
  pets: svg('<circle cx="5.5" cy="9.5" r="1.5"/><circle cx="18.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="4.5" r="1.5"/><circle cx="15.5" cy="4.5" r="1.5"/><path d="M8 14.5c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5c0 1-.5 1.8-1.3 2.3l-1.4.8c-.5.3-.8.8-.8 1.4v.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5v-.5c0-.6-.3-1.1-.8-1.4l-1.4-.8c-.8-.5-1.3-1.3-1.3-2.3z"/>', 18),
  smoking: svg('<rect x="2" y="10" width="16" height="4" rx="1"/><path d="M18 10v4"/><path d="M22 10v4"/><path d="M6 6c0-2 2-2 2-4"/><path d="M10 6c0-2 2-2 2-4"/>', 18),
  parking: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h3.5a3 3 0 0 1 0 6H9"/>', 18),
  bed: svg('<path d="M2 10h20v8H2z"/><path d="M2 14h20"/><path d="M2 18v2"/><path d="M22 18v2"/><path d="M4 10V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/>', 18),
  tv: svg('<rect x="2" y="4" width="20" height="14" rx="2"/><line x1="8" y1="22" x2="16" y2="22"/><line x1="12" y1="18" x2="12" y2="22"/>', 18),
  kitchen: svg('<path d="M14 2v10"/><path d="M10 2h4"/><path d="M6 2v20"/><path d="M4 6h4"/><path d="M16 20v2"/><circle cx="14" cy="16" r="4"/>', 18),
  hair_dryer: svg('<path d="M3 8a5 5 0 0 1 5-5h6a5 5 0 0 1 0 10H8l-2 3h-3z"/><path d="M14 13v5a2 2 0 0 1-2 2h-1"/>', 18),
  breakfast: svg('<path d="M4 10h13a3 3 0 0 1 0 6h-1"/><path d="M4 10v6a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-6z"/><line x1="6" y1="2" x2="6" y2="6"/><line x1="10" y1="2" x2="10" y2="6"/>', 18),
  heating: svg('<rect x="4" y="6" width="16" height="14" rx="1"/><line x1="8" y1="6" x2="8" y2="20"/><line x1="12" y1="6" x2="12" y2="20"/><line x1="16" y1="6" x2="16" y2="20"/>', 18),
  elevator: svg('<rect x="4" y="2" width="16" height="20" rx="1"/><polyline points="9 8 12 5 15 8"/><polyline points="9 16 12 19 15 16"/>', 18),
  pool: svg('<path d="M2 12c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M2 18c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M6 6h4a2 2 0 0 1 2 2v4"/>', 18),
  clean: svg('<path d="M3 21v-7l6-6 4 4-6 6H3z"/><path d="M12 3l2-2 8 8-2 2"/><line x1="13" y1="10" x2="18" y2="15"/>', 18),
} as const;

export type IconName = keyof typeof ICON;

export function placeIcon(name: IconName, color: RGB): FrameNode {
  const node = figma.createNodeFromSvg(ICON[name]);
  node.name = `icon/${name}`;
  for (const child of node.findAllWithCriteria({ types: ['VECTOR', 'LINE', 'ELLIPSE', 'RECTANGLE', 'POLYGON'] })) {
    const c = child as unknown as { strokes?: Paint[]; fills?: Paint[] };
    if (c.strokes && c.strokes.length > 0) {
      c.strokes = c.strokes.map((s) =>
        s.type === 'SOLID' ? { ...s, color } : s,
      );
    }
  }
  return node;
}
