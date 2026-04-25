# Architecture

## Two threads, one bridge

Figma plugins run code in two sandboxed contexts:

| Thread | Runtime | Can… | Cannot… |
|--------|---------|------|---------|
| **Main** (`src/main/*`) | QuickJS sandbox | Call `figma.*`, create/edit nodes | Touch the DOM, use `fetch` freely |
| **UI** (`src/ui/*`) | iframe (browser) | Use Preact, DOM, `fetch`, images | Touch the scene graph |

They talk via `postMessage`, wrapped here by `emit` / `on` from
`@create-figma-plugin/utilities` for type-safety.

```
┌──────────────── Figma desktop / web ────────────────┐
│                                                     │
│  ┌───────────────┐          ┌───────────────┐       │
│  │  UI (iframe)  │          │   Main        │       │
│  │  Preact app   │   emit   │   QuickJS     │       │
│  │  styles.css   │────────▶│   figma.*      │       │
│  │  ProductTile  │◀──── on  │   buildCard    │       │
│  │  PreviewModal │          │   populate     │       │
│  └───────────────┘          └───────────────┘       │
│          ▲                         │                │
│          │                         ▼                │
│          │                  scene graph nodes       │
│          │                                          │
└──────────┼──────────────────────────────────────────┘
           │
    products.json (bundled at build time via esbuild)
```

## File structure

```
src/
├── main/                  # main-thread (QuickJS)
│   ├── index.ts           # entry — showUI + message router
│   ├── generate.ts        # platform-aware card builder (web + iOS + Android)
│   ├── populate.ts        # #fieldName layer populator (locale-aware)
│   ├── brand.ts           # BRAND, FONT, VIEW_DEAL_GRADIENT tokens
│   ├── icons.ts           # inline SVGs + placeIcon()
│   ├── images.ts          # loadImageHash, applyImageFill
│   ├── fonts.ts           # loadBrandFonts (parallel + memoised)
│   └── sections/          # Phase A detail-page section builders
│       ├── index.ts       # buildSection(kind, offer, locale)
│       ├── common.ts      # sectionFrame/heading helpers
│       ├── gallery.ts
│       ├── amenities.ts
│       ├── reviews.ts
│       └── priceBreakdown.ts
├── ui/                    # iframe (real browser, owns fetch)
│   ├── index.tsx          # render(App)
│   ├── App.tsx            # state machine (Level 1 + Level 2), emits INSERT
│   ├── offers-source.ts   # OffersSource + JsonOffersSource + parseApiOffer (v2)
│   ├── confetti.ts        # imperative runConfetti() (no React tree)
│   ├── theme.ts           # applyTheme() + isDark()
│   ├── dragImage.ts       # custom setDragImage() ghost factory
│   ├── styles.css         # CSS Modules, HomeDrop tokens as custom properties
│   └── components/
│       ├── Header.tsx     # logo + Single/List/Grid toggle + refresh btn
│       ├── LocaleBar.tsx  # locale + platform pills
│       ├── SearchBar.tsx
│       ├── FilterBar.tsx
│       ├── SortBar.tsx    # result count + sort dropdown + grid-col stepper
│       ├── ProductTile.tsx # card thumbnail + preview/open buttons
│       ├── PreviewModal.tsx # bottom-sheet detail view
│       └── DetailView.tsx # Level 2 — section-selection grid
├── shared/                # imported by both threads
│   ├── types.ts           # Offer + enums + ReviewDetails + PriceBreakdown
│   ├── messages.ts        # Insert*Payload, UiState, Section kinds
│   ├── locales.ts         # Locale, STRINGS table, t() helper
│   ├── platforms.ts       # Platform + PLATFORM_SPEC per platform
│   ├── format.ts          # formatPrice(amount, currency, locale)
│   └── layer-names.ts     # LAYER_KEYS, textForKey(offer, locale)
└── data/
    └── products.json      # 10 offers; 3 enriched with detail-page data
```

## Bundling

`create-figma-plugin` wraps esbuild. `package.json → "figma-plugin"` is the
source of truth; the CLI generates `manifest.json`, `build/main.js`, and `build/ui.js`
from it.

- Import aliases (`@shared/*`, `@data/*`) are resolved by both TypeScript
  (`tsconfig.json`) and the bundler (inferred from `baseUrl` + `paths`).
- CSS is treated as CSS Modules (`import styles from './styles.css'`).
- `products.json` is inlined at build time (`resolveJsonModule: true`).
- `documentAccess: "dynamic-page"` ensures we use the `Async` node APIs.

## Message flow

```
1. Plugin opens
   main: showUI({ width, height }, { offers })
   → UI receives offers via App(props)

2. User clicks a product tile → sets selectedIds
   User clicks Insert
   UI: emit<InsertMessage>('INSERT', { offers, mode })

3. Main receives INSERT:
   - If mode === 'single' AND exactly 1 offer AND selection is a
     Frame/Component/Instance/Group → try populateSelection first.
   - Otherwise call insertCards(offers, mode):
     - single → append each card to page at viewport centre
     - list   → vertical auto-layout container of cards
     - grid   → horizontal wrap auto-layout container of cards
   - Stamp setPluginData('htgOfferId', offer.id) on every root for later
     re-sync.
   - figma.viewport.scrollAndZoomIntoView + figma.notify

4. Main emits `INSERT_RESULT` back to the UI with the top-level node ids
   so the UI can show a Toast with an Undo button.
```

### Figma events (main thread)

Two `figma.on(...)` listeners drive the plugin's reaction to canvas
state, alongside the explicit `emit/on` channels:

| Event             | Fired by Figma when…                              | Side-effects                                                                                                         |
|-------------------|---------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `selectionchange` | Any selection mutation on the current page        | Calls `pushHighlight()` (emits `HIGHLIGHT_OFFER`) and `pushSelectionTarget()` (emits `SELECTION_TARGET`).             |
| `drop`            | The user releases a drag from the plugin iframe   | Reads `event.items` for the three MIME types (`application/htg-offer`, `-multi`, `-section`) and dispatches the build. Returns `false` so Figma doesn't insert its own text node. |

### v0.6 / v0.7 message channels

The plugin now has a richer two-way message bus. Every channel is
typed in `src/shared/messages.ts` and consumed via `emit/on`:

| Channel | Direction | Payload | Purpose |
|---------|-----------|---------|---------|
| `INSERT` | UI → main | `InsertCardsPayload \| InsertSectionsPayload` | Existing card/section insert |
| `DROP` | UI → main | `DropPayload` (offerId, coords, replaceOnDrop) | Tile dropped on canvas |
| `UNDO` | UI → main | `{ nodeIds: string[] }` | Toast Undo button |
| `FIND_ALL` | UI → main | — | Select every HomeDrop-tagged node on the page |
| `REFRESH` | UI → main | — | Re-render selected HomeDrop cards |
| `RESIZE` | UI → main | `UiSize` | Live resize while dragging the handle |
| `SAVE_STATE` | UI → main | `UiState` | Persist UI state to clientStorage |
| `SAVE_UI_SIZE` | UI → main | `UiSize` | Persist final size on resize commit |
| `INSERT_RESULT` | main → UI | `InsertResultPayload` | Toast message + Undo node ids |
| `HIGHLIGHT_OFFER` | main → UI | `{ offerId: string \| null }` | Pulse a tile when its card is selected |
| `SELECTION_TARGET` | main → UI | `SelectionTargetInfo \| null` | Drive the Drop banner |

## Adaptive card

`buildCard(offer)` always produces a valid card, but drops sections the
offer doesn't populate:

| Condition | Effect |
|-----------|--------|
| `offer.rating` undefined | Rating row replaced with `New listing` label |
| `offer.discount` undefined | No "Last-minute deal" pill, no strikethrough price |
| `offer.amenities` has no mappable icons | Amenity icon row omitted |
| `offer.images.length < 2` | No pagination dots |
| `offer.location.neighborhood` undefined | Location line falls back to `City, Country` |
| `offer.location.distanceToCenterKm` undefined | No "X km to center" prefix |

This is implemented inline in `src/main/generate.ts` — no separate variants
needed, no "default" placeholder text.

## Two-level navigation + locale + platform

The plugin UI has two levels:

- **Level 1 — Search.** Browse, filter, sort, select N properties,
  insert as single card / list / grid. The `→` button on each tile
  (and the **Open details →** button in the preview modal) drills
  into Level 2.
- **Level 2 — Property detail.** Breadcrumb + hero strip + a
  4-section selection grid (Gallery, Amenities, Reviews, Price
  breakdown). Selected sections insert as one auto-layout container
  that rebuilds the full rental page.

Every card and section is rendered in the chosen **locale** (en / de /
es / fr — selected via the LocaleBar pills) and **platform**
(Web / iPhone / Android). Locale flows through to `formatPrice`,
category labels, amenity section headings, sub-rating labels, CTAs —
every visible string. Platform changes card dimensions, corner radii,
shadow strength, and (iOS vs Android) whether the card has a stroke.

Both choices are persisted via `figma.clientStorage` and re-applied
when the plugin reopens. Inserted nodes also stamp their locale and
platform via `setPluginData`, so the Refresh action can round-trip
them against the current data without losing presentation.

## Three insert modes

| Mode | Output | Auto-layout config |
|------|--------|--------------------|
| Single | Loose card(s) on page | none (card is itself vertical auto-layout) |
| List | Wrapper frame, padding 20, gap 16 | `layoutMode: VERTICAL, primaryAxis: AUTO` |
| Grid | Wrapper frame, 2 cols, gaps 16 | `layoutMode: HORIZONTAL, layoutWrap: WRAP, primaryAxis: FIXED` (width = 2×card + gap + padding) |

## Data layer (v0.8)

The catalogue lives behind the `OffersSource` interface in
`src/ui/offers-source.ts`:

```ts
interface OffersSource {
  search(query: SearchQuery): Promise<Offer[]>;
  getById(id: string, locale: Locale): Promise<Offer | null>;
}

interface SearchQuery {
  locale: Locale;
  text?: string;
  filters?: { propertyType?, minRating?, priceMax?, minGuests? };
  sort?: SortKey;
  limit?: number;
  cursor?: string;     // server-driven pagination, v2 only
}
```

The seam lives on the **UI thread**, not main, because the QuickJS
sandbox can't do real fetches — the iframe is where `fetch()` works.
`App.tsx` instantiates the source once and runs a `useEffect` that
calls `source.search(query)` whenever `locale | search | filters |
sort` changes. The result becomes `offers` state.

### Boot + sync flow

```
1. Plugin opens
   main: showUI({ width, height }, { savedState, uiSize })
   → UI receives savedState only — NOT the catalogue.

2. UI mounts. useEffect fires source.search({ locale, ... }).
   → Today: JsonOffersSource resolves immediately.
   → v2:   ApiOffersSource calls fetch(); skeleton tiles cover the wait.

3. UI receives offers. Two things happen:
   a. setOffers(...)   — the grid renders.
   b. emit<SyncOffersHandler>('SYNC_OFFERS', { offers, locale })
      → main caches them in OFFER_BY_ID for Refresh/DROP lookups.

4. User changes locale → step 2 re-runs with new query.locale.
   Server returns localized data; SYNC_OFFERS re-syncs the cache.

5. User clicks Refresh on selected canvas cards.
   main looks up offerId in its cache → rebuilds via buildCard.
   No round-trip back to the UI required.
```

### Loading + error UX

While `source.search()` is pending, the grid shows **6 skeleton
tiles** with an animated shimmer (dark-mode-aware). On rejection,
the empty-state shows the error message and a Retry button that
bumps a tick and re-runs the effect. Locale switches show the
loading state for as long as the new fetch takes.

### Why v2 is a one-line swap

Today's `App.tsx` is:

```ts
const [source] = useState<OffersSource>(() => defaultOffersSource);
```

v2 becomes:

```ts
const [source] = useState<OffersSource>(() => new ApiOffersSource(API_URL));
```

Plus deleting `localize()` and the `i18n` block on `Offer` (the API
returns localized data directly via `Accept-Language` / `?locale=de`).
The card renderer, populate path, locale selector, drop banner — all
unchanged.

## Drop routing (v0.7)

`handleDrop` in `src/main/index.ts` dispatches via `resolveDropTarget`:

```
selection has #fields  → populate (Replace toggle ignored)
selection w/o #fields  → fill    (Replace=on clears children first)
no selection           → viewport (drop at canvas coords)
```

`fillIntoTarget(target, child, replace)` in `src/main/populate.ts`
clears the target's existing children when `replace` is true and
appends the new card; otherwise it just appends. `hasFieldNames(target)`
short-circuits via `findOne` so it returns as soon as one matching
layer is found.

The UI surfaces the active drop target via the
[`DropTargetBanner`](../src/ui/components/DropTargetBanner.tsx)
component, which receives a `SelectionTargetInfo` from main on every
canvas selection change.

## Keeping v2 cheap

The contract that bridges PoC and v2:

- The `Offer` type lives in `src/shared/types.ts` and is the shape the UI
  and the generator both consume. v2 just swaps where the array of `Offer`
  comes from.
- In `src/main/index.ts` the current line `const OFFERS = productsJson as
  unknown as Offer[]` is the entire data source. v2 replaces that with a
  UI-thread `fetch` → `postMessage` → main-thread render.
- `setPluginData('htgOfferId', ...)` on every inserted root means v2 can
  find already-placed cards and refresh them against the live API.
- `networkAccess.allowedDomains` in `package.json` already lists the
  development-time CDN (Unsplash). Add the HTG API + CDN domains there for v2.
