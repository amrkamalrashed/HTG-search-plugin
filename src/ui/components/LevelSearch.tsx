import { h, Fragment } from 'preact';
import type { Offer } from '@shared/types';
import type { MultiLayout, SortKey, UndoHandler } from '@shared/messages';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import { emit } from '@create-figma-plugin/utilities';
import { SearchBar } from './SearchBar';
import { FilterBar, type Filters } from './FilterBar';
import { SortBar } from './SortBar';
import { ProductTile } from './ProductTile';
import { DropCta } from './DropCta';
import styles from '../styles.css';

interface Props {
  // catalogue
  offers: Offer[];
  visible: Offer[];
  loading: boolean;
  loadError: string | null;
  onRetry: () => void;

  // search / filter / sort / layout
  search: string;
  onSearchChange: (s: string) => void;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  favouritesCount: number;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  multiLayout: MultiLayout;
  onMultiLayoutChange: (m: MultiLayout) => void;
  gridColumns: number;
  onGridColumnsChange: (n: number) => void;

  // selection
  selectedIds: Set<string>;
  favourites: Set<string>;
  pulseId: string | null;
  onToggle: (id: string, e?: MouseEvent) => void;
  onToggleFavourite: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onTileDragStart: (offer: Offer, e: DragEvent) => void;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
  hasActiveFilters: boolean;
  onClearAllFilters: () => void;

  // footer
  insertLabel: string;
  onInsert: () => void;
  onRandomize: () => void;
  lastUndo: { nodeIds: string[]; label: string } | null;
  onClearLastUndo: () => void;

  locale: Locale;
}

/**
 * Level-1 layout: search/filter/sort row, the tile grid, and the
 * footer with the Drop split-button + persistent Undo + Randomize
 * icon. Shared plugin chrome (Header, LocaleBar, ResizeHandle,
 * overlays) is rendered by App.tsx around this.
 */
export function LevelSearch({
  offers,
  visible,
  loading,
  loadError,
  onRetry,
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  favouritesCount,
  sort,
  onSortChange,
  multiLayout,
  onMultiLayoutChange,
  gridColumns,
  onGridColumnsChange,
  selectedIds,
  favourites,
  pulseId,
  onToggle,
  onToggleFavourite,
  onOpenDetail,
  onTileDragStart,
  onSelectAllVisible,
  onClearSelection,
  hasActiveFilters,
  onClearAllFilters,
  insertLabel,
  onInsert,
  onRandomize,
  lastUndo,
  onClearLastUndo,
  locale,
}: Props) {
  const count = selectedIds.size;
  const showBulkBar = count >= 2;
  const cols = multiLayout === 'grid' ? Math.max(2, Math.min(4, gridColumns)) : 2;
  const gridStyle = { gridTemplateColumns: `repeat(${cols}, 1fr)` };

  return (
    <Fragment>
      <SearchBar value={search} onChange={onSearchChange} locale={locale} />
      <FilterBar
        filters={filters}
        onChange={onFiltersChange}
        favouritesCount={favouritesCount}
        locale={locale}
      />
      <SortBar
        count={visible.length}
        total={offers.length}
        sort={sort}
        onSortChange={onSortChange}
        multiLayout={multiLayout}
        gridColumns={gridColumns}
        onGridColumnsChange={onGridColumnsChange}
        locale={locale}
      />

      {showBulkBar && (
        <div class={styles.bulkBar}>
          <span class={styles.bulkBarText}>
            {t('uiNSelected', locale, { n: count })}
          </span>
          <div class={styles.bulkBarActions}>
            <button
              class={styles.bulkBarBtn}
              onClick={onSelectAllVisible}
              disabled={count === visible.length}
            >
              {t('uiSelectAllN', locale, { n: visible.length })}
            </button>
            <button
              class={styles.bulkBarBtnGhost}
              onClick={onClearSelection}
              disabled={count === 0}
            >
              {t('uiClear', locale)}
            </button>
          </div>
        </div>
      )}

      <div class={styles.scroll}>
        {loading ? (
          <div class={styles.grid} style={gridStyle}>
            {Array.from({ length: multiLayout === 'grid' ? cols * 2 : 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} class={styles.tileSkeleton}>
                <div class={styles.tileSkeletonImg} />
                <div class={styles.tileSkeletonBody}>
                  <div class={styles.tileSkeletonLine} />
                  <div class={`${styles.tileSkeletonLine} ${styles.tileSkeletonLineShort}`} />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div class={styles.empty}>
            <div class={styles.emptyIcon}>!</div>
            <div class={styles.emptyTitle}>{t('uiLoadErrorTitle', locale)}</div>
            <div class={styles.emptySubtitle}>{loadError}</div>
            <button class={styles.emptyBtn} onClick={onRetry}>
              {t('uiLoadErrorRetry', locale)}
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div class={styles.empty}>
            <div class={styles.emptyIcon}>⌕</div>
            <div class={styles.emptyTitle}>{t('uiNoMatchTitle', locale)}</div>
            <div class={styles.emptySubtitle}>{t('uiNoMatchHint', locale)}</div>
            {hasActiveFilters && (
              <button class={styles.emptyBtn} onClick={onClearAllFilters}>
                {t('uiClearAllFilters', locale)}
              </button>
            )}
          </div>
        ) : (
          <div class={styles.grid} style={gridStyle}>
            {visible.map((o) => (
              <ProductTile
                key={o.id}
                offer={o}
                selected={selectedIds.has(o.id)}
                favourite={favourites.has(o.id)}
                pulse={pulseId === o.id}
                onToggle={(e) => onToggle(o.id, e)}
                onToggleFavourite={() => onToggleFavourite(o.id)}
                onOpen={() => onOpenDetail(o.id)}
                onDragStart={(e) => onTileDragStart(o, e)}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>

      <div class={styles.footer}>
        <div class={`${styles.footerInfo} ${count > 0 ? styles.footerInfoActive : ''}`}>
          {count === 0
            ? t('uiHintClickSingle', locale)
            : t('uiEnterToInsert', locale, { n: count })}
        </div>
        {lastUndo && (
          <button
            class={styles.footerUndoBtn}
            onClick={() => {
              emit<UndoHandler>('UNDO', { nodeIds: lastUndo.nodeIds });
              onClearLastUndo();
            }}
            title={lastUndo.label}
          >
            ↺ {t('uiToastUndo', locale)}
          </button>
        )}
        <button
          class={styles.footerRandomBtn}
          onClick={onRandomize}
          title={t('uiRandomizeTooltip', locale)}
          aria-label={t('uiRandomize', locale)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8" cy="8" r="1" fill="currentColor" />
            <circle cx="16" cy="8" r="1" fill="currentColor" />
            <circle cx="8" cy="16" r="1" fill="currentColor" />
            <circle cx="16" cy="16" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </svg>
        </button>
        <DropCta
          count={count}
          multiLayout={multiLayout}
          onMultiLayoutChange={onMultiLayoutChange}
          onDrop={onInsert}
          label={insertLabel}
          locale={locale}
        />
      </div>
    </Fragment>
  );
}
