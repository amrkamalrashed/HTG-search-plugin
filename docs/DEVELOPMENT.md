# Development

## Setup

```bash
npm install
```

Node ≥ 18 recommended. Figma desktop is required for side-loading a local
plugin.

## Build loop

```bash
npm run build    # one-shot (writes build/*, manifest.json)
npm run watch    # incremental rebuild on save
npm run typecheck
```

`build-figma-plugin` reads the `figma-plugin` block in `package.json` and
generates a fresh `manifest.json` on every build. Edit the block, not the
generated file (which is gitignored).

## Load into Figma

1. Open Figma desktop.
2. **Menu → Plugins → Development → Import plugin from manifest…**
3. Select the `manifest.json` at the repo root.
4. Open any Figma file. Run **Plugins → Development → HomeToGo Data →
   Browse properties**.

When watching, each plugin run picks up the latest bundle — no re-import.

## Common tasks

### Add an offer field

1. Add it to `Offer` in `src/shared/types.ts`.
2. Populate it on every seed row in `src/data/products.json`. TypeScript will
   flag missing values at build time.
3. Extend `LAYER_KEYS` in `src/shared/layer-names.ts` and add a case in
   `textForKey` (or `imageUrlForKey`).
4. Render it in `src/main/generate.ts` inside the relevant panel
   (`buildImagePanel` / `buildContent` / `buildActions`).
5. Optional: surface it in the UI (`ProductTile.tsx`, `PreviewModal.tsx`).
6. Document it in `docs/DATA_MODEL.md` and `docs/LAYER_NAMING_SPEC.md`.

### Add an amenity icon

1. Add the SVG string to `ICON` in `src/main/icons.ts`.
2. Map the amenity to the icon name in `AMENITY_TO_ICON` in
   `src/main/generate.ts`.

### Change the card visual

Edit `src/main/generate.ts` and the tokens in `src/main/brand.ts`. The card
uses Figma auto-layout end-to-end, so changing paddings/gaps propagates
correctly.

### Change the plugin UI visual

Edit `src/ui/styles.css` (top-level CSS variables carry the palette) and the
Preact components under `src/ui/components/`.

### Add a filter

1. Extend `Filters` in `src/ui/components/FilterBar.tsx`.
2. Add a chip button that toggles the new field.
3. Add the filter predicate to the `visible` memo in `src/ui/App.tsx`.

### Wire a real API

Today: `src/main/index.ts` imports `products.json` at build time.

For v2:

1. Move the import out — the UI thread owns the `fetch`.
2. In `src/ui/App.tsx`, call `fetch(apiUrl)` inside a `useEffect`, parse, and
   pass the offers into the existing state.
3. Add the API host + image CDN to `package.json → "figma-plugin"
   .networkAccess.allowedDomains`.
4. If the API rejects the Figma iframe's CORS origin, route through a
   lightweight proxy (Cloudflare Worker / Vercel serverless function) that
   adds `Access-Control-Allow-Origin`.
5. Keep the `Offer` shape identical — map API fields into it at the fetch
   site, not downstream.

## Gotchas

- **Fonts must load before writing `characters`.** We batch this in
  `loadBrandFonts()`; if you add a new font/style, add it there too.
- **`networkAccess.allowedDomains`** is a hard allowlist. Missing domains
  silently return 0-byte responses. Check the allowlist first when an
  `loadImageHash` quietly returns `null`.
- **`figma.createImageAsync`** requires the target host to send CORS headers.
  Unsplash does; not every host will.
- **Auto-layout wrap** (`layoutWrap: 'WRAP'`) requires
  `primaryAxisSizingMode: 'FIXED'` with an explicit width. This is why the
  grid container in `insertCards` resizes before children are appended.
- **`findOne` is O(n)**. `src/main/populate.ts` uses a single `findAll`.
- **Don't mutate `.fills` / `.strokes` in place.** Assign a new array.
- **QuickJS** lacks some modern JS. `esbuild` targets `es2017` by default; if
  you add code using `structuredClone`, `Array.prototype.findLast`, or other
  recent additions, test it in Figma specifically.

## Troubleshooting

- **Plugin opens blank** → open DevTools on the iframe
  (**Plugins → Development → Open Console**) — usually a missing import.
- **"Please select an object with children"** style errors → the populate path
  received a `TEXT` node; we guard against this in
  `firstTargetInSelection`.
- **No image appears on the card** → either the image URL is unreachable, or
  its host is not in `allowedDomains`. `loadImageHash` returns `null` silently;
  the rectangle falls back to the surface grey.
- **`manifest.json` is out of date** → rerun `npm run build`. The file is
  regenerated from `package.json → figma-plugin`.
