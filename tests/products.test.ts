import { describe, expect, it } from 'vitest';
import productsJson from '@data/products.json';
import type { Offer } from '@shared/types';
import { localize } from '@shared/localize';

const OFFERS = productsJson as unknown as Offer[];
const LOCALES = ['de', 'es', 'fr'] as const;

describe('products.json', () => {
  it('has 10 offers', () => {
    expect(OFFERS).toHaveLength(10);
  });

  it('every offer has a unique id', () => {
    const ids = new Set(OFFERS.map((o) => o.id));
    expect(ids.size).toBe(OFFERS.length);
  });

  it('every offer carries all detail-page fields', () => {
    for (const o of OFFERS) {
      expect(o.fullDescription, `${o.id} fullDescription`).toBeTruthy();
      expect(o.priceBreakdown, `${o.id} priceBreakdown`).toBeTruthy();
      expect(o.rooms, `${o.id} rooms`).toBeTruthy();
      expect(o.reasonsToBook, `${o.id} reasonsToBook`).toBeTruthy();
      expect(o.houseRules, `${o.id} houseRules`).toBeTruthy();
      expect(o.cancellationPolicy, `${o.id} cancellationPolicy`).toBeTruthy();
      expect(o.address, `${o.id} address`).toBeTruthy();
      expect(o.amenitiesByCategory, `${o.id} amenitiesByCategory`).toBeTruthy();
      expect(o.reviewDetails, `${o.id} reviewDetails`).toBeTruthy();
    }
  });

  it('every offer has de/es/fr translations for visible fields', () => {
    for (const o of OFFERS) {
      expect(o.i18n, `${o.id} i18n block`).toBeTruthy();
      for (const l of LOCALES) {
        const block = o.i18n?.[l];
        expect(block, `${o.id} ${l} i18n`).toBeTruthy();
        expect(block?.title, `${o.id} ${l} title`).toBeTruthy();
        expect(block?.shortDescription, `${o.id} ${l} shortDescription`).toBeTruthy();
        expect(block?.fullDescription, `${o.id} ${l} fullDescription`).toBeTruthy();
        expect(block?.highlights?.length, `${o.id} ${l} highlights`).toBeGreaterThan(0);
      }
    }
  });

  it('localize() produces a non-empty title for each locale', () => {
    // We don't assert translated !== English on every field: some
    // listings have titles that are already in their local language
    // (e.g. "Blockhütte am Titisee" or "Luxuriöses Penthouse...") so
    // the English source happens to match the German translation.
    for (const o of OFFERS) {
      for (const l of LOCALES) {
        const translated = localize(o, l).title;
        expect(translated, `${o.id} ${l}`).toBeTruthy();
      }
    }
  });

  it('localize() uses the override when it differs from the English source', () => {
    // Pick an offer whose English title is unambiguously English and
    // verify each locale substitutes a different string.
    const englishTitled = OFFERS.find((o) => o.id === 'offer_20394857');
    expect(englishTitled).toBeTruthy();
    if (!englishTitled) return;
    const en = englishTitled.title;
    for (const l of LOCALES) {
      expect(localize(englishTitled, l).title).not.toBe(en);
    }
  });
});
