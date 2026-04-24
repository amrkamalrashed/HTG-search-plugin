import type { Offer } from './types';
import type { Locale } from './locales';

/**
 * Returns a view of the offer with locale-specific overrides merged on top
 * of the English source. Proper nouns (city, country, neighborhood, author
 * names, prices) stay canonical. Missing translations fall back to the
 * English/source value, never to a placeholder.
 */
export function localize(offer: Offer, locale: Locale): Offer {
  if (locale === 'en' || !offer.i18n) return offer;
  const overrides = offer.i18n[locale];
  if (!overrides) return offer;

  return {
    ...offer,
    title: overrides.title ?? offer.title,
    categoryLabel: overrides.categoryLabel ?? offer.categoryLabel,
    shortDescription: overrides.shortDescription ?? offer.shortDescription,
    fullDescription: overrides.fullDescription ?? offer.fullDescription,
    highlights: overrides.highlights ?? offer.highlights,
    travelDatesLabel: overrides.travelDatesLabel ?? offer.travelDatesLabel,
    address: overrides.address ?? offer.address,
    reasonsToBook: overrides.reasonsToBook ?? offer.reasonsToBook,
    houseRules: overrides.houseRules ?? offer.houseRules,
    cancellationPolicy: overrides.cancellationPolicy ?? offer.cancellationPolicy,
    rooms: overrides.rooms ?? offer.rooms,
  };
}
