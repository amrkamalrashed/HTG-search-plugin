import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import { imageUrlForKey, isImageKey, matchLayerKey, textForKey } from '@shared/layer-names';
import { loadImageHash, applyImageFill } from './images';

type TargetNode = FrameNode | ComponentNode | InstanceNode | GroupNode;

function isTarget(node: BaseNode): node is TargetNode {
  return (
    node.type === 'FRAME' ||
    node.type === 'COMPONENT' ||
    node.type === 'INSTANCE' ||
    node.type === 'GROUP'
  );
}

/**
 * Walks the subtree under `root` and populates any layer whose name matches
 * the #fieldName convention (see docs/LAYER_NAMING_SPEC.md). Returns the
 * number of layers populated.
 */
export async function populateSelection(
  root: TargetNode,
  offer: Offer,
  locale: Locale = 'en',
): Promise<number> {
  let filled = 0;
  const candidates = root.findAll((n) => n.name.startsWith('#'));

  for (const node of candidates) {
    const key = matchLayerKey(node.name);
    if (!key) continue;

    if (isImageKey(key)) {
      if (node.type !== 'RECTANGLE' && node.type !== 'FRAME' && node.type !== 'ELLIPSE') continue;
      const url = imageUrlForKey(key, offer);
      if (!url) continue;
      const hash = await loadImageHash(url);
      if (hash) {
        applyImageFill(node as GeometryMixin, hash);
        filled++;
      }
      continue;
    }

    if (node.type !== 'TEXT') continue;
    const value = textForKey(key, offer, locale);
    if (value === null) continue;
    await figma.loadFontAsync(node.fontName as FontName);
    (node as TextNode).characters = value;
    filled++;
  }

  root.setPluginData('htgOfferId', offer.id);
  root.setPluginData('htgLocale', locale);
  root.setPluginData('htgInsertedAt', new Date().toISOString());
  return filled;
}

export function firstTargetInSelection(selection: readonly SceneNode[]): TargetNode | null {
  for (const node of selection) {
    if (isTarget(node)) return node;
  }
  return null;
}

/** True when the target has any direct or nested #fieldName layer. */
export function hasFieldNames(root: TargetNode): boolean {
  const found = root.findOne((n) => n.name.startsWith('#') && !!matchLayerKey(n.name));
  return !!found;
}

/**
 * Drop `child` into `target`. When `opts.replaceContents` is true,
 * every existing child of `target` is removed first (the "Replace"
 * toggle in the drop banner). Otherwise the child is appended at the
 * end of the children list.
 *
 * The `[...target.children]` shallow copy is mandatory: removing
 * children while iterating the live `target.children` array would
 * skip every other entry as the indices shift.
 */
export function fillIntoTarget(
  target: TargetNode,
  child: SceneNode,
  opts: { replaceContents?: boolean } = {},
): void {
  if (opts.replaceContents) {
    for (const c of [...target.children]) c.remove();
  }
  target.appendChild(child);
}
