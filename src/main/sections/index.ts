import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { SectionKind } from '@shared/messages';
import { loadBrandFonts } from '../fonts';
import { buildGallery } from './gallery';
import { buildAmenities } from './amenities';
import { buildReviews } from './reviews';
import { buildPriceBreakdown } from './priceBreakdown';

/**
 * Builds a single detail-page section. All sections share the same
 * outer frame contract: section frame sized at 880px wide, vertical
 * auto-layout, white background + subtle outline. Only gallery breaks
 * the outer padding/radius to bleed images edge-to-edge.
 */
export async function buildSection(
  kind: SectionKind,
  offer: Offer,
  locale: Locale,
): Promise<FrameNode> {
  await loadBrandFonts();
  let node: FrameNode;
  switch (kind) {
    case 'gallery':
      node = await buildGallery(offer, locale);
      break;
    case 'amenities':
      node = buildAmenities(offer, locale);
      break;
    case 'reviews':
      node = buildReviews(offer, locale);
      break;
    case 'priceBreakdown':
      node = buildPriceBreakdown(offer, locale);
      break;
  }
  node.setPluginData('htgOfferId', offer.id);
  node.setPluginData('htgSectionKind', kind);
  node.setPluginData('htgLocale', locale);
  return node;
}
