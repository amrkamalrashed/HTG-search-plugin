import type { EventHandler } from '@create-figma-plugin/utilities';
import type { Offer, PropertyType } from './types';
import type { Locale } from './locales';
import type { Platform } from './platforms';

export type InsertMode = 'single' | 'list' | 'grid';

export type SortKey = 'default' | 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'newest';

/** Plugin-managed theme. 'auto' follows Figma's host theme. */
export type Theme = 'auto' | 'light' | 'dark';

export interface UiSize {
  width: number;
  height: number;
}

/** A reusable preset of plugin settings the user can apply with one click. */
export interface UiPreset {
  id: string;
  /** User-supplied display name. */
  label: string;
  mode: InsertMode;
  platform: Platform;
  locale: Locale;
  gridColumns: number;
  sort: SortKey;
}

/** Keys of the detail-page sections the plugin can render. */
export type SectionKind =
  | 'gallery'
  | 'titleHeader'
  | 'quickFacts'
  | 'reasonsToBook'
  | 'reviews'
  | 'amenities'
  | 'roomInformation'
  | 'description'
  | 'houseRules'
  | 'location'
  | 'priceBreakdown'
  | 'cancellationPolicy';

export const SECTION_KINDS: SectionKind[] = [
  'gallery',
  'titleHeader',
  'quickFacts',
  'reasonsToBook',
  'reviews',
  'amenities',
  'roomInformation',
  'description',
  'houseRules',
  'location',
  'priceBreakdown',
  'cancellationPolicy',
];

export interface UiFilters {
  propertyType?: PropertyType;
  minRating?: number;
  priceMax?: number;
  minGuests?: number;
}

export interface UiState {
  mode: InsertMode;
  search: string;
  sort: SortKey;
  gridColumns: number;
  locale: Locale;
  platform: Platform;
  filters: UiFilters;
  theme?: Theme;
  favourites?: string[];
  presets?: UiPreset[];
  /** Persistent state of the Drop banner's Replace toggle. */
  replaceOnDrop?: boolean;
}

/**
 * Drop-into-frame instructions attached to an INSERT or DROP payload
 * when the user has a frame selected (or has dragged onto one).
 *
 *   - `targetId` — Figma node id of the frame to land in.
 *   - `replaceContents` — when true, fillIntoTarget removes existing
 *     children of the target before appending the new card.
 */
export interface DropInto {
  targetId: string;
  replaceContents: boolean;
}

/** Level-1 insert (property cards). */
export interface InsertCardsPayload {
  kind: 'cards';
  offers: Offer[];
  mode: InsertMode;
  gridColumns: number;
  locale: Locale;
  platform: Platform;
  /** Optional drop-into-frame override; set by DropTargetBanner. */
  dropInto?: DropInto;
}

/** Level-2 insert (detail-page sections for a single offer). */
export interface InsertSectionsPayload {
  kind: 'sections';
  offerId: string;
  sections: SectionKind[];
  locale: Locale;
  platform: Platform;
  dropInto?: DropInto;
}

export type InsertPayload = InsertCardsPayload | InsertSectionsPayload;

/**
 * Drop-onto-canvas payload (UI → main). Triggered by the native drag
 * from a tile. The UI sends absolute viewport pixel coords; main
 * converts those to figma viewport coords via figma.viewport math
 * (or, when available, uses canvasX / canvasY straight from
 * figma.on('drop') event data).
 */
export interface DropPayload {
  offerId: string;
  /** UI iframe pixel coords relative to the viewport's top-left. */
  clientX: number;
  clientY: number;
  /** Drop coords already in canvas space (set by figma.on('drop')). */
  canvasX?: number;
  canvasY?: number;
  locale: Locale;
  platform: Platform;
  /** Mirrors DropInto.replaceContents when present. */
  replaceOnDrop?: boolean;
}

/**
 * Initial data shipped from main → UI on showUI(). The catalogue itself
 * is no longer included here — the UI iframe owns the OffersSource and
 * fetches on mount. Main only ships state Figma already had access to
 * before the UI booted (saved UiState + saved size).
 */
export interface LoadedPayload {
  savedState?: UiState;
  uiSize?: UiSize;
}

/**
 * Surfaced by main → UI as the body of an INSERTED message. The UI
 * shows it in a Toast and, when `createdNodeIds` is non-empty, wires
 * the Undo button to UNDO with those ids.
 */
export interface ToastMessage {
  /** Top-level node ids the Undo handler will remove. */
  createdNodeIds: string[];
  /** Short user-facing label, e.g. "Dropped 3 properties as a list". */
  label: string;
  /** Verb hint for analytics + UI styling. */
  kind: 'inserted' | 'populated' | 'replaced' | 'dropped';
}

/** Selection target surfaced by main on every selectionchange event. */
export interface SelectionTarget {
  /** Figma node id (for analytics/debug only). */
  id: string;
  /** Best human-readable label for the banner. */
  name: string;
  /** True when the frame contains at least one #fieldName layer. */
  hasFieldNames: boolean;
}

// =============================================================================
// Handlers
// =============================================================================

export interface InsertHandler extends EventHandler {
  name: 'INSERT';
  handler: (payload: InsertPayload) => void;
}

export interface SaveStateHandler extends EventHandler {
  name: 'SAVE_STATE';
  handler: (state: UiState) => void;
}

export interface SaveUiSizeHandler extends EventHandler {
  name: 'SAVE_UI_SIZE';
  handler: (size: UiSize) => void;
}

export interface ResizeHandler extends EventHandler {
  name: 'RESIZE';
  handler: (size: UiSize) => void;
}

export interface RefreshHandler extends EventHandler {
  name: 'REFRESH';
  handler: () => void;
}

/** UI → main: drop a card at the given canvas coordinates. */
export interface DropHandler extends EventHandler {
  name: 'DROP';
  handler: (payload: DropPayload) => void;
}

/** UI → main: undo the last toast operation by node id. */
export interface UndoHandler extends EventHandler {
  name: 'UNDO';
  handler: (payload: { nodeIds: string[] }) => void;
}

/** UI → main: select every HomeDrop-tagged node on the current page. */
export interface FindAllHandler extends EventHandler {
  name: 'FIND_ALL';
  handler: () => void;
}

/**
 * UI → main: ship the freshly-loaded catalogue so main can satisfy
 * Refresh requests by id without round-tripping back to the UI. Fires
 * after every successful `OffersSource.search()` (initial load + on
 * locale change).
 */
export interface SyncOffersHandler extends EventHandler {
  name: 'SYNC_OFFERS';
  handler: (payload: { offers: Offer[]; locale: Locale }) => void;
}

/** Main → UI: a description of what was just inserted (Toast body). */
export interface InsertedHandler extends EventHandler {
  name: 'INSERTED';
  handler: (payload: ToastMessage) => void;
}

/** Main → UI: pulse the matching tile (canvas selection echo). */
export interface HighlightHandler extends EventHandler {
  name: 'HIGHLIGHT_OFFER';
  handler: (payload: { offerId: string | null }) => void;
}

/** Main → UI: surface the selected drop-target frame (or null). */
export interface SelectionTargetHandler extends EventHandler {
  name: 'SELECTION_TARGET';
  handler: (payload: { target: SelectionTarget | null }) => void;
}

// =============================================================================
// Back-compat aliases (the renamed types kept their wire `name`)
// =============================================================================
export type InsertMessage = InsertPayload;
export type LoadedMessage = LoadedPayload;
