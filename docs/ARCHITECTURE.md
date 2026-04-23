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
│   ├── index.ts           # entry — showUI + message router (+ insertCards)
│   ├── generate.ts        # adaptive card builder (buildCard)
│   ├── populate.ts        # #fieldName layer populator
│   ├── brand.ts           # BRAND, FONT, CARD, VIEW_DEAL_GRADIENT tokens
│   ├── icons.ts           # inline SVGs + placeIcon()
│   ├── images.ts          # loadImageHash, applyImageFill
│   └── fonts.ts           # loadBrandFonts (parallel + memoised)
├── ui/                    # iframe
│   ├── index.tsx          # render(App)
│   ├── App.tsx            # state machine, emits INSERT
│   ├── styles.css         # CSS Modules, HTG tokens as custom properties
│   └── components/
│       ├── Header.tsx     # logo + Single/List/Grid toggle
│       ├── SearchBar.tsx  # free-text search
│       ├── FilterBar.tsx  # price / rating / guests / property-type chips
│       ├── ProductTile.tsx # card thumbnail + select/preview buttons
│       └── PreviewModal.tsx # bottom-sheet detail view
├── shared/                # imported by both threads
│   ├── types.ts           # Offer + enums
│   ├── messages.ts        # InsertMessage, LoadedMessage, InsertMode
│   └── layer-names.ts     # LAYER_KEYS, textForKey(), matchLayerKey()
└── data/
    └── products.json      # 10 seed offers
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

4. No response message back; toast + scroll are enough feedback for PoC.
```

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

## Three insert modes

| Mode | Output | Auto-layout config |
|------|--------|--------------------|
| Single | Loose card(s) on page | none (card is itself vertical auto-layout) |
| List | Wrapper frame, padding 20, gap 16 | `layoutMode: VERTICAL, primaryAxis: AUTO` |
| Grid | Wrapper frame, 2 cols, gaps 16 | `layoutMode: HORIZONTAL, layoutWrap: WRAP, primaryAxis: FIXED` (width = 2×card + gap + padding) |

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
