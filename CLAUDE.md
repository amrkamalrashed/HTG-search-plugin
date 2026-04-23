# CLAUDE.md — HomeToGo Data Figma Plugin

Context for future Claude sessions working on this repository.

## What this is

A **Proof-of-Concept Figma plugin** that lets HomeToGo designers insert real
vacation-rental product data into their designs with one click. PoC v1 reads a
local JSON file of 10 mock offers; a future v2 will call the internal HTG
search/product API once it becomes available.

The core UX: open plugin → browse/search/filter properties → optionally preview
→ pick one or many → click **Insert** → plugin places a fully-populated HTG
product card (or a list / grid of cards) on the canvas.

## Who asked for this

HomeToGo's design team, to eliminate the manual work of copying real property
titles, prices, ratings, and images into Figma mockups. Internal demo first, API
integration later.

## Status

- v1 scaffolded (TypeScript + `create-figma-plugin` + Preact).
- Mock data source only (no API access yet).
- Card design targets the real HomeToGo search-results card (screenshot in
  `docs/BRAND.md`). Designers will supply the official component later.

## Architecture at a glance

```
src/
  main/         # Figma sandbox (QuickJS). Owns all figma.* API calls.
    index.ts    # showUI + message router
    generate.ts # Adaptive card builder — builds the HTG card from scratch.
    populate.ts # Populates a user-selected frame via #fieldName layers.
    brand.ts    # Canvas-side design tokens (colors, fonts, gradient paint).
    icons.ts    # Inline SVGs for amenity/share/heart/fullscreen icons.
    images.ts   # figma.createImageAsync wrapper.
    fonts.ts    # Parallel font loader.
  ui/           # Preact iframe. Handles browse/search/filter/preview.
    index.tsx
    App.tsx
    styles.css
    components/ # Header, SearchBar, FilterBar, ProductTile, PreviewModal
  shared/       # Consumed by both threads (no DOM / no figma.* API).
    types.ts      # Offer type and its enums.
    messages.ts   # postMessage contracts (InsertMessage, LoadedMessage).
    layer-names.ts # #fieldName convention + value formatters.
  data/
    products.json # 10 seed offers, with variation (discount/no-discount,
                  # rated/unrated, varying amenities, umlauts).
```

Main and UI threads communicate via `emit` / `on` from
`@create-figma-plugin/utilities` (typed wrappers over `postMessage`).

## Three insert modes (all adaptive to the offer)

- **Single** — one card at viewport centre. If the user has a frame selected
  containing `#fieldName` layers, we populate it instead of creating a new one.
- **List** — N cards stacked in a vertical auto-layout container.
- **Grid** — N cards in a 2-column wrapping auto-layout container.

The **card generator is adaptive**: it skips missing fields rather than
inserting placeholders. Offers without a discount get no discount pill;
unrated offers show "New listing"; amenities the plugin doesn't have icons for
are silently dropped; fewer than 2 images skips the pagination dots.

## Design anchor

Card layout must match HomeToGo's production search-result card:
horizontal (image left · content middle · actions column right), with a
**purple→pink gradient "View deal" button**, **purple star** for ratings, and a
**soft-coral "Last-minute deal: -N%" pill** inside the actions column above the
strikethrough price. See `docs/BRAND.md` for the palette.

## Common tasks

| Task | Where to edit |
|------|---------------|
| Add a new offer field | `src/shared/types.ts` → `src/data/products.json` → `src/shared/layer-names.ts` (add key + formatter) → `src/main/generate.ts` (render it) |
| Add an amenity icon | `src/main/icons.ts` (add SVG) → `AMENITY_TO_ICON` in `src/main/generate.ts` |
| Change card visuals | `src/main/generate.ts` + tokens in `src/main/brand.ts` |
| Change plugin UI look | `src/ui/styles.css` + CSS-var tokens at top |
| Add a filter chip | `src/ui/components/FilterBar.tsx` + `Filters` type + matching filter in `App.tsx` |
| Wire to a real API | Replace the `productsJson` import in `src/main/index.ts` with a `fetch` in the UI thread; add domain to `package.json` → `figma-plugin.networkAccess.allowedDomains` |

## Gotchas (from the research)

1. Always `await figma.loadFontAsync(...)` before setting `TextNode.characters`.
   We centralise this in `src/main/fonts.ts#loadBrandFonts`.
2. `networkAccess.allowedDomains` gates requests but doesn't bypass CORS. The
   target host must return permissive headers.
3. `figma.createImageAsync(url)` is the preferred image loader — it fetches,
   decodes, and returns a hash in one call. Requires the domain to be in the
   allowlist.
4. Keep `documentAccess: "dynamic-page"` (set in `package.json`) and use `Async`
   node APIs — legacy synchronous ones will be removed.
5. The `layoutWrap = 'WRAP'` property needs `primaryAxisSizingMode = 'FIXED'`.
6. Don't mutate `node.fills` in place; always assign a new array.
7. `findOne` is O(n). In `populate.ts` we use a single `findAll` up front.

## Build / run

```bash
npm install
npm run build      # writes build/main.js, build/ui.js, manifest.json
npm run watch      # incremental rebuild on save
```

In Figma desktop: **Menu → Plugins → Development → Import plugin from
manifest…** and pick the generated `manifest.json`.

## Branch / commit conventions

- Working branch: `claude/figma-plugin-json-demo-qpF2n`
- All substantive changes get an entry in `CHANGELOG.md`.
- Keep commits scoped: "data model + adaptive card" is fine; "everything" is
  not.

## When picking up this project again

1. Read `docs/SCOPE.md` for what's in and out of v1.
2. Read `docs/ARCHITECTURE.md` before touching the thread-crossing parts.
3. Read `docs/DATA_MODEL.md` before changing `Offer` — the contract is shared
   with `products.json` and the layer-naming spec.
4. Read `docs/LAYER_NAMING_SPEC.md` before changing the populate path — this
   doc is designer-facing.
5. Check `CHANGELOG.md` for recent moves.
