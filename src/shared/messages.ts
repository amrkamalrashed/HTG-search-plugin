import type { EventHandler } from '@create-figma-plugin/utilities';
import type { Offer, PropertyType } from './types';
import type { Locale } from './locales';
import type { Platform } from './platforms';

export type InsertMode = 'single' | 'list' | 'grid';

export type SortKey = 'default' | 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'newest';

/** Keys of the detail-page sections the plugin can render. */
export type SectionKind = 'gallery' | 'amenities' | 'reviews' | 'priceBreakdown';

export const SECTION_KINDS: SectionKind[] = [
  'gallery',
  'amenities',
  'reviews',
  'priceBreakdown',
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
}

/** Level-1 insert (property cards). */
export interface InsertCardsPayload {
  kind: 'cards';
  offers: Offer[];
  mode: InsertMode;
  gridColumns: number;
  locale: Locale;
  platform: Platform;
}

/** Level-2 insert (detail-page sections for a single offer). */
export interface InsertSectionsPayload {
  kind: 'sections';
  offerId: string;
  sections: SectionKind[];
  locale: Locale;
  platform: Platform;
}

export type InsertPayload = InsertCardsPayload | InsertSectionsPayload;

export interface LoadedPayload {
  offers: Offer[];
  savedState?: UiState;
}

export interface InsertHandler extends EventHandler {
  name: 'INSERT';
  handler: (payload: InsertPayload) => void;
}

export interface SaveStateHandler extends EventHandler {
  name: 'SAVE_STATE';
  handler: (state: UiState) => void;
}

export interface RefreshHandler extends EventHandler {
  name: 'REFRESH';
  handler: () => void;
}

/** Back-compat aliases. */
export type InsertMessage = InsertPayload;
export type LoadedMessage = LoadedPayload;
