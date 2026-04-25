import productsJson from '@data/products.json';
import type { Offer, PropertyType } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { SortKey } from '@shared/messages';
import { localize } from '@shared/localize';

/**
 * Read-only data source for the property catalogue.
 *
 * The PoC ships `JsonOffersSource`, which inlines `products.json` at
 * build time and applies `localize(offer, locale)` so callers always
 * get pre-localized offers. v2 will replace it with `ApiOffersSource`
 * — the call sites only depend on this interface, not the impl.
 *
 * The interface is intentionally locale-aware: a real product API
 * takes `Accept-Language` (or `?locale=de`) and returns just that
 * locale's data, so the i18n block on `Offer` is a PoC artifact that
 * disappears in v2.
 *
 * Methods are async on purpose. Today's JsonOffersSource resolves
 * synchronously, but App.tsx awaits the result so the v2 swap to a
 * real fetch is just `new ApiOffersSource(url)`.
 */
export interface OffersSource {
  /** Search / list offers. The query carries locale + filters + sort. */
  search(query: SearchQuery): Promise<Offer[]>;
  /** Single offer by id, in the requested locale. */
  getById(id: string, locale: Locale): Promise<Offer | null>;
}

export interface SearchQuery {
  /** Required: every result must be in this locale. */
  locale: Locale;
  /** Free-text search across title + city + country + neighborhood. */
  text?: string;
  filters?: {
    propertyType?: PropertyType;
    minRating?: number;
    priceMax?: number;
    minGuests?: number;
  };
  sort?: SortKey;
  /** Hard cap on results. Forwards to the API's `limit` parameter. */
  limit?: number;
  /** Server-driven pagination cursor (v2 only; ignored in JSON). */
  cursor?: string;
}

/**
 * JSON-backed source. The catalogue is bundled at build time via
 * esbuild's resolveJsonModule, so search() resolves synchronously.
 *
 * Filtering + sorting + locale-substitution all happen in-process.
 * In v2 the API takes the SearchQuery directly and the work moves
 * server-side, but the SearchQuery shape is already designed for
 * that handover.
 */
export class JsonOffersSource implements OffersSource {
  private readonly raw: Offer[];

  constructor(raw: Offer[]) {
    this.raw = raw;
  }

  async search(query: SearchQuery): Promise<Offer[]> {
    const localized = this.raw.map((o) => localize(o, query.locale));
    const filtered = localized.filter((o) => matchesQuery(o, query));
    const sorted = sortOffers(filtered, query.sort);
    return query.limit ? sorted.slice(0, query.limit) : sorted;
  }

  async getById(id: string, locale: Locale): Promise<Offer | null> {
    const found = this.raw.find((o) => o.id === id);
    return found ? localize(found, locale) : null;
  }
}

/**
 * v2 placeholder. When the API spec lands, implement this to:
 *   1. fetch the search endpoint with `query` mapped to query params,
 *   2. pipe each raw response item through `parseApiOffer`,
 *   3. return the resulting `Offer[]`.
 *
 * The host needs to be in `package.json` →
 * `figma-plugin.networkAccess.allowedDomains` (CORS still applies).
 */
// export class ApiOffersSource implements OffersSource {
//   constructor(private readonly baseUrl: string) {}
//   async search(query: SearchQuery): Promise<Offer[]> {
//     const res = await fetch(`${this.baseUrl}/search?...`);
//     const json = await res.json();
//     return json.items.map(parseApiOffer);
//   }
//   async getById(id: string, locale: Locale): Promise<Offer | null> {
//     const res = await fetch(`${this.baseUrl}/offers/${id}?locale=${locale}`);
//     if (!res.ok) return null;
//     return parseApiOffer(await res.json());
//   }
// }

/**
 * v2 placeholder: map a raw API response item to the plugin's `Offer`
 * shape. The mapping job is small if the API lines up with `Offer`,
 * larger if field names differ. Keep this function pure (no fetches,
 * no IO) so it's easy to unit-test against a fixture.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function parseApiOffer(_raw: unknown): Offer {
  // v2: implement once the API spec lands.
  throw new Error('parseApiOffer not implemented — v2 only.');
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function matchesQuery(offer: Offer, query: SearchQuery): boolean {
  const text = query.text?.trim().toLowerCase();
  if (text) {
    const hay = [
      offer.title,
      offer.location.city,
      offer.location.country,
      offer.location.neighborhood ?? '',
    ]
      .join(' ')
      .toLowerCase();
    if (!hay.includes(text)) return false;
  }
  const f = query.filters;
  if (f) {
    if (f.propertyType && offer.propertyType !== f.propertyType) return false;
    if (f.minRating && (!offer.rating || offer.rating.average < f.minRating)) return false;
    if (f.priceMax && offer.price.perNight > f.priceMax) return false;
    if (f.minGuests && offer.capacity.guests < f.minGuests) return false;
  }
  return true;
}

function sortOffers(offers: Offer[], key: SortKey | undefined): Offer[] {
  const a = [...offers];
  switch (key) {
    case 'priceAsc':
      a.sort((x, y) => x.price.perNight - y.price.perNight);
      break;
    case 'priceDesc':
      a.sort((x, y) => y.price.perNight - x.price.perNight);
      break;
    case 'ratingDesc':
      a.sort((x, y) => (y.rating?.average ?? 0) - (x.rating?.average ?? 0));
      break;
    case 'newest':
      a.sort((x, y) => {
        const xNew = x.badges.includes('new_listing') ? 1 : 0;
        const yNew = y.badges.includes('new_listing') ? 1 : 0;
        return yNew - xNew;
      });
      break;
    default:
      break;
  }
  return a;
}

/** The default source the plugin boots with. v2 will replace this
 *  with an ApiOffersSource constructed from a fetch URL + auth. */
export const defaultOffersSource: OffersSource = new JsonOffersSource(
  productsJson as unknown as Offer[],
);
