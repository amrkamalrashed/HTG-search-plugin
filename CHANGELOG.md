# Changelog — HomeDrop

All notable changes to the HomeDrop plugin will be documented in this file.
Dates are in ISO-8601 (YYYY-MM-DD).

## [Unreleased]

### 0.8.1 — 2026-04-25 — Rebrand polish + UX cleanup

- Every user-facing "HTG" / "HomeToGo cards" string in main thread
  notifies + container node names + the ⌘K Find-all command label
  now reads "HomeDrop". Plugin-data keys (`htgOfferId` etc.) stay
  unchanged so cards inserted before the rebrand still round-trip.
- ⭐ Favourites filter chip in FilterBar with a count badge.
  Disabled with a tooltip when no tiles are starred.
- Toast moved from `bottom: 16px` to `60px` so it sits clear of the
  Drop button.
- DropTargetBanner sub-line now describes what will land
  ("3 properties will land here as a grid" / "Populate matching
  #fields with the selected property" / etc.) rather than printing
  the frame's id fragment.

### 0.8.0 — 2026-04-25 — Data layer moves to the UI thread (v2-ready)

The catalogue used to load on the main thread (which works for the
bundled PoC JSON but doesn't for a real API — the QuickJS sandbox
has limited networking). This release moves the seam to the right
place so the v2 API swap is a one-line change.

- New `src/ui/offers-source.ts` exporting `OffersSource`,
  `SearchQuery`, `JsonOffersSource`, and a `parseApiOffer` /
  `ApiOffersSource` placeholder.
- `OffersSource.search(query)` takes locale + text + filters + sort
  + limit + cursor — the same query shape a real API would expect.
  Today's `JsonOffersSource` runs that locally; v2's
  `ApiOffersSource` will forward it as query parameters.
- `LoadedPayload` no longer ships `offers`. Main boots with just
  saved state + size; UI fetches the catalogue itself.
- New `SYNC_OFFERS` channel (UI → main) so main keeps a cache for
  Refresh / DROP / native-drop offer-by-id lookups.
- App.tsx gets loading + error states. While the source is fetching,
  the grid renders 6 skeleton tiles with a dark-mode-aware shimmer.
  On error, an empty-state with a Retry button bumps a tick that
  re-triggers the effect.
- `localize()` and the `i18n` block on `Offer` stay for now — the
  PoC JSON still uses them — but they get a `// v2: delete` comment.
  When the API returns locale-specific data directly, these go away.

### 0.7.2 — 2026-04-25 — Spec alignment pass

Cleanup pass to bring the v0.7 surface in line with the spec wording
and to fix the locked card height. No user-facing behaviour
regressions; mostly renames + one geometry fix + native drop.

- **Renames** (wire names unchanged for back-compat):
  `ThemeMode` → `Theme`, `Preset` → `UiPreset` (`name` → `label`),
  `HighlightOfferHandler` → `HighlightHandler`,
  `InsertResultHandler` → `InsertedHandler` (`InsertResultPayload`
  → `ToastMessage`, `nodeIds` → `createdNodeIds`),
  `SelectionTargetInfo` → `SelectionTarget` (payload now
  `{ target: SelectionTarget | null }`).
- **`fillIntoTarget` signature**: `(target, child, { replaceContents })`
  rather than `(target, child, replace)`.
- **Confetti** moved out of the React tree to a top-level
  `src/ui/confetti.ts` exporting `runConfetti()`.
- **`PresetsMenu.tsx`** added — a header dropdown listing every saved
  preset with apply / delete actions.
- **Card height fix**: web cards no longer lock at 320 px. The
  `minHeight` was removed and the actions column now uses
  `primaryAxisSizingMode = 'AUTO'` with `layoutAlign = 'STRETCH'`,
  so the card hugs to the content column's natural height while
  the right pillar still stretches to fill.
- **Native `figma.on('drop')`** with three MIME types
  (`application/htg-offer`, `-multi`, `-section`). The UI tile sets
  the matching MIME data on `dragstart`. The legacy emit-based
  `DROP` channel stays for the click-CTA path.
- **Behaviour fixes**:
  - Cmd / Ctrl-click now additively toggles selection without moving
    the anchor (plain click still moves the anchor; shift-click still
    extends).
  - `LOCALES` flag emojis swapped from regional-indicator pairs to
    plain text codes (EN / DE / ES / FR) — fixes the "doubled-flag"
    bug some emoji fonts render.
  - Platform label "iPhone" → "iOS".
  - Randomize button moved out of the header and into SortBar.
  - New Header **Find all** button emits `FIND_ALL`.
  - Section corner radii on mobile: iOS 16, Android 12 (were both 0).
  - Primary CTA reads "Drop / Drop N / Drop as list / Drop as grid"
    matching the plugin name.
- **Docs**: CLAUDE.md gets a Message channels table and an
  Interaction model section. ARCHITECTURE.md adds a `figma.on(...)`
  table. LAYER_NAMING_SPEC.md adds "How populate fires" (4 triggers).
  SCOPE.md success criteria expanded from 5 to 12 bullets.

### 0.7.1 — 2026-04-25 — Rebrand to HomeDrop

The plugin is now called **HomeDrop** end-to-end. HomeToGo remains the data
brand; only the wrapper that places it changed.

- `package.json` plugin id and name → `homedrop-plugin` / `HomeDrop`.
- Header wordmark simplified to "HomeDrop" (the HomeToGo logo was redundant
  next to the listing data it stamps onto every card).
- All `htg*` plugin-data keys are unchanged so previously inserted cards
  still round-trip through Refresh.

### 0.7.0 — 2026-04-25 — UX polish: multi-select, palette, canvas awareness, drop-into-frame

Four sub-chunks landed in their own commits.

**Chunk 1 — Selection + drag**
- Shift / cmd multi-select with last-anchor range. Cmd-click toggles a
  tile and sets the anchor; shift-click selects the visible-list range
  from the anchor.
- Persistent favourites (★) on every tile. Stored in clientStorage with
  the rest of `UiState` (`favourites: string[]`).
- Custom drag-image preview. We snapshot a small 220 px hover card with
  hero photo + title + price via `setDragImage`, replacing the browser's
  default full-tile bitmap.
- Hover-peek side panel after 450 ms tile hover. Auto-flips to the left
  when there isn't room on the right.
- `NumberTicker` — RAF-animated tween component used for the result
  count in `SortBar` so it eases between values rather than snapping.

**Chunk 2 — Toast + palette + presets + confetti**
- Bottom Toast with 5 s timeout + Undo button. The Undo button appears
  whenever the latest `INSERT_RESULT` carried node ids; clicking it
  emits `UNDO` and the main thread removes those nodes.
- ⌘K command palette with fuzzy substring matching. Commands: Drop,
  Random, Refresh, Find all, mode/platform/locale/theme switching,
  Save preset, Apply preset (one entry per saved preset).
- Saved presets capture `mode + platform + locale + gridColumns + sort`
  under a user-supplied name. Persisted in clientStorage UiState.
- Confetti burst on the first successful drop per session.

**Chunk 3 — Canvas ↔ plugin awareness**
- New `HIGHLIGHT_OFFER` channel (main → UI). Pulses the matching tile
  when a tagged HTG card is selected on the canvas.
- New `SELECTION_TARGET` channel (main → UI). Surfaces the currently
  selected non-HTG frame so the UI can show a "Drop into 'X'" banner.
- New `UNDO` channel (UI → main). Removes nodes from the most recent
  toast.
- New `FIND_ALL` channel (UI → main). Selects every HTG-tagged frame
  on the current page and zooms to fit.
- Drag-onto-frame triggers `populate` when the frame has `#fieldName`
  children (already plumbed in chunks 3 and 4 of the main router).

**Chunk 4 — Drop INTO selected frame**
- `DropTargetBanner` with a Replace toggle. Renders above the search bar
  whenever a non-HTG frame is selected.
- `fillIntoTarget` helper appends the new card as a child of the target,
  optionally clearing existing children when Replace is on.
- `resolveDropTarget` picks one of `populate | fill | viewport` based on
  selection + `#fieldName` presence.

### 0.6.0 — 2026-04-25 — UX polish wave one

- Randomize button (header) + R keyboard shortcut. Pulls from the
  currently filtered/sorted list.
- Drag tiles onto the canvas to drop a card directly. UI emits the new
  `DROP` message; main routes the drop based on the current selection.
- Dark mode (Auto / Light / Dark). Auto follows Figma's `html.figma-dark`
  class; Light and Dark force the theme via `html[data-theme]`.
- Sticky breadcrumb in the detail view so the back button stays
  reachable while scrolling long section grids.
- Resizable plugin window. Bottom-right corner handle live-resizes via
  the new `RESIZE` message and persists the final size via
  `SAVE_UI_SIZE` → clientStorage `htgUiSize`. Min 360×480, max 900×1200.

### 0.5.0 — 2026-04-23 — Full mobile detail page (12 sections, platform-aware)

Inspired by the iOS details-scroll frame supplied in Figma. Expands
Phase A from 4 sections to 12 and makes every section builder
platform-aware so iOS and Android use mobile layouts while Web keeps
the existing card treatment.

**New sections** (each built as its own module under `src/main/sections/`):
- `titleHeader` — badges row + title + rating line + location + hero
  price (with strike-through original when discounted).
- `quickFacts` — 2-column icon+label grid (bedrooms / beds / bathrooms /
  guests / kitchen / Wi-Fi / pet-friendly / parking — adaptive to the
  offer's amenities).
- `reasonsToBook` — 3 rounded icon tiles + title + description list.
- `roomInformation` — one rounded card per room with bed-type details
  and an outlined **See all rooms** button.
- `description` — paragraph + bullet highlights + violet **See more** link.
- `houseRules` — icon + rule list (coral tint on disallowed items).
- `location` — static-map tile + centred violet pin + address block.
- `cancellationPolicy` — stacked refund-tier cards with a colored left
  rail (green 100% → violet 50% → coral 0%).

**Refined sections**
- `gallery` — web keeps 880×420 hero + 2×2 thumbs side-by-side; mobile
  stacks hero 375×280 with a 2×2 thumb grid beneath.
- `reviews` — overall score now shows a verdict label ("Outstanding" /
  "Excellent" / "Good") alongside. Mobile stacks sub-ratings below
  the overall block and stacks review cards vertically.
- `amenities` + `priceBreakdown` — accept `Platform`, reflow inner
  widths + paddings to match iOS/Android metrics.

**Platform-aware section metrics** (`src/main/sections/common.ts`):
- web: 880 wide, 24 px padding, 16 px radius, 1 px stroke
- ios: 375 wide, 20 px padding, edge-to-edge (no radius, no stroke)
- android: 360 wide, 20 px padding, edge-to-edge

**Data model additions**
- `Offer.rooms` — rooms array for `roomInformation`
- `Offer.reasonsToBook` — reasons for the homonymous section
- `Offer.houseRules` — rules (with `allowed` flag for red/green tint)
- `Offer.address` — postal address for `location`
- `Offer.mapImageUrl` — optional static-map URL
- `Offer.cancellationPolicy` — refund tiers

Seeded fully on the 3 enriched offers (Berlin apartment, Mallorca villa,
Amsterdam capsule hotel). The other 7 offers fall back to sensible
defaults (generic reasons, derived rooms from capacity, default rules).

**Locale expansion**
- New string keys for section headings + verdict labels +
  "Quick facts", "Reasons to book", "Room information",
  "See all rooms", "See more", "House rules", "Location",
  "Address", "Cancellation policy", "Outstanding" / "Excellent" /
  "Good", "/ night" (hero) — in EN/DE/ES/FR.

**UI**
- Detail view section grid now lists all 12 sections. Each tile
  still shows adaptively — disabled if the offer has no data
  (e.g. Reviews is disabled for offers without `reviewDetails`).
- Select-all now only selects sections that actually have data.

**New icons**
- `pin`, `check`, `heartFilled` — added earlier in v0.4, now used
  across multiple sections.

### 0.4.0 — 2026-04-23 — iOS SERP card redesign + Android variant

**Changed — iOS card**

Rewritten to match the HomeToGo native-app SERP frame (provided as a
Figma screenshot). The horizontal-mobile layout from v0.3 is gone;
the new layout mirrors what the designer supplied:

- **Dimensions** 375×560 (was 375×420). Corner radius stays 16.
- **Image area** 375×280 at the top, edge-to-edge under the rounded
  card corners (clipsContent true).
- **Date badge** ("2 Aug - 21 Aug") — a new rounded pill at top-left
  of the image, 92% white. Bound to the new optional
  `offer.travelDatesLabel`; omitted when absent.
- **Heart button** — 40×40 circular white pill top-right, with its
  own subtle drop shadow.
- **Meta line** above the title: "{area} m² {type} · N bedroom · N guests"
  (area optional — reads from new `offer.areaSqm`). Replaces the
  v0.3 category-only label.
- **Title** — 20 / Bold, 2 lines max via Figma auto-layout text-auto-height.
- **Rating** — 5 graphical stars (purple) + "4.8/5 (304)" text. Replaces
  the single-star + number layout.
- **Location** — pin icon + "{neighborhood}, {city}" (or "{city}, {country}"
  if no neighborhood). New `pin` SVG in `src/main/icons.ts`.
- **Price** — bold **total** + light "total" suffix (Figma locale-formatted,
  e.g. `€5.000.000`). Replaces the per-night + CTA row.
- **Compare row** — divider above; "Compare" label + 22×22 outlined
  checkbox on the right. Replaces the gradient "View deal" button.
- Discount pill now renders as a coral rounded rectangle at the
  **bottom-left** of the image (adaptive — only when `offer.discount` is set).

**Added — Android variant**

Derived from the iOS SERP design, adjusted for Material 3 conventions:

- **Corner radius** 12 (was iOS 16).
- **No stroke** — Material 3 surfaces use elevation instead.
- **Stronger shadow** (alpha 0.14, 18px blur, 4px y-offset).
- **Checkbox** 2px radius (near-square, Material 3 shape).
- All other structure (image, date badge, heart, meta, stars, pin,
  total, compare row) identical to iOS so HTG keeps cross-platform
  parity.

**Added — data model**

- `Offer.travelDatesLabel?: string` — renders the top-left date pill.
  Seeded across all 10 offers with varied destination-appropriate
  dates (Berlin in March, Mallorca in August, etc.).
- `Offer.areaSqm?: number` — surfaces in the mobile meta line as
  "{area} m² {type}". Seeded across all 10 offers.

**Added — icons**

- `pin` — 14px map pin, used in the location row.
- `check` — 14px checkmark, reserved for the checked-checkbox state.
- `heartFilled` — filled heart variant, reserved for favourited state.

**Upcoming**

- The **Details Scroll** iOS frame is pending — when supplied the
  Phase A detail sections (`gallery`, `amenities`, `reviews`,
  `priceBreakdown`) will be re-pitched to match.

### 0.3.0 — 2026-04-23 — Locale, platform, Phase A detail sections

**Added**
- **Locale support** — English, German, Spanish, French.
  - New `src/shared/locales.ts` with a strings table (`STRINGS[locale][key]`)
    covering card labels ("View deal", "Promoted by", "for N nights",
    "New listing", "Last-minute deal", "km to center", "reviews") plus
    section headings and property-type labels.
  - `formatPrice(amount, currency, locale)` is now locale-aware:
    `de-DE` → `€1.234`, `en-GB` → `£1,234`, `es-ES` / `fr-FR` → `1.234 €`.
  - Layer-name populate path accepts a `locale` arg so designers get
    correctly-localised strings when populating their own components.
- **Platform variants** — Web, iPhone, Android.
  - New `src/shared/platforms.ts` defines `Platform` + `PLATFORM_SPEC`
    (card dimensions, radii, shadows, font sizes per platform).
  - Web: existing horizontal 880×320 card.
  - iPhone: vertical 375-wide card, image top, rounded 12px radii,
    subtle shadow (iOS-style).
  - Android: vertical 360-wide card, 8px radii, stronger elevation,
    no stroke (Material-style).
- **Two-level navigation** in the plugin UI:
  - Level 1: property search (existing).
  - Level 2: property detail. Each tile gets an "→" button that opens
    a Detail view — breadcrumb, hero, section-selection grid, insert
    button. A single "Open details →" button is also added to the
    preview modal.
- **Phase A detail sections (Level 2 insert)** — `src/main/sections/`:
  - `gallery.ts` — hero + 2×2 thumbnail grid + "Show all N photos" pill.
  - `amenities.ts` — icon + label list grouped by category (Internet &
    TV, Kitchen, Outdoor, Heating & cooling, …) with i18n category
    labels. "Show all N amenities" outlined button below.
  - `reviews.ts` — overall score + sub-rating bars (Cleanliness,
    Location, Value, Communication) with gradient fills + 3 review
    cards (avatar, name, date, stars, body).
  - `priceBreakdown.ts` — line items (€128 × 7 nights, cleaning, service
    fee, taxes), divider, total, gradient "View deal" CTA.
  - Each section stamps `setPluginData('htgSectionKind', …)` so the
    Refresh button re-renders sections too.
- **Level-2 insert** assembles selected sections in a single
  "HTG Detail · {offer}" vertical auto-layout container at the viewport
  centre — effectively rebuilds the full rental page in one click.
- **Enriched mock data** for 3 offers (Berlin apartment, Mallorca villa,
  Amsterdam boutique hotel): 5–6 images each, `fullDescription`,
  `highlights`, `amenitiesByCategory`, `reviewDetails` (overall +
  sub-ratings + 3 review items), and `priceBreakdown`. The other 7
  offers stay lean on purpose to cover the "missing data" path.

**Changed**
- `Offer` type now includes optional `fullDescription`, `highlights`,
  `amenitiesByCategory`, `reviewDetails`, `priceBreakdown`, plus a
  new `hotel` property type and an `AmenityCategory` union.
- `InsertPayload` is now a discriminated union (`kind: 'cards'` vs
  `kind: 'sections'`); old call sites updated.
- `UiState` now carries `locale` and `platform` so they persist across
  plugin opens via `figma.clientStorage`.
- Plugin UI gets a new **LocaleBar** row under the header: 4-way
  locale pills (EN/DE/ES/FR) + 3-way platform pills (Web/iPhone/Android).
- `ProductTile` now has two hover actions (`i` for preview, `→` for
  open-details).
- `PreviewModal` footer now has **Open details →** alongside
  **Insert card**.

**Infra / DX**
- Refresh command preserves `locale`, `platform`, and `sectionKind`
  from the stamped `setPluginData` on re-render, so updating
  `products.json` + running `npm run build` + clicking Refresh in
  Figma updates every kind of inserted artifact — card, list, grid,
  detail section, or full detail page.

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
