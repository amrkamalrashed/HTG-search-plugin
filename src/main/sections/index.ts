import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import type { SectionKind } from '@shared/messages';
import { localize } from '@shared/localize';
import { loadBrandFonts } from '../fonts';
import { buildGallery } from './gallery';
import { buildAmenities } from './amenities';
import { buildReviews } from './reviews';
import { buildPriceBreakdown } from './priceBreakdown';
import { buildTitleHeader } from './titleHeader';
import { buildQuickFacts } from './quickFacts';
import { buildReasonsToBook } from './reasonsToBook';
import { buildRoomInformation } from './roomInformation';
import { buildDescription } from './description';
import { buildHouseRules } from './houseRules';
import { buildLocation } from './location';
import { buildCancellationPolicy } from './cancellationPolicy';

/**
 * Builds a single detail-page section in the chosen locale and
 * platform layout. Each section stamps its identity + the offer id
 * via setPluginData so the Refresh action can round-trip.
 */
export async function buildSection(
  kind: SectionKind,
  offer: Offer,
  locale: Locale,
  platform: Platform = 'web',
): Promise<FrameNode> {
  await loadBrandFonts();
  const view = localize(offer, locale);
  let node: FrameNode;
  switch (kind) {
    case 'gallery':
      node = await buildGallery(view, locale, platform);
      break;
    case 'titleHeader':
      node = buildTitleHeader(view, locale, platform);
      break;
    case 'quickFacts':
      node = buildQuickFacts(view, locale, platform);
      break;
    case 'reasonsToBook':
      node = buildReasonsToBook(view, locale, platform);
      break;
    case 'reviews':
      node = buildReviews(view, locale, platform);
      break;
    case 'amenities':
      node = buildAmenities(view, locale, platform);
      break;
    case 'roomInformation':
      node = buildRoomInformation(view, locale, platform);
      break;
    case 'description':
      node = buildDescription(view, locale, platform);
      break;
    case 'houseRules':
      node = buildHouseRules(view, locale, platform);
      break;
    case 'location':
      node = await buildLocation(view, locale, platform);
      break;
    case 'priceBreakdown':
      node = buildPriceBreakdown(view, locale, platform);
      break;
    case 'cancellationPolicy':
      node = buildCancellationPolicy(view, locale, platform);
      break;
  }
  node.setPluginData('htgOfferId', offer.id);
  node.setPluginData('htgSectionKind', kind);
  node.setPluginData('htgLocale', locale);
  node.setPluginData('htgPlatform', platform);
  return node;
}
