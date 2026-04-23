# Layer Naming Spec (for designers)

> This document is for HomeToGo designers who want the plugin to populate
> their own Figma components (not the generic card the plugin ships with).

When a designer selects a frame or component whose child layers follow the
convention below, the plugin's **Single** insert mode will override the
matching layers with offer data instead of creating a new card.

## Rule

Prefix the layer name with `#` and match one of the supported keys. The
match is **case-insensitive** and **ignores spaces / underscores / hyphens**:

- `#title`, `#Title`, `#TITLE` → all match `title`.
- `#pricePerNight`, `#price_per_night`, `#price-per-night` → all match
  `pricePerNight`.

## Supported keys

### Text layers

| Layer name | Gets set to (example) |
|------------|-----------------------|
| `#title` | `De Bedstee Boutique Capsules` |
| `#categoryLabel` | `Hotel` (falls back to capitalised propertyType) |
| `#location` | `2.0 km to center · Amsterdam Oud-Zuid` |
| `#neighborhood` | `Oud-Zuid` |
| `#distance` | `2.0 km to center` |
| `#city` | `Amsterdam` |
| `#country` | `Netherlands` |
| `#propertyType` | `Hotel` |
| `#pricePerNight` | `€81` |
| `#priceSuffix` | `for 1 night, incl. fees` |
| `#priceTotal` | `€896 total` |
| `#priceOriginal` | `€98` (for strikethrough treatment — set your own text decoration) |
| `#discountPercent` | `-10%` |
| `#discountLabel` | `Last-minute deal: -10%` |
| `#currency` | `EUR` |
| `#ratingAverage` | `4.1` |
| `#ratingCount` | `(2,235 reviews)` |
| `#ratingLine` | `★ 4.1 (2,235 reviews)` or `New listing` |
| `#guests` | `4 guests` |
| `#bedrooms` | `2 bedrooms` |
| `#bathrooms` | `1 bathrooms` |
| `#beds` | `3 beds` |
| `#amenities` | `wifi · kitchen · washer · balcony` (first 4) |
| `#badge` | `TOP RATED` |
| `#provider` | `Booking.com` |
| `#providerLine` | `Promoted by Booking.com` |
| `#cancellation` | `Free cancellation` |
| `#url` | `https://www.hometogo.com/offer/88113025` |
| `#description` | short description |

### Image layers

`#image` and `#imageSecondary` accept `RECTANGLE`, `FRAME`, or `ELLIPSE`
nodes and receive an image fill from `offer.images[0]` or `offer.images[1]`.
Sizing stays as you set it in the component — the image scales via
`scaleMode: 'FILL'`.

## Missing data

If the offer doesn't have a field (e.g. no `discount`), the matching layer
receives an **empty string** (for text) or is **left untouched** (for images).
To hide a layer entirely when empty, wrap it in an auto-layout frame and use
Figma's native "Hide when empty" toggle (or toggle visibility in your own
code / component properties — the plugin does not set `.visible`).

## Locale

When the plugin calls `populateSelection(frame, offer, locale)`, all
text keys resolve in the chosen locale:

| Locale | `#pricePerNight` | `#priceSuffix` | `#providerLine` | `#ratingLine` |
|--------|------------------|----------------|-----------------|---------------|
| en | `£128` / `€128` | `for 7 nights, incl. fees` | `Promoted by Vrbo` | `★ 4.7 (284 reviews)` |
| de | `€128` | `für 7 Nächte, inkl. Gebühren` | `Angeboten von Vrbo` | `★ 4.7 (284 Bewertungen)` |
| es | `128 €` | `por 7 noches, tasas incluidas` | `Ofrecido por Vrbo` | `★ 4.7 (284 opiniones)` |
| fr | `128 €` | `pour 7 nuits, frais inclus` | `Proposé par Vrbo` | `★ 4.7 (284 avis)` |

The locale is selected from the plugin UI's LocaleBar and stamped on
populated frames via `setPluginData('htgLocale', locale)` so the
Refresh action re-renders in the same language.

## Fallback — the plugin ships its own card

If you don't adopt the convention, `Single` mode with no matching selection
will still work: the plugin generates an HTG-styled card from scratch. Use
this for quick mockups; use the `#fieldName` convention once you have a
design-system component you want to stay in charge of.

## Example — minimum viable card

Create a frame named `HTG Card` containing:

- A `RECTANGLE` named `#image`
- A `TEXT` layer named `#categoryLabel`
- A `TEXT` layer named `#title`
- A `TEXT` layer named `#location`
- A `TEXT` layer named `#pricePerNight`

Select it, run the plugin, pick a property, click **Insert**. Done.
