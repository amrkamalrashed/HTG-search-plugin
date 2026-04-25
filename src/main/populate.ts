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
 * Fill a single node from the offer if its name matches a layer key.
 * Returns true when the node was successfully populated.
 */
export async function populateNode(
  node: SceneNode,
  offer: Offer,
  locale: Locale = 'en',
): Promise<boolean> {
  if (!node.name.startsWith('#')) return false;
  const key = matchLayerKey(node.name);
  if (!key) return false;

  if (isImageKey(key)) {
    if (node.type !== 'RECTANGLE' && node.type !== 'FRAME' && node.type !== 'ELLIPSE') {
      return false;
    }
    const url = imageUrlForKey(key, offer);
    if (!url) return false;
    const hash = await loadImageHash(url);
    if (!hash) return false;
    applyImageFill(node as GeometryMixin, hash);
    return true;
  }

  if (node.type !== 'TEXT') return false;
  const value = textForKey(key, offer, locale);
  if (value === null) return false;
  await figma.loadFontAsync(node.fontName as FontName);
  (node as TextNode).characters = value;
  return true;
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
    if (await populateNode(node as SceneNode, offer, locale)) filled++;
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
 * If the selection contains a single #fieldName-named node (text or image
 * shape) at the top level, return it. Lets the user drop the card content
 * into one specific layer without wrapping it in a frame first.
 */
export function singleFieldNodeInSelection(
  selection: readonly SceneNode[],
): SceneNode | null {
  for (const node of selection) {
    if (
      node.name.startsWith('#') &&
      matchLayerKey(node.name) &&
      // Only nodes we can actually fill — skip frames (those go through
      // the multi-layer populateSelection path).
      (node.type === 'TEXT' ||
        node.type === 'RECTANGLE' ||
        node.type === 'ELLIPSE')
    ) {
      return node;
    }
  }
  return null;
}
