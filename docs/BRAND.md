# Brand — palette, typography, card anatomy

> Tokens here must be kept in sync with `src/main/brand.ts` (canvas) and
> `src/ui/styles.css` `:global(:root)` (plugin UI). Designers will replace
> the PoC palette with the final HomeToGo brand tokens before v2.

## Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Violet | `#6B42E8` | Primary CTA gradient (left stop), rating star, UI accents, selected-tile outline |
| Violet-dark | `#5A33D6` | CTA hover |
| Violet-soft | `#F2EDFF` | Selected-tile glow, bulk-bar background |
| Magenta | `#D149C5` | Primary CTA gradient (right stop) |
| Coral | `#FC4D5B` | Discount-pill text |
| Coral-soft | `#FFEEF0` | Discount-pill background |
| Text primary | `#0E1824` | Titles, prices |
| Text secondary | `#5B6B7E` | Location, amenities, suffixes |
| Text subtle | `#95A3B3` | "Promoted by" line |
| Border | `#E1E6EC` | Card outline, chip outline |
| Surface | `#F7F9FC` | List/Grid container background, image placeholder |
| Green (great deal) | `#22A06E` | Alternative badge tint |
| White | `#FFFFFF` | Card surface |

## Primary CTA gradient

```
linear-gradient(90deg, #6B42E8 0%, #D149C5 100%)
```

In Figma, built as a `GRADIENT_LINEAR` paint with two stops; see
`VIEW_DEAL_GRADIENT` in `src/main/brand.ts`.

## Plugin logo

The plugin header (`src/ui/components/Header.tsx`) shows a "hometogo"
wordmark with a squircle home mark filled with the primary gradient.
This is a **PoC placeholder** — when the official HomeToGo brand SVG
is available:

1. Replace the inline `<svg>` in `Header.tsx` with the official wordmark.
2. Keep the containing `.logo` flex row (styles in `ui/styles.css`) so
   the refresh button + mode toggle alignment doesn't shift.
3. If the wordmark already includes the "hometogo" text, remove the
   `<span class={styles.logoText}>` below it.

The inline SVG is deliberately small (~1 KB) and carries no external
dependencies so the plugin bundle stays lean.

## Reference screenshots

The design targets are the live HomeToGo search-result cards, e.g.
<https://www.hometogo.com/search/53cf87469a10a?arrival=2026-04-23&duration=1>.
When HomeToGo's official Figma component lands, this document should be
amended with the component key (used via
`figma.importComponentByKeyAsync`) and a pointer to the design-system file.
