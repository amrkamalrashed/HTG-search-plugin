import type { Offer } from '@shared/types';
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
export async function populateSelection(root: TargetNode, offer: Offer): Promise<number> {
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
    const value = textForKey(key, offer);
    if (value === null) continue;
    await figma.loadFontAsync(node.fontName as FontName);
    (node as TextNode).characters = value;
    filled++;
  }

  root.setPluginData('htgOfferId', offer.id);
  root.setPluginData('htgInsertedAt', new Date().toISOString());
  return filled;
}

export function firstTargetInSelection(selection: readonly SceneNode[]): TargetNode | null {
  for (const node of selection) {
    if (isTarget(node)) return node;
  }
  return null;
}
