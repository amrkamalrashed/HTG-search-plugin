import { describe, expect, it } from 'vitest';
import type { Offer } from '@shared/types';
import { localize } from '@shared/localize';

const base: Offer = {
  id: 'o1',
  title: 'English title',
  propertyType: 'apartment',
  categoryLabel: 'Apartment',
  location: { city: 'Berlin', country: 'Germany', countryCode: 'DE' },
  images: [],
  price: { perNight: 100, total: 700, currency: 'EUR', nights: 7 },
  capacity: { guests: 2, bedrooms: 1, bathrooms: 1, beds: 1 },
  amenities: [],
  badges: [],
  provider: { name: 'Vrbo' },
  cancellation: 'free_until_7d',
  url: 'https://example.com',
  shortDescription: 'English short.',
  fullDescription: 'English full.',
  highlights: ['English highlight'],
};

describe('localize', () => {
  it('returns the source offer unchanged for English', () => {
    const result = localize(base, 'en');
    expect(result).toBe(base);
  });

  it('returns the source offer unchanged when no i18n is set', () => {
    const result = localize(base, 'de');
    expect(result).toBe(base);
  });

  it('returns the source offer unchanged when the requested locale has no overrides', () => {
    const offer: Offer = { ...base, i18n: { fr: { title: 'French title' } } };
    const result = localize(offer, 'de');
    expect(result).toBe(offer);
  });

  it('overlays matching fields and falls back to English for missing ones', () => {
    const offer: Offer = {
      ...base,
      i18n: {
        de: {
          title: 'Deutscher Titel',
          shortDescription: 'Deutsche Kurzbeschreibung.',
        },
      },
    };
    const result = localize(offer, 'de');
    expect(result.title).toBe('Deutscher Titel');
    expect(result.shortDescription).toBe('Deutsche Kurzbeschreibung.');
    // Unmentioned fields fall back to English.
    expect(result.fullDescription).toBe('English full.');
    expect(result.highlights).toEqual(['English highlight']);
    expect(result.categoryLabel).toBe('Apartment');
  });

  it('replaces array fields atomically rather than merging element-wise', () => {
    const offer: Offer = {
      ...base,
      i18n: {
        fr: {
          highlights: ['Point fort français'],
        },
      },
    };
    const result = localize(offer, 'fr');
    expect(result.highlights).toEqual(['Point fort français']);
  });

  it('does not mutate the source offer', () => {
    const offer: Offer = {
      ...base,
      i18n: { es: { title: 'Título' } },
    };
    const before = JSON.stringify(offer);
    localize(offer, 'es');
    expect(JSON.stringify(offer)).toBe(before);
  });
});
