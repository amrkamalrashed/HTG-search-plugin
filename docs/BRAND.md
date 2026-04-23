# Brand — palette, typography, card anatomy

> Tokens here must be kept in sync with `src/main/brand.ts` (canvas) and
> `src/ui/styles.css` `:global(:root)` (plugin UI). Designers will replace
> the PoC palette with the final HomeToGo brand tokens before v2.

## Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Violet | `#6B42E8` | Primary CTA gradient (left stop), rating star, UI accents, selected-tile outline |
| Violet-dark | `#5A33D6` | CTA hover |
| Violet-soft | `#F2EDFF` | Selected-tile glow, bulk-bar background |
| Magenta | `#D149C5` | Primary CTA gradient (right stop) |
| Coral | `#FC4D5B` | Discount-pill text |
| Coral-soft | `#FFEEF0` | Discount-pill background |
| Text primary | `#0E1824` | Titles, prices |
| Text secondary | `#5B6B7E` | Location, amenities, suffixes |
| Text subtle | `#95A3B3` | "Promoted by" line |
| Border | `#E1E6EC` | Card outline, chip outline |
| Surface | `#F7F9FC` | List/Grid container background, image placeholder |
| Green (great deal) | `#22A06E` | Alternative badge tint |
| White | `#FFFFFF` | Card surface |

## Primary CTA gradient

```
linear-gradient(90deg, #6B42E8 0%, #D149C5 100%)
```

In Figma, built as a `GRADIENT_LINEAR` paint with two stops; see
`VIEW_DEAL_GRADIENT` in `src/main/brand.ts`.

## Typography

The card uses **Inter**:

- Category label — Medium 13
- Title — Bold 20
- Location — Regular 13
- Rating average — Bold 14
- Review count — Regular 13
- Provider line — Regular 12
- Price per night — Bold 28
- Price suffix — Regular 11
- Discount pill — Semi Bold 11
- CTA button — Bold 14

When HomeToGo provides its production brand font, replace the `FONT` record
in `src/main/brand.ts` and update `loadBrandFonts()`.

## Card anatomy (matches the reference screenshot)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ │
│ │                     │ │ Hotel                │ │  ⬈  ♡                │ │
│ │                     │ │ De Bedstee Boutique  │ │                      │ │
│ │                     │ │ Capsules             │ │                      │ │
│ │     hero image      │ │ 2.0 km · Oud-Zuid    │ │ ┌──────────────────┐ │ │
│ │                     │ │ ❄ 📶 🐾 🚭 🅿 🛏 🧹  │ │ │Last-minute: -10%│ │ │
│ │                     │ │                      │ │ └──────────────────┘ │ │
│ │                     │ │                      │ │        ‾€98          │ │
│ │               ⤢    │ │ ★ 4.1 (2,235 reviews)│ │         €89          │ │
│ │         ● ○ ○       │ │ Promoted by Booking  │ │  for 1 night, fees   │ │
│ │                     │ │                      │ │ [ View deal  🟪🟥 ]  │ │
│ └─────────────────────┘ └──────────────────────┘ └──────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

Sizes (from `CARD` in `src/main/brand.ts`):

- Width **880 px**, height **320 px**, corner radius **16**.
- Image panel **340 px** wide (full height).
- Actions column **200 px** wide.
- Content column fills the remaining space (~340 px) with 20 px padding.
- Drop shadow: `#0E1824 @ 6%, offset 0 / 2, blur 12`.

## Adaptive behaviour

The card renders only what the offer carries. What you'll see vary:

- **Discount pill** only when `offer.discount` is set.
- **Strikethrough original price** only when `offer.discount` is set.
- **Amenity icons** — only amenities that map to a known icon; up to 8 shown.
- **Rating row** — shows `New listing` if `offer.rating` is absent.
- **Pagination dots** — shown only when `offer.images.length > 1`.
- **Location line** — `"{distance} · {city} {neighbourhood}"` or
  `"{city}, {country}"` if either part is missing.
- **Category label** — `offer.categoryLabel` wins, falls back to a
  capitalised `propertyType`.

## Reference screenshots

The design targets are the live HomeToGo search-result cards, e.g.
<https://www.hometogo.com/search/53cf87469a10a?arrival=2026-04-23&duration=1>.
When HomeToGo's official Figma component lands, this document should be
amended with the component key (used via
`figma.importComponentByKeyAsync`) and a pointer to the design-system file.
