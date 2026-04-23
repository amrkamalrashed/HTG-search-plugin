# Changelog

All notable changes to this plugin will be documented in this file. Dates are
in ISO-8601 (YYYY-MM-DD).

## [Unreleased]

### 0.1.0 — 2026-04-23 — PoC scaffold

**Added**
- TypeScript + `create-figma-plugin` + Preact scaffold under `src/`, replacing
  the single-file `code.js` / `ui.html` skeleton.
- `Offer` data model (`src/shared/types.ts`) covering title, category label,
  location (with neighbourhood + distance-to-centre), images, price, optional
  discount (with label), rating, capacity, amenities, badges, provider,
  cancellation, URL, description.
- Mock data source `src/data/products.json` with 10 offers across 9 countries,
  including edge cases: no discount, no rating, German umlauts, very long
  titles, hotel vs house vs villa, varying amenity sets.
- Adaptive card generator (`src/main/generate.ts`) that matches the HomeToGo
  search-result card: horizontal layout with image panel (fullscreen button +
  pagination dots), content column (category label, title, distance +
  neighbourhood, amenity icons, purple-star rating, "Promoted by"), and
  actions column (share/heart icons, optional discount pill, strikethrough
  original price, big price, "for N nights, incl. fees", purple→pink gradient
  "View deal" button). Skips sections the offer doesn't have.
- `src/main/icons.ts`: 16 inline-SVG icons (share, heart, fullscreen, wifi,
  snowflake/AC, pets, smoking, parking, bed, TV, kitchen, hair-dryer,
  breakfast, heating, elevator, pool, cleaning).
- Three insert modes:
  - **Single** — one card at viewport centre.
  - **List** — N cards in a vertical auto-layout container.
  - **Grid** — N cards in a 2-column auto-layout wrap container.
- Hybrid insertion: when a user has a frame/component selected that contains
  `#fieldName` layers, we populate those in place (`src/main/populate.ts`)
  instead of creating a new card.
- Layer-naming spec (`src/shared/layer-names.ts` + `docs/LAYER_NAMING_SPEC.md`):
  `#title`, `#categoryLabel`, `#location`, `#pricePerNight`, `#priceOriginal`,
  `#discountLabel`, `#ratingAverage`, `#ratingCount`, `#providerLine`,
  `#image`, `#imageSecondary`, etc. Case- and punctuation-insensitive match.
- Preact plugin UI styled to match HomeToGo (`src/ui/`): header with logo and
  Single/List/Grid mode toggle, search box, filter chip bar (price ceilings,
  min rating, min guests, property types), 2-column grid of product tiles with
  purple-gradient "selected" state, bulk-selection bar in list/grid modes, and
  a bottom-sheet preview modal with full offer details and a primary-CTA
  **Insert into canvas** button.
- Documentation set: `CLAUDE.md`, `docs/SCOPE.md`, `docs/ARCHITECTURE.md`,
  `docs/DATA_MODEL.md`, `docs/LAYER_NAMING_SPEC.md`, `docs/DEVELOPMENT.md`,
  `docs/BRAND.md`.
- `setPluginData('htgOfferId', ...)` stamped on every inserted root so v2 can
  reconnect inserted cards back to the API-sourced offer.

**Removed**
- Original `code.js`, `ui.html`, and hand-written `manifest.json` skeleton
  (room-card populator with bedroom / bathroom / complex / long cases). The
  `#layerName` pattern from that skeleton is preserved in the new populate
  path; the UI has been rebuilt as the Preact browse experience.

### Future — v2 (not started)

- Replace `productsJson` import with a `fetch` to the internal HTG search API
  (needs auth + CORS-enabling proxy or server-side allowance for the Figma
  iframe origin).
- Pull the real HTG product-card component from a published team library via
  `figma.importComponentByKeyAsync(key)` once HTG publishes one. The layer-name
  populate path is designed to work against it directly.
- Add `figma.clientStorage` persistence for last search, last filters, and the
  user's preferred insert mode.
- Re-sync inserted cards from `setPluginData.htgOfferId` ("refresh the prices
  on my last mockup").
- Swap PoC icons for the production HTG icon set.
- Pagination / lazy-loading once the grid can hold hundreds of offers.
