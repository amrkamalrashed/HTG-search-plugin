# Scope — PoC v1

## Goal

Convince the HomeToGo design team that a one-click plugin can replace the
manual copy-pasting of product titles, prices, ratings, and images into
Figma mockups. Ship a working demo that loads real-looking HTG offers from
a local JSON file, lets designers browse/search/filter them, and inserts a
populated HomeToGo product card onto the canvas.

## In scope

- **10 mock offers** in `src/data/products.json`, realistic enough for design
  reviews: varied cities, currencies, ratings, discounts, and amenities;
  umlauts and long titles for layout testing.
- **Figma-native UI** (Preact + `@create-figma-plugin/ui`) styled with the
  HomeToGo palette: purple→pink gradient CTA, purple star, soft-coral discount
  pill, neutral card grid.
- **Three insert modes**, all adaptive to the offer's available fields:
  - Single card at viewport centre
  - List (vertical auto-layout stack)
  - Grid (2-column auto-layout wrap)
- **Hybrid insertion**: if the designer has a frame or component selected
  whose children use the `#fieldName` convention, populate those layers in
  place; otherwise generate a new card from scratch.
- **Search + filter**: free-text search across title/city/country, plus filter
  chips for price ceiling, min rating, min guest count, and property type.
- **Preview pane**: full-detail bottom-sheet with all fields + direct insert.
- **Designer spec**: `docs/LAYER_NAMING_SPEC.md` documents the layer-naming
  contract so HTG designers can retro-fit their own components.
- **Adaptive rendering**: every card section is conditional on the offer
  actually having that data. No placeholder noise.
- **UX polish (v0.6 / v0.7)**:
  - Drag-tile-onto-canvas → drops a card or populates `#fieldName`
    layers in the selected frame.
  - Dark mode (Auto / Light / Dark), persisted across sessions.
  - Resizable plugin window with size persisted in clientStorage.
  - Multi-select with shift / cmd anchor range, persistent favourites
    (★), randomize button + R shortcut.
  - ⌘K command palette; bottom Toast with Undo; saved presets
    (mode + platform + locale + gridColumns + sort).
  - Canvas selection awareness: tiles pulse when their card is
    selected on the canvas; a banner names the active drop target.

## Non-goals — what the plugin intentionally does NOT do

The plugin **inserts components, not screens**. It never generates:

- iOS/Android status bars, safe-area insets, notches
- Sticky headers / back / share / heart chrome
- Bottom navigation bars or home indicators
- Sticky bottom CTA bars
- Background frames shaped like a phone screen

Multi-item inserts (list / grid / multi-section) use a plain
auto-layout group with no fills, no padding, no corner radius, no
stroke — purely for spacing. Designers wrap the output in their own
screen chrome.

## Out of scope (deferred to v2 or later)

- **Real API integration.** The internal HTG search/product API is not
  accessible from this session. The network-access allowlist and message
  shape are designed to make swapping in `fetch` a small change.
- **Authentication / user-specific data.** PoC is read-only and anonymous.
- **Official HTG component import.** Designers will provide the production
  product-card component via team library; the plugin will then
  `figma.importComponentByKeyAsync(key)` to place it. The populate path
  (see `docs/LAYER_NAMING_SPEC.md`) is the contract between the two.
- **Production icon set.** The PoC ships generic line icons; the HTG icon
  library will replace them.
- **Persistence.** Client-storage of last search / filters / mode is a v2 nice-to-have.
- **Undo affordances beyond Figma's own.** We don't track our own history.
- **Localised formatting.** Currency symbols are EUR/GBP/USD only; prices use
  `en-US` number formatting.
- **Pagination, infinite scroll, lazy image loading.** 10 offers fit on screen.
- **Unit tests.** The PoC is visually verified in Figma; we'll add a test
  harness once v2 is scoped.
- **Publishing to the Figma community.** The plugin is intended for internal
  use only at this stage.

## Success criteria

1. Designer opens plugin, picks a property, clicks **Insert** → a full
   HomeToGo product card appears on canvas, ready to drop into their mockup.
2. Designer switches to **List** or **Grid** mode, multi-selects 3–5
   properties, clicks **Insert** → an auto-layout container with populated
   cards is placed.
3. Designer selects an existing frame with `#title`/`#pricePerNight`/`#image`
   layers and clicks **Insert** in Single mode → those layers are overridden.
4. Demo runs end-to-end without internet access beyond the Unsplash allowlist.
5. The decision to build v2 (API-backed) is informed by what the demo reveals.
