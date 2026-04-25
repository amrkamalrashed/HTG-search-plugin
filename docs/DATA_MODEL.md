# Data model

`src/shared/types.ts` is the single source of truth. `src/data/products.json`
must round-trip through this type. The plugin never validates the JSON at
runtime — TypeScript checks it at build time because of `resolveJsonModule`.

## The `Offer` shape

```ts
interface Offer {
  id: string;                      // "offer_20394857"
  title: string;
  propertyType: PropertyType;      // 'apartment' | 'villa' | ... | 'hotel'
  categoryLabel?: string;          // "Apartment" | "1-star hotel" | ...

  location: {
    city: string;
    region?: string;
    country: string;
    countryCode: string;
    neighborhood?: string;
    distanceToCenterKm?: number;
    lat?: number;
    lng?: number;
  };

  images: Array<{ url: string; alt?: string }>;

  price: {
    perNight: number;
    total: number;
    currency: 'EUR' | 'USD' | 'GBP';
    nights: number;
  };

  discount?: {
    percent: number;
    originalPerNight: number;
    label?: string;
  };

  rating?: {
    average: number;
    count: number;
  };

  capacity: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
    beds: number;
  };

  amenities: Amenity[];
  amenitiesByCategory?: Partial<Record<AmenityCategory, Amenity[]>>;

  badges: Badge[];

  provider: {
    name: string;
    logoUrl?: string;
  };

  cancellation: 'free_until_7d' | 'free_until_24h' | 'non_refundable' | 'flexible';
  url: string;

  // Card
  shortDescription?: string;

  // Detail-page sections (optional — only on enriched offers)
  fullDescription?: string;
  highlights?: string[];
  reviewDetails?: ReviewDetails;
  priceBreakdown?: PriceBreakdown;
}

interface ReviewDetails {
  overall: number;
  count: number;
  subRatings: Partial<{
    cleanliness: number;
    location: number;
    value: number;
    communication: number;
  }>;
  items: Array<{
    author: string;
    date: string;
    rating: number;
    text: string;
    avatarUrl?: string;
  }>;
}

interface PriceBreakdown {
  lineItems: Array<{
    key: string;                 // 'perNight' | 'cleaning' | 'serviceFee' | 'taxes' | custom
    label?: string;
    amount: number;
    quantity?: number;
    quantityLabel?: string;      // "€128 × 7 nights"
  }>;
  total: number;
  currency: Currency;
}
```

## Enums

```ts
type PropertyType =
  | 'apartment' | 'house' | 'villa' | 'cabin' | 'chalet'
  | 'cottage' | 'studio' | 'penthouse' | 'castle' | 'bungalow' | 'hotel';

type Amenity =
  | 'wifi' | 'kitchen' | 'washer' | 'dryer' | 'parking' | 'pool'
  | 'hot_tub' | 'air_conditioning' | 'heating' | 'balcony' | 'terrace'
  | 'garden' | 'bbq' | 'fireplace' | 'sea_view' | 'mountain_view'
  | 'pets_allowed' | 'smoking_allowed' | 'wheelchair_accessible'
  | 'ev_charger' | 'tv' | 'hair_dryer' | 'elevator' | 'breakfast';

type AmenityCategory =
  | 'internet_tv'           // Wi-Fi, TV
  | 'kitchen'               // kitchen, kitchenware
  | 'bathroom'              // hair dryer, toiletries
  | 'bedroom'               // bed-linen, crib
  | 'outdoor'               // pool, bbq, terrace, sea view
  | 'cooling_heating'       // AC, heating
  | 'parking_accessibility' // parking, wheelchair access, EV charger
  | 'services'              // breakfast, washer, dryer
  | 'policies';             // pets, smoking

type Badge =
  | 'top_rated' | 'great_deal' | 'instant_book' | 'new_listing'
  | 'free_cancellation' | 'eco_friendly';
```

## Reference — HomeToGo offer fields observed on the site

The PoC shape mirrors what's visible on `hometogo.com/search/*`:

- **Identity**: title, category label ("Hotel", "1-star hotel", "Apartment"),
  property type.
- **Location**: distance to centre, city + neighbourhood.
- **Visual**: at least one image; cards show pagination dots when multiple.
- **Price**: per-night (prominent), "for N nights, incl. fees" suffix,
  strikethrough original when discounted. Currency as symbol.
- **Discount**: soft-coral pill "Last-minute deal: -N%".
- **Rating**: purple star, decimal average, parenthesised review count.
- **Amenity icons**: 6–8 line icons inline. Variable set per property.
- **Provider attribution**: "Promoted by <provider>".
- **CTA**: gradient **View deal** button.

All of these map 1:1 to fields on `Offer`. When the real API spec lands, any
extra fields should be added here first, then wired into `products.json` and
`src/main/generate.ts`.

## v2 transition: the `i18n` block goes away

The PoC's `Offer.i18n` block carries `de/es/fr` translations alongside the
English source so a single bundled JSON can serve all four locales without a
network call. `localize(offer, locale)` picks the right strings client-side.

**This is a PoC artifact**. v2 assumes the real API takes a locale parameter
(via `Accept-Language` or `?locale=de`) and returns data already in that
locale. When `ApiOffersSource` lands:

- `Offer.i18n` is deleted from the type.
- Every field on `Offer` is the locale-specific value directly.
- `src/shared/localize.ts` is deleted.
- `OffersSource.search({ locale, ... })` re-fetches whenever the user
  switches locale — that's already wired in `App.tsx`'s search effect.
- The `parseApiOffer(raw)` helper in `src/ui/offers-source.ts` becomes
  the single mapping layer between API response shape and `Offer`.

The card renderer, populate path, and layer-naming spec don't change. They
already consume a single-locale `Offer`; today's `localize()` just produces
that shape from the multi-locale JSON.

## Edge-case coverage in `products.json`

The 10 seed offers cover:

- **No discount, no "deal" pill**: `offer_20394857` (Berlin apartment).
- **Discount + last-minute deal pill + strikethrough price**: `offer_39104820`
  (Mallorca villa), `offer_55882019` (Paris penthouse), `offer_22057183`
  (Algarve villa).
- **No rating ("New listing" fallback)**: `offer_10283746` (Black Forest cabin).
- **High-review-count hotel matching the reference screenshot style**:
  `offer_88113025` (De Bedstee Boutique Capsules, Amsterdam).
- **Long title with German umlauts**: `offer_55882019` (Paris penthouse).
- **Non-EUR currency (GBP)**: `offer_90384726` (Scottish castle),
  `offer_66401298` (Cotswolds cottage).
- **1 image only (no pagination dots)**: several.
- **Varying amenity counts** (3 → 9): ensures the icon row grows/shrinks.
- **No neighbourhood** (falls back to "City, Country"): `offer_10283746`,
  `offer_48271056`.
- **Country coverage**: DE, ES, FR, NL, AT, GB, PT, GR.
