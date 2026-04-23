import type { EventHandler } from '@create-figma-plugin/utilities';
import type { Offer, PropertyType } from './types';

export type InsertMode = 'single' | 'list' | 'grid';

export type SortKey = 'default' | 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'newest';

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
  filters: UiFilters;
}

export interface InsertPayload {
  offers: Offer[];
  mode: InsertMode;
  gridColumns: number;
}

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
