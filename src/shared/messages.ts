import type { EventHandler } from '@create-figma-plugin/utilities';
import type { Offer } from './types';

export type InsertMode = 'single' | 'list' | 'grid';

export interface InsertPayload {
  offers: Offer[];
  mode: InsertMode;
}

export interface LoadedPayload {
  offers: Offer[];
}

/**
 * emit/on contracts. Use as `emit<InsertHandler>('INSERT', payload)` and
 * `on<InsertHandler>('INSERT', handler)`.
 */
export interface InsertHandler extends EventHandler {
  name: 'INSERT';
  handler: (payload: InsertPayload) => void;
}

/**
 * Back-compat aliases so existing imports like `InsertMessage` /
 * `LoadedMessage` keep working.
 */
export type InsertMessage = InsertPayload;
export type LoadedMessage = LoadedPayload;
