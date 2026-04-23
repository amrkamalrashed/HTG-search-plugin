import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { emit } from '@create-figma-plugin/utilities';
import type { Offer } from '@shared/types';
import type {
  InsertHandler,
  InsertMode,
  LoadedPayload,
  RefreshHandler,
  SaveStateHandler,
  SectionKind,
  SortKey,
  UiState,
} from '@shared/messages';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FilterBar, type Filters } from './components/FilterBar';
import { SortBar } from './components/SortBar';
import { LocaleBar } from './components/LocaleBar';
import { ProductTile } from './components/ProductTile';
import { PreviewModal } from './components/PreviewModal';
import { DetailView } from './components/DetailView';
import styles from './styles.css';

const DEFAULT_STATE: UiState = {
  mode: 'single',
  search: '',
  sort: 'default',
  gridColumns: 2,
  locale: 'en',
  platform: 'web',
  filters: {},
};

type Level = 'search' | 'detail';

export function App(props: LoadedPayload) {
  const saved: UiState = { ...DEFAULT_STATE, ...(props.savedState ?? {}) };

  const [level, setLevel] = useState<Level>('search');
  const [detailOfferId, setDetailOfferId] = useState<string | null>(null);
  const [selectedSections, setSelectedSections] = useState<Set<SectionKind>>(new Set());

  const [mode, setMode] = useState<InsertMode>(saved.mode);
  const [search, setSearch] = useState(saved.search);
  const [sort, setSort] = useState<SortKey>(saved.sort);
  const [gridColumns, setGridColumns] = useState<number>(saved.gridColumns);
  const [locale, setLocale] = useState<Locale>(saved.locale);
  const [platform, setPlatform] = useState<Platform>(saved.platform);
  const [filters, setFilters] = useState<Filters>(saved.filters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);

  const offers = props.offers;

  useEffect(() => {
    const handle = setTimeout(() => {
      emit<SaveStateHandler>('SAVE_STATE', {
        mode,
        search,
        sort,
        gridColumns,
        locale,
        platform,
        filters,
      });
    }, 250);
    return () => clearTimeout(handle);
  }, [mode, search, sort, gridColumns, locale, platform, filters]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = offers.filter((o) => {
      if (q) {
        const hay = `${o.title} ${o.location.city} ${o.location.country} ${o.location.neighborhood ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.propertyType && o.propertyType !== filters.propertyType) return false;
      if (filters.minRating && (!o.rating || o.rating.average < filters.minRating)) return false;
      if (filters.priceMax && o.price.perNight > filters.priceMax) return false;
      if (filters.minGuests && o.capacity.guests < filters.minGuests) return false;
      return true;
    });
    return sortOffers(filtered, sort);
  }, [offers, search, filters, sort]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (mode === 'single') {
        next.clear();
        if (!prev.has(id)) next.add(id);
      } else {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  };

  const handleModeChange = (m: InsertMode) => {
    setMode(m);
    if (m === 'single' && selectedIds.size > 1) {
      const first = Array.from(selectedIds)[0];
      setSelectedIds(new Set([first]));
    }
  };

  const openDetail = (offerId: string) => {
    setDetailOfferId(offerId);
    setSelectedSections(new Set());
    setLevel('detail');
  };

  const backToSearch = () => {
    setLevel('search');
    setDetailOfferId(null);
    setSelectedSections(new Set());
  };

  const toggleSection = (kind: SectionKind) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  const insert = (offerOverride?: Offer) => {
    const payload: Offer[] = offerOverride
      ? [offerOverride]
      : offers.filter((o) => selectedIds.has(o.id));
    if (payload.length === 0) return;
    emit<InsertHandler>('INSERT', {
      kind: 'cards',
      offers: payload,
      mode: offerOverride ? 'single' : mode,
      gridColumns,
      locale,
      platform,
    });
  };

  const insertSections = () => {
    if (!detailOfferId || selectedSections.size === 0) return;
    emit<InsertHandler>('INSERT', {
      kind: 'sections',
      offerId: detailOfferId,
      sections: Array.from(selectedSections),
      locale,
      platform,
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(visible.map((o) => o.id)));
  };
  const clearSelection = () => setSelectedIds(new Set());
  const clearAllFilters = () => {
    setFilters({});
    setSearch('');
    setSort('default');
  };
  const selectAllSections = () =>
    setSelectedSections(new Set<SectionKind>(['gallery', 'amenities', 'reviews', 'priceBreakdown']));
  const clearAllSections = () => setSelectedSections(new Set());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inInput =
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
      if (e.key === 'Escape') {
        if (previewId) {
          setPreviewId(null);
          e.preventDefault();
        } else if (level === 'detail') {
          backToSearch();
          e.preventDefault();
        } else if (selectedIds.size > 0) {
          clearSelection();
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'Enter' && !inInput) {
        if (level === 'detail' && selectedSections.size > 0) {
          insertSections();
          e.preventDefault();
        } else if (level === 'search' && selectedIds.size > 0) {
          insert();
          e.preventDefault();
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && level === 'search' && mode !== 'single') {
        e.preventDefault();
        selectAllVisible();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIds, previewId, mode, visible, level, selectedSections, detailOfferId]);

  const previewOffer = previewId ? offers.find((o) => o.id === previewId) : null;
  const detailOffer = detailOfferId ? offers.find((o) => o.id === detailOfferId) : null;
  const count = selectedIds.size;

  const insertLabel = () => {
    if (count === 0) return 'Select a property';
    if (mode === 'single') return count === 1 ? 'Insert' : `Insert ${count}`;
    if (mode === 'list') return count === 1 ? 'Insert as list' : `Insert ${count} as list`;
    return count === 1 ? 'Insert as grid' : `Insert ${count} as grid`;
  };

  const showBulkBar = level === 'search' && mode !== 'single';
  const hasActiveFilters =
    !!search ||
    sort !== 'default' ||
    Object.values(filters).some((v) => v !== undefined);

  if (level === 'detail' && detailOffer) {
    return (
      <div class={styles.root}>
        <Header
          mode={mode}
          onModeChange={handleModeChange}
          onRefresh={() => emit<RefreshHandler>('REFRESH')}
        />
        <LocaleBar
          locale={locale}
          onLocaleChange={setLocale}
          platform={platform}
          onPlatformChange={setPlatform}
        />
        <DetailView
          offer={detailOffer}
          selected={selectedSections}
          onToggle={toggleSection}
          onBack={backToSearch}
          onSelectAll={selectAllSections}
          onClear={clearAllSections}
        />
        <div class={styles.footer}>
          <div class={`${styles.footerInfo} ${selectedSections.size > 0 ? styles.footerInfoActive : ''}`}>
            {selectedSections.size === 0
              ? 'Pick sections to insert'
              : `${selectedSections.size} section${selectedSections.size === 1 ? '' : 's'} · ⏎ to insert`}
          </div>
          <button
            class={`${styles.btn} ${styles.btnPrimary}`}
            onClick={insertSections}
            disabled={selectedSections.size === 0}
          >
            {selectedSections.size === 0
              ? 'Select sections'
              : selectedSections.size === 1
                ? 'Insert section'
                : `Insert ${selectedSections.size} sections`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class={styles.root}>
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        onRefresh={() => emit<RefreshHandler>('REFRESH')}
      />
      <LocaleBar
        locale={locale}
        onLocaleChange={setLocale}
        platform={platform}
        onPlatformChange={setPlatform}
      />
      <SearchBar value={search} onChange={setSearch} />
      <FilterBar filters={filters} onChange={setFilters} />
      <SortBar
        count={visible.length}
        total={offers.length}
        sort={sort}
        onSortChange={setSort}
        mode={mode}
        gridColumns={gridColumns}
        onGridColumnsChange={setGridColumns}
      />

      {showBulkBar && (
        <div class={styles.bulkBar}>
          <span class={styles.bulkBarText}>
            {count === 0
              ? `Pick properties to insert as ${mode}`
              : `${count} selected`}
          </span>
          <div class={styles.bulkBarActions}>
            <button
              class={styles.bulkBarBtn}
              onClick={selectAllVisible}
              disabled={count === visible.length}
            >
              Select all {visible.length}
            </button>
            <button
              class={styles.bulkBarBtnGhost}
              onClick={clearSelection}
              disabled={count === 0}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div class={styles.scroll}>
        {visible.length === 0 ? (
          <div class={styles.empty}>
            <div class={styles.emptyIcon}>⌕</div>
            <div class={styles.emptyTitle}>No properties match</div>
            <div class={styles.emptySubtitle}>
              Try widening the filters or searching for a different city.
            </div>
            {hasActiveFilters && (
              <button class={styles.emptyBtn} onClick={clearAllFilters}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div class={styles.grid}>
            {visible.map((o) => (
              <ProductTile
                key={o.id}
                offer={o}
                selected={selectedIds.has(o.id)}
                onToggle={() => toggle(o.id)}
                onPreview={() => setPreviewId(o.id)}
                onOpen={() => openDetail(o.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div class={styles.footer}>
        <div class={`${styles.footerInfo} ${count > 0 ? styles.footerInfoActive : ''}`}>
          {count === 0
            ? hintFor(mode)
            : `${count} selected · ⏎ to insert`}
        </div>
        <button
          class={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => insert()}
          disabled={count === 0}
        >
          {insertLabel()}
        </button>
      </div>

      {previewOffer && (
        <PreviewModal
          offer={previewOffer}
          onClose={() => setPreviewId(null)}
          onInsert={() => {
            insert(previewOffer);
            setPreviewId(null);
          }}
          onOpenDetail={() => {
            setPreviewId(null);
            openDetail(previewOffer.id);
          }}
        />
      )}
    </div>
  );
}

function hintFor(mode: InsertMode): string {
  if (mode === 'single') return 'Click a property to select';
  if (mode === 'list') return 'Pick multiple to stack as a list';
  return 'Pick multiple to arrange as a grid';
}

function sortOffers(offers: Offer[], key: SortKey): Offer[] {
  const a = [...offers];
  switch (key) {
    case 'priceAsc':
      a.sort((x, y) => x.price.perNight - y.price.perNight);
      break;
    case 'priceDesc':
      a.sort((x, y) => y.price.perNight - x.price.perNight);
      break;
    case 'ratingDesc':
      a.sort((x, y) => (y.rating?.average ?? 0) - (x.rating?.average ?? 0));
      break;
    case 'newest':
      a.sort((x, y) => {
        const xNew = x.badges.includes('new_listing') ? 1 : 0;
        const yNew = y.badges.includes('new_listing') ? 1 : 0;
        return yNew - xNew;
      });
      break;
    case 'default':
    default:
      break;
  }
  return a;
}
