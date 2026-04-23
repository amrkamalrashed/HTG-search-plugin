import type { Offer } from './types';

/**
 * Layer-name contract: when a designer selects a frame containing layers
 * named with these keys (with a `#` prefix), the plugin will populate
 * those layers with the offer's data. Match is case-insensitive and ignores
 * spaces, underscores, and hyphens (so `#PricePerNight`, `#price_per_night`,
 * and `#price-per-night` are all equivalent).
 *
 * See docs/LAYER_NAMING_SPEC.md for the designer-facing specification.
 */
export const LAYER_KEYS = [
  'title',
  'categoryLabel',
  'location',
  'city',
  'country',
  'neighborhood',
  'distance',
  'propertyType',
  'pricePerNight',
  'priceSuffix',
  'priceTotal',
  'priceOriginal',
  'discountPercent',
  'discountLabel',
  'currency',
  'ratingAverage',
  'ratingCount',
  'ratingLine',
  'guests',
  'bedrooms',
  'bathrooms',
  'beds',
  'amenities',
  'badge',
  'provider',
  'providerLine',
  'cancellation',
  'url',
  'description',
  'image',
  'imageSecondary',
] as const;

export type LayerKey = (typeof LAYER_KEYS)[number];

export function normalizeLayerName(name: string): string {
  return name.replace(/^#/, '').replace(/[\s_-]+/g, '').toLowerCase();
}

const formatCurrency = (amount: number, currency: string): string => {
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  return `${symbol}${amount.toLocaleString('en-US')}`;
};

/**
 * Produces the string value that should replace a text layer matched by key.
 * Image layers are handled separately in the main thread.
 */
export function textForKey(key: LayerKey, offer: Offer): string | null {
  switch (key) {
    case 'title':
      return offer.title;
    case 'categoryLabel':
      return offer.categoryLabel ?? offer.propertyType.charAt(0).toUpperCase() + offer.propertyType.slice(1);
    case 'location': {
      const parts: string[] = [];
      if (offer.location.distanceToCenterKm !== undefined) {
        parts.push(`${offer.location.distanceToCenterKm.toFixed(1)} km to center`);
      }
      if (offer.location.neighborhood) {
        parts.push(`${offer.location.city} ${offer.location.neighborhood}`);
      } else {
        parts.push(`${offer.location.city}, ${offer.location.country}`);
      }
      return parts.join(' · ');
    }
    case 'city':
      return offer.location.city;
    case 'country':
      return offer.location.country;
    case 'neighborhood':
      return offer.location.neighborhood ?? '';
    case 'distance':
      return offer.location.distanceToCenterKm !== undefined
        ? `${offer.location.distanceToCenterKm.toFixed(1)} km to center`
        : '';
    case 'propertyType':
      return offer.propertyType.charAt(0).toUpperCase() + offer.propertyType.slice(1);
    case 'pricePerNight':
      return formatCurrency(offer.price.perNight, offer.price.currency);
    case 'priceSuffix':
      return `for ${offer.price.nights} ${offer.price.nights === 1 ? 'night' : 'nights'}, incl. fees`;
    case 'priceTotal':
      return `${formatCurrency(offer.price.total, offer.price.currency)} total`;
    case 'priceOriginal':
      return offer.discount
        ? formatCurrency(offer.discount.originalPerNight, offer.price.currency)
        : '';
    case 'discountPercent':
      return offer.discount ? `-${offer.discount.percent}%` : '';
    case 'discountLabel':
      return offer.discount
        ? `${offer.discount.label ?? 'Deal'}: -${offer.discount.percent}%`
        : '';
    case 'currency':
      return offer.price.currency;
    case 'ratingAverage':
      return offer.rating ? offer.rating.average.toFixed(1) : 'New';
    case 'ratingCount':
      return offer.rating ? `(${offer.rating.count.toLocaleString('en-US')} reviews)` : '';
    case 'ratingLine':
      return offer.rating
        ? `★ ${offer.rating.average.toFixed(1)} (${offer.rating.count.toLocaleString('en-US')} reviews)`
        : 'New listing';
    case 'guests':
      return `${offer.capacity.guests} guests`;
    case 'bedrooms':
      return `${offer.capacity.bedrooms} bedrooms`;
    case 'bathrooms':
      return `${offer.capacity.bathrooms} bathrooms`;
    case 'beds':
      return `${offer.capacity.beds} beds`;
    case 'amenities':
      return offer.amenities.slice(0, 4).map((a) => a.replace(/_/g, ' ')).join(' · ');
    case 'badge':
      return offer.badges[0] ? offer.badges[0].replace(/_/g, ' ').toUpperCase() : '';
    case 'provider':
      return offer.provider.name;
    case 'providerLine':
      return `Promoted by ${offer.provider.name}`;
    case 'cancellation':
      return offer.cancellation === 'free_until_7d'
        ? 'Free cancellation'
        : offer.cancellation === 'free_until_24h'
          ? 'Free cancellation within 24h'
          : offer.cancellation === 'flexible'
            ? 'Flexible cancellation'
            : 'Non-refundable';
    case 'url':
      return offer.url;
    case 'description':
      return offer.shortDescription ?? '';
    case 'image':
    case 'imageSecondary':
      return null;
  }
}

export function isImageKey(key: LayerKey): boolean {
  return key === 'image' || key === 'imageSecondary';
}

export function imageUrlForKey(key: LayerKey, offer: Offer): string | undefined {
  if (key === 'image') return offer.images[0]?.url;
  if (key === 'imageSecondary') return offer.images[1]?.url;
  return undefined;
}

export function matchLayerKey(layerName: string): LayerKey | null {
  if (!layerName.startsWith('#')) return null;
  const normalized = normalizeLayerName(layerName);
  for (const key of LAYER_KEYS) {
    if (normalizeLayerName(key) === normalized) return key;
  }
  return null;
}
