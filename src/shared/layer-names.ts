import type { Currency, Offer } from './types';
import type { Locale } from './locales';
import { t } from './locales';
import { formatPrice } from './format';

/**
 * Layer-name contract: when a designer selects a frame containing layers
 * named with these keys (with a `#` prefix), the plugin will populate
 * those layers with the offer's data. Match is case-insensitive and ignores
 * spaces, underscores, and hyphens.
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

/**
 * Produces the string value that should replace a text layer matched by key,
 * in the chosen locale.
 */
export function textForKey(key: LayerKey, offer: Offer, locale: Locale = 'en'): string | null {
  switch (key) {
    case 'title':
      return offer.title;
    case 'categoryLabel':
      return offer.categoryLabel ?? t(offer.propertyType, locale);
    case 'location': {
      const parts: string[] = [];
      if (offer.location.distanceToCenterKm !== undefined) {
        parts.push(
          t('kmToCenter', locale, { n: offer.location.distanceToCenterKm.toFixed(1) }),
        );
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
        ? t('kmToCenter', locale, { n: offer.location.distanceToCenterKm.toFixed(1) })
        : '';
    case 'propertyType':
      return t(offer.propertyType, locale);
    case 'pricePerNight':
      return formatPrice(offer.price.perNight, offer.price.currency, locale);
    case 'priceSuffix': {
      const k = offer.price.nights === 1 ? 'forNight' : 'forNights';
      return t(k, locale, { n: offer.price.nights });
    }
    case 'priceTotal':
      return `${formatPrice(offer.price.total, offer.price.currency, locale)} ${t('total', locale)}`;
    case 'priceOriginal':
      return offer.discount
        ? formatPrice(offer.discount.originalPerNight, offer.price.currency, locale)
        : '';
    case 'discountPercent':
      return offer.discount ? `-${offer.discount.percent}%` : '';
    case 'discountLabel':
      return offer.discount
        ? `${offer.discount.label ?? t('lastMinuteDeal', locale)}: -${offer.discount.percent}%`
        : '';
    case 'currency':
      return offer.price.currency;
    case 'ratingAverage':
      return offer.rating ? offer.rating.average.toFixed(1) : t('newListing', locale);
    case 'ratingCount':
      return offer.rating
        ? `(${offer.rating.count.toLocaleString()} ${t('reviews', locale)})`
        : '';
    case 'ratingLine':
      return offer.rating
        ? `★ ${offer.rating.average.toFixed(1)} (${offer.rating.count.toLocaleString()} ${t('reviews', locale)})`
        : t('newListing', locale);
    case 'guests':
      return `${offer.capacity.guests} ${t('guests', locale)}`;
    case 'bedrooms':
      return `${offer.capacity.bedrooms} ${t('bedrooms', locale)}`;
    case 'bathrooms':
      return `${offer.capacity.bathrooms} ${t('bathrooms', locale)}`;
    case 'beds':
      return `${offer.capacity.beds} ${t('beds', locale)}`;
    case 'amenities':
      return offer.amenities.slice(0, 4).map((a) => a.replace(/_/g, ' ')).join(' · ');
    case 'badge':
      return offer.badges[0] ? offer.badges[0].replace(/_/g, ' ').toUpperCase() : '';
    case 'provider':
      return offer.provider.name;
    case 'providerLine':
      return t('promotedBy', locale, { name: offer.provider.name });
    case 'cancellation':
      return offer.cancellation === 'free_until_7d'
        ? t('freeCancellation', locale)
        : offer.cancellation === 'free_until_24h'
          ? t('freeCancellationShort', locale)
          : offer.cancellation === 'flexible'
            ? t('freeCancellationFlex', locale)
            : t('nonRefundable', locale);
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
