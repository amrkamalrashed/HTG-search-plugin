# Changelog

All notable changes to this plugin will be documented in this file. Dates are
in ISO-8601 (YYYY-MM-DD).

## [Unreleased]

### 0.2.0 — 2026-04-23 — UX polish batch

**Fixed**
- Grid mode container now correctly hugs its content height. Root cause:
  `counterAxisSizingMode = 'AUTO'` was being set before children were
  appended and the subsequent `resize()` pinned the height to 1px.
  Fix: use `resizeWithoutConstraints`, append children, then re-assign
  `counterAxisSizingMode = 'AUTO'` to force a recompute.
- Manifest `menu` block removed (single-entry plugins don't need one).

**Added**
- **Refresh button** in the plugin header (⟳ icon). Finds any previously
  inserted HomeToGo cards in the current canvas selection (detected via
  `setPluginData('htgOfferId', …)`), looks up the offer by id, and
  re-renders from the current JSON. Toast reports how many were refreshed.
  This is the seam that v2 will use to pull fresh prices from the real API.
- **Sort dropdown** (Recommended / Price ↑ / Price ↓ / Top rated /
  New listings) in a new `SortBar` row beneath the filter chips.
- **Variable grid columns**: 2/3/4 stepper appears in the sort bar when
  Grid mode is active. Sent as `gridColumns` in the INSERT payload; the
  canvas container resizes accordingly.
- **clientStorage persistence** for UI state — search, filters, sort,
  mode, and grid-column count all survive plugin reopens. Debounced
  250ms to avoid spamming the bridge.
- **Keyboard shortcuts**:
  - <kbd>Enter</kbd> — insert (when something is selected and you're not
    typing in the search box)
  - <kbd>Esc</kbd> — close the preview modal, or clear the selection
  - <kbd>⌘A</kbd> / <kbd>Ctrl+A</kbd> — select all visible (List / Grid
    modes only)
- **"Clear" button** in the bulk-selection bar next to "Select all N",
  matching the symmetry the user asked for. Both buttons are disabled
  when their action would be a no-op.
- **Empty-state redesign**: friendly icon + title + subtitle + "Clear all
  filters" button when filters or search are active.
- **Locale-aware price formatting** (`src/shared/format.ts`): EUR uses
  `de-DE` grouping (€1.234), GBP uses `en-GB` (£1,234), USD uses
  `en-US` ($1,234). Used by both the canvas card builder and the plugin
  UI (tiles, preview modal) so they stay in sync.
- **HTG-style wordmark** in the plugin header: rounded-house glyph with
  the primary purple→magenta gradient, and a "Home**to**Go" wordmark
  with gradient accent on "to".
- **GitHub Action** (`.github/workflows/build.yml`) — on push to
  `main` or the working branch, runs `npm ci && npm run build` and
  commits the fresh `manifest.json` + `build/` back (tagged
  `[skip ci]` to prevent loops) and uploads a workflow artifact so
  teammates can download the bundle without running Node.

**Changed**
- `Offer` type unchanged; new shared type `UiState` + `UiFilters`
  describes the persisted UI state shape.
- `InsertPayload` now carries `gridColumns` so the main thread knows
  how many columns to wrap at.
- `ProductTile` and `PreviewModal` now use the shared `formatPrice`
  helper so currency rendering stays consistent with the canvas card.

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
