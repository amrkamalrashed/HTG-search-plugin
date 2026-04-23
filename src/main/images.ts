/**
 * Fetches a remote image via Figma's createImageAsync and returns the hash.
 * Silent on failure — callers should treat `null` as "leave placeholder".
 * The domain must be declared in manifest.networkAccess.allowedDomains.
 */
export async function loadImageHash(url: string): Promise<string | null> {
  try {
    const image = await figma.createImageAsync(url);
    return image.hash;
  } catch {
    return null;
  }
}

export function applyImageFill(node: GeometryMixin, hash: string): void {
  node.fills = [{ type: 'IMAGE', imageHash: hash, scaleMode: 'FILL' }];
}
