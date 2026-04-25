# HomeDrop — Figma Plugin

HomeDrop is the HomeToGo design team's Figma plugin: drop real
vacation-rental product data straight into your designs in one click
(or one drag). Browse, filter, preview, and place a fully-populated
HomeToGo product card, list, or grid — without copy-pasting a single
title, price, or image.

> **Status:** Proof of concept. Today the catalogue is a bundled JSON
> file (`src/data/products.json`) consumed via `JsonOffersSource`. v2
> swaps in `ApiOffersSource` (one line in `src/ui/App.tsx`) so the
> plugin pulls live data from the HomeToGo search/product API. See
> [`docs/ARCHITECTURE.md#data-layer-v08`](docs/ARCHITECTURE.md).

---

## Quick start

```bash
npm install
npm run build      # produces build/main.js, build/ui.js, manifest.json
```

In Figma desktop:

1. **Plugins → Development → Import plugin from manifest…**
2. Pick the generated `manifest.json` at the repo root.
3. **Plugins → Development → HomeDrop**.

For iterative development:

```bash
npm run watch      # incremental rebuild on save
npm test           # run the Vitest suite once
```

---

## What HomeDrop does

The plugin places **discrete components**, never full screens — one
card, a list of cards, a grid of cards, or one-or-more detail-page
sections. Designers compose those outputs into their own screen
chrome (status bars, navigation, sticky CTAs).

### Three insert modes

| Mode | What lands |
|------|------------|
| **Single** | One card at the viewport centre — or, if you have a frame selected whose children use `#fieldName` layers, the plugin populates those layers in place rather than creating a new card. |
| **List** | N cards stacked in a vertical auto-layout frame. |
| **Grid** | N cards in a wrapping auto-layout frame (2 / 3 / 4 columns, your choice). |

### Two-level navigation

- **Level 1 — Search.** Browse, search, filter, sort, multi-select,
  drop. The default surface.
- **Level 2 — Property detail.** Click `→` on a tile to drill into
  one property. Pick any subset of 12 sections (Gallery, Title
  header, Quick facts, Reasons to book, Reviews, Amenities, Room
  information, Description, House rules, Location, Price breakdown,
  Cancellation policy) and drop them as one auto-layout container
  that rebuilds the full rental detail page.

### Locale + platform aware

Every card and section renders in the chosen **locale**
(`en` / `de` / `es` / `fr`) and **platform** (`web` / `iOS` /
`Android`). Locale drives prices, category labels, amenity headings,
sub-rating labels, CTAs — every visible string. Platform drives card
dimensions, corner radii, shadow strength, and (iOS vs Android)
whether the card has a stroke.

Both selections persist via Figma's `clientStorage` and stamp on
every inserted node, so the **Refresh** button can re-render against
the current data without losing presentation.

### Adaptive cards

Every section is conditional on the offer actually carrying that
data. No discount → no "Last-minute deal" pill. No rating → "New
listing". Fewer than 2 images → no pagination dots. Amenities the
plugin doesn't have icons for are silently dropped. Designers never
see placeholder noise.

---

## How the UX works

### Four ways to drop a card

1. **Click the Drop CTA** with no canvas selection → card lands at
   the viewport centre.
2. **Click Drop with a `#fieldName` frame selected** → the plugin
   populates the frame's `#title`, `#image`, `#pricePerNight`, etc.
   instead of creating a new card.
3. **Drag a tile onto a frame on the canvas** → routed through
   Figma's native `figma.on('drop')` event. If the frame has
   `#fieldName` children, the plugin populates them. Otherwise the
   card is filled in as a child (toggle Replace in the banner to
   clear existing children first).
4. **Drag a tile onto empty canvas** → card lands at the cursor
   position.

### Selection and favourites

- **Cmd / Ctrl-click** toggles a tile additively without moving the
  selection anchor. **Shift-click** selects the visible-list range
  from the anchor.
- **Star (★)** any tile to favourite it. The Favourites filter chip
  shows the count and filters the grid to just the starred ones.
  Both persist across sessions.
- **`R`** picks a random visible tile.

### ⌘K command palette

Press `⌘K` (or `Ctrl+K`) for fuzzy substring search across every
plugin command:

- **Drop**, **Random**, **Refresh**, **Find all** (selects every
  HomeDrop card on the current page and zooms to fit).
- **Mode / Platform / Locale / Theme** switching.
- **Save preset** captures `mode + platform + locale + gridColumns
  + sort` under a name. **Apply preset** restores all five with one
  click. Presets are also reachable from the header dropdown.

### Canvas ↔ plugin awareness

- Select an inserted HomeDrop card on the canvas → its tile in the
  plugin **pulses** for 1.4 s and scrolls into view, so designers
  know which property a placed card maps to.
- Select any other (non-HomeDrop) frame → a banner appears at the
  top of the plugin saying **"Drop into 'Frame name'"** with a
  Replace toggle. The banner's sub-line tells you exactly what will
  land: *"3 properties will land here as a grid"* /
  *"Populate matching #fields with the selected property"* /
  *"The selected property will land here"*.

### Toast + Undo

Every successful drop ends with a 5 s bottom toast confirming what
landed. The toast carries an **Undo** button that removes the
freshly-placed nodes.

The first successful drop of each session also fires a one-shot
confetti burst — a small reward to make the demo feel celebratory.

### Theme + window sizing

- **Theme picker** in the header (Auto / Light / Dark). Auto follows
  Figma's host theme via `html.figma-dark` / `html.figma-darker`;
  Light and Dark force an override.
- **Drag the bottom-right corner** to resize the plugin window. Size
  is clamped 360×480 → 900×1200 and persisted to `clientStorage`.

### Hover peek

Hold the cursor on a tile for 450 ms and a side panel opens with the
hero image, location, capacity, and price — a fast way to check a
property without opening the detail level.

---

## Populate your own component

Name your layers with a `#` prefix matching one of the documented
keys, and the plugin will override them in place — either via the
Drop CTA in Single mode or by dragging a tile directly onto your
frame.

| Layer name | Gets set to |
|------------|-------------|
| `#title` | Offer title |
| `#pricePerNight` | `€128` |
| `#priceOriginal` | `€151` (strikethrough-ready) |
| `#discountLabel` | `Last-minute deal: -15%` |
| `#ratingAverage` | `4.7` |
| `#ratingCount` | `(284 reviews)` |
| `#location` | `3.4 km to center · Berlin Prenzlauer Berg` |
| `#providerLine` | `Promoted by Vrbo` |
| `#image` | Hero image as an image fill |
| `#imageSecondary` | Second image |

Full spec in [`docs/LAYER_NAMING_SPEC.md`](docs/LAYER_NAMING_SPEC.md).
Match is case- and separator-insensitive
(`#PricePerNight` = `#price_per_night` = `#price-per-night`).

---

## Project layout

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full tour.

```
src/
  main/      Figma sandbox code (all figma.* API calls + drop routing)
    index.ts        # showUI + message router + figma.on('drop')
    generate.ts     # Platform-aware card builder (web + iOS + Android)
    populate.ts     # #fieldName layer populator + fillIntoTarget
    sections/       # 12 detail-page section builders

  ui/        Preact iframe UI — owns the OffersSource
    App.tsx           # State machine (search + detail levels)
    offers-source.ts  # OffersSource interface + JsonOffersSource + v2 stub
    confetti.ts       # Imperative runConfetti()
    theme.ts          # Auto/Light/Dark theme application
    dragImage.ts      # Custom setDragImage() ghost factory
    components/       # Header, Toast, CommandPalette, PresetsMenu,
                      # DropTargetBanner, NumberTicker, HoverPeek, etc.

  shared/    Types, message contracts, locale strings (consumed by both)
  data/      PoC JSON (10 offers, en/de/es/fr — v2 drops this)

tests/       Vitest unit tests for src/shared/ modules
docs/        See the Docs section below
```

---

## Architecture summary

Two threads, clean separation:

- **Main (QuickJS)** owns all `figma.*` API calls — building cards,
  populating frames, routing drops, listening to `selectionchange`
  and `drop`. It holds a small `OFFER_BY_ID` cache for refresh
  lookups but never fetches data itself.
- **UI (iframe)** owns the catalogue via `OffersSource`. It fetches,
  filters, sorts, and on each successful load syncs the result to
  main via the `SYNC_OFFERS` channel.

11 typed message channels carry everything between threads. See the
[message-channels table in CLAUDE.md](CLAUDE.md#message-channels).

The data layer is intentionally on the UI thread (where `fetch()`
lives) so v2's API swap is a one-line change in `App.tsx`. See
[`docs/ARCHITECTURE.md#data-layer-v08`](docs/ARCHITECTURE.md) for
the boot+sync flow and the v2 transition path.

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `R` | Randomize (pick a random visible tile) |
| `Enter` | Drop the selected tile(s) |
| `Esc` | Close the palette / detail / preview, then clear selection |
| `⌘A` / `Ctrl+A` | Select all visible tiles (List / Grid mode only) |
| `Shift-click` | Extend selection from the anchor |
| `⌘-click` / `Ctrl-click` | Toggle a tile in/out of selection |

---

## Docs

- [CLAUDE.md](CLAUDE.md) — project context for AI collaborators,
  including the message-channels table and interaction model.
- [CHANGELOG.md](CHANGELOG.md) — what changed and when.
- [docs/SCOPE.md](docs/SCOPE.md) — PoC scope and non-goals.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — two-thread split,
  message flow, data layer, drop routing.
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — the `Offer` schema and
  the v2 transition.
- [docs/LAYER_NAMING_SPEC.md](docs/LAYER_NAMING_SPEC.md) —
  designer-facing spec for the `#fieldName` populate path.
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — local dev loop,
  common tasks, gotchas, "Wire a real API" recipe.
- [docs/BRAND.md](docs/BRAND.md) — HomeToGo palette + card reference.
