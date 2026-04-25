# HomeDrop — Figma Plugin (PoC)

HomeDrop is the HomeToGo design team's Figma plugin: drop real
vacation-rental product data straight into your designs. Open it, browse
10 mock properties, and click once (or drag a tile onto the canvas) to
insert a fully-populated HomeToGo product card, a list, or a grid.

> **Status:** Proof of concept. Data is a bundled JSON file
> (`src/data/products.json`) consumed via `JsonOffersSource`. v2 swaps
> in `ApiOffersSource` (one line in `src/ui/App.tsx`) and removes the
> `i18n` block from `Offer` once the API returns locale-specific data
> directly. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#data-layer-v08).

---

## Quick start

```bash
npm install
npm run build    # produces build/main.js, build/ui.js, manifest.json
```

In Figma desktop:

1. **Plugins → Development → Import plugin from manifest…**
2. Pick the generated `manifest.json` at the repo root.
3. **Run → HomeDrop → Browse properties.**

For iterative development:

```bash
npm run watch     # incremental rebuild on save
npm test          # run the Vitest suite once
npm run test:watch  # re-run tests on every change
```

Then click **Plugins → Development → HomeDrop** again; Figma reloads the
plugin on each run.

---

## What it does

![three insert modes](docs/mode-reference.png)

- **Single** — one card at viewport centre. If you have a frame selected with
  `#title` / `#pricePerNight` / `#image` layers, the plugin populates those
  instead of creating a new card.
- **List** — N cards stacked in an auto-layout frame.
- **Grid** — N cards in a 2-column wrapping auto-layout frame.

The card itself matches HomeToGo's production search-result layout: image
left, content middle, actions column right with the purple→pink gradient
"View deal" button. Every field is **adaptive** — no rating, no discount, no
neighbourhood, fewer amenities? The card trims those sections automatically
so it always looks right without cleanup.

### v0.6 / v0.7 polish

- **Drag tiles onto the canvas.** Drop on empty space → card lands at the
  drop point. Drop on a selected frame with `#fieldName` children → the
  plugin populates them. Drop on any other selected frame → the card is
  filled in as a child (toggle Replace in the banner to clear siblings
  first).
- **Dark mode.** Auto follows Figma's theme; Light / Dark force an override.
- **Multi-select.** Cmd-click toggles, shift-click extends from the last
  anchor.
- **Favourites.** Star tiles to keep them around; ★ persists in
  clientStorage.
- **Randomize** (R / dice button) picks a random visible tile.
- **⌘K** opens a command palette: Drop, Random, Refresh, Find all,
  mode/platform/locale/theme switching, presets.
- **Toast + Undo.** Every insert ends with a 5 s toast; click Undo to
  remove the freshly-dropped nodes.
- **Resizable window.** Drag the corner handle; size persists across
  sessions.

---

## Project layout

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full tour.

```
src/
  main/      Figma sandbox code (all figma.* API calls + drop routing)
  ui/        Preact iframe UI — owns the OffersSource (browse/search/filter)
  shared/    Types, message contracts, #fieldName spec, locale strings
  data/      PoC JSON (10 offers, de/es/fr translations baked in — v2 drops this)
tests/       Vitest unit tests for src/shared/ modules
docs/
  SCOPE.md            What's in and out of the PoC
  ARCHITECTURE.md     Threads, bundling, message flow
  DATA_MODEL.md       The Offer shape, reference fields from HTG
  LAYER_NAMING_SPEC.md How to name Figma layers so the plugin can populate them
  DEVELOPMENT.md      Local dev, common tasks, gotchas
  BRAND.md            Palette, typography, screenshots of the reference card
```

---

## Populate your own component

Name your layers with a `#` prefix matching one of the documented keys, and
the plugin's **Single** mode will override them in place. A few examples:

| Layer name | Gets set to |
|------------|-------------|
| `#title` | Offer title |
| `#pricePerNight` | `€128` |
| `#priceOriginal` | `€151` (strikethrough-ready; set your own text decoration) |
| `#discountLabel` | `Last-minute deal: -15%` |
| `#ratingAverage` | `4.7` |
| `#ratingCount` | `(284 reviews)` |
| `#location` | `3.4 km to center · Berlin Prenzlauer Berg` |
| `#providerLine` | `Promoted by Vrbo` |
| `#image` | Hero image as an image fill |
| `#imageSecondary` | Second image |

Full spec in [`docs/LAYER_NAMING_SPEC.md`](docs/LAYER_NAMING_SPEC.md). Match is
case- and separator-insensitive (`#PricePerNight` = `#price_per_night` =
`#price-per-night`).

---

## Docs

- [CLAUDE.md](CLAUDE.md) — project context for AI collaborators
- [CHANGELOG.md](CHANGELOG.md) — what changed and when
- [docs/SCOPE.md](docs/SCOPE.md) — PoC scope and non-goals
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — two-thread architecture
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — the `Offer` schema
- [docs/LAYER_NAMING_SPEC.md](docs/LAYER_NAMING_SPEC.md) — for designers
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — dev loop, tasks, gotchas
- [docs/BRAND.md](docs/BRAND.md) — HomeToGo palette + card reference
