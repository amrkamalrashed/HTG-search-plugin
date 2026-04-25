import { Fragment, h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { emit, on } from '@create-figma-plugin/utilities';
import type { Offer } from '@shared/types';
import type {
  FindAllHandler,
  HighlightHandler,
  InsertHandler,
  InsertMode,
  MultiLayout,
  InsertedHandler,
  ToastMessage,
  LoadedPayload,
  UiPreset,
  RefreshHandler,
  ResizeHandler,
  SaveStateHandler,
  SaveUiSizeHandler,
  SectionKind,
  SortKey,
  SyncOffersHandler,
  Theme,
  UiSize,
  UiState,
  UndoHandler,
} from '@shared/messages';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { defaultOffersSource, type OffersSource, type SearchQuery } from './offers-source';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FilterBar, type Filters } from './components/FilterBar';
import { SortBar } from './components/SortBar';
import { LocaleBar } from './components/LocaleBar';
import { ProductTile } from './components/ProductTile';
import { DropCta } from './components/DropCta';
import { DetailView } from './components/DetailView';
import { ResizeHandle } from './components/ResizeHandle';
import { Toast } from './components/Toast';
import { CommandPalette, type PaletteCommand } from './components/CommandPalette';
import { attachDragImage, attachSectionDragImage } from './dragImage';
import { applyTheme } from './theme';
import styles from './styles.css';

const DEFAULT_STATE: UiState = {
  multiLayout: 'list',
  search: '',
  sort: 'default',
  gridColumns: 2,
  locale: 'en',
  platform: 'web',
  filters: {},
  theme: 'auto',
};

const DEFAULT_SIZE: UiSize = { width: 420, height: 720 };
const MIN_SIZE: UiSize = { width: 360, height: 480 };
const MAX_SIZE: UiSize = { width: 900, height: 1200 };

type Level = 'search' | 'detail';

/**
 * Migrate the legacy `mode` field on saved UiState into `multiLayout`. Old
 * sessions that persisted mode='single' fall back to multiLayout='list' (the
 * single-card case is now derived from selection count, not stored).
 */
function readSavedState(raw: Partial<UiState> & { mode?: InsertMode } | undefined): UiState {
  const merged: UiState = { ...DEFAULT_STATE, ...(raw ?? {}) };
  if (raw && !raw.multiLayout && raw.mode) {
    merged.multiLayout = raw.mode === 'grid' ? 'grid' : 'list';
  }
  return merged;
}

export function App(props: LoadedPayload) {
  const saved = readSavedState(props.savedState);

  const [level, setLevel] = useState<Level>('search');
  const [detailOfferId, setDetailOfferId] = useState<string | null>(null);
  const [selectedSections, setSelectedSections] = useState<Set<SectionKind>>(new Set());

  const [multiLayout, setMultiLayout] = useState<MultiLayout>(saved.multiLayout);
  const [search, setSearch] = useState(saved.search);
  const [sort, setSort] = useState<SortKey>(saved.sort);
  const [gridColumns, setGridColumns] = useState<number>(saved.gridColumns);
  const [locale, setLocale] = useState<Locale>(saved.locale);
  const [platform, setPlatform] = useState<Platform>(saved.platform);
  const [filters, setFilters] = useState<Filters>(saved.filters);
  const [theme, setTheme] = useState<Theme>(saved.theme ?? 'auto');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [uiSize, setUiSize] = useState<UiSize>(props.uiSize ?? DEFAULT_SIZE);
  const [favourites, setFavourites] = useState<Set<string>>(
    new Set(saved.favourites ?? []),
  );
  const [anchorId, setAnchorId] = useState<string | null>(null);

  // v0.7 chunk 2: toast + palette + presets + confetti
  const [presets, setPresets] = useState<UiPreset[]>(saved.presets ?? []);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    nodeIds: string[];
    seq: number;
  } | null>(null);
  // Persistent undo handle — outlives the toast's 5 s timeout so a
  // designer who looked away can still revert the most recent drop.
  // Cleared by clicking the footer Undo pill or replaced by the next
  // drop that produced node ids.
  const [lastUndo, setLastUndo] = useState<{ nodeIds: string[]; label: string } | null>(null);

  // v0.7 chunk 3: canvas → UI awareness
  const [pulseId, setPulseId] = useState<string | null>(null);
  const pulseTimerRef = useRef<number | null>(null);

  // v0.8: catalogue lives in the UI iframe via OffersSource. The
  // `offers` state is the result of the most recent source.search()
  // call — already filtered, sorted, and localized server-side
  // (in v2) or in-process (today's JsonOffersSource).
  const [source] = useState<OffersSource>(() => defaultOffersSource);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  // Apply theme on mount and whenever it changes.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Catalogue fetch. Re-runs on every input that the API would
  // re-evaluate server-side: locale, search text, filters, sort. With
  // the JSON impl the work is in-process (cheap); with the v2 API impl
  // each change is a network round-trip and the loading state shows.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    const query: SearchQuery = {
      locale,
      text: search.trim() || undefined,
      filters: {
        propertyType: filters.propertyType,
        minRating: filters.minRating,
        priceMax: filters.priceMax,
        minGuests: filters.minGuests,
      },
      sort,
    };
    source
      .search(query)
      .then((next) => {
        if (cancelled) return;
        // Apply favouritesOnly client-side. The server doesn't know
        // which offers the user has starred locally.
        const filtered = filters.favouritesOnly
          ? next.filter((o) => favourites.has(o.id))
          : next;
        setOffers(filtered);
        setLoading(false);
        // Sync the unfiltered (server-side) list to main so Refresh /
        // DROP / native drop can resolve any offer by id.
        emit<SyncOffersHandler>('SYNC_OFFERS', { offers: next, locale });
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [source, locale, search, filters, sort, favourites, reloadTick]);

  // Listen for INSERT_RESULT from main → show a toast with optional Undo
  // and stash the node ids so the footer Undo pill can outlive the toast.
  useEffect(() => {
    const off = on<InsertedHandler>('INSERTED', (payload: ToastMessage) => {
      setToast({
        message: payload.label,
        nodeIds: payload.createdNodeIds,
        seq: Date.now(),
      });
      if (payload.createdNodeIds.length > 0) {
        setLastUndo({ nodeIds: payload.createdNodeIds, label: payload.label });
      }
    });
    return () => off();
  }, []);

  // Canvas selection echo: when a tagged HTG card is selected on the
  // canvas, the corresponding tile gets a brief outline pulse so the
  // designer can see which property the canvas selection refers to.
  // We also scroll the tile into view if it isn't already.
  useEffect(() => {
    const off = on<HighlightHandler>('HIGHLIGHT_OFFER', ({ offerId }) => {
      if (!offerId) {
        setPulseId(null);
        return;
      }
      setPulseId(offerId);
      if (pulseTimerRef.current !== null) {
        window.clearTimeout(pulseTimerRef.current);
      }
      pulseTimerRef.current = window.setTimeout(() => {
        setPulseId(null);
      }, 1400);
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-offer-id="${offerId}"]`);
        if (el && 'scrollIntoView' in el) {
          (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
    return () => {
      off();
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
    };
  }, []);

  // Persist UI state, debounced. clientStorage is on the main thread so
  // we drip the saves rather than firing per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      emit<SaveStateHandler>('SAVE_STATE', {
        multiLayout,
        search,
        sort,
        gridColumns,
        locale,
        platform,
        filters,
        theme,
        favourites: Array.from(favourites),
        presets,
      });
    }, 250);
    return () => clearTimeout(handle);
  }, [
    multiLayout,
    search,
    sort,
    gridColumns,
    locale,
    platform,
    filters,
    theme,
    favourites,
    presets,
  ]);

  // Filtering / sorting / localization moved into OffersSource.search
  // — `offers` is already the visible list. The local catalogue
  // (`offers` state) is what the source returned for the current
  // query. Keep a fast id → offer lookup for detailOfferId.
  const visible = offers;
  const offersById = useMemo(() => {
    const m = new Map<string, Offer>();
    for (const o of offers) m.set(o.id, o);
    return m;
  }, [offers]);

  /**
   * Tile-click handler. Mirrors the section-grid behaviour in
   * DetailView: plain click toggles the tile in/out of the selection
   * (no replace-on-click), so clicking three tiles in a row gives a
   * three-tile selection. Selection count drives the engine mode
   * (single vs list vs grid) — there is no separate "single mode".
   *
   * - plain click / cmd / ctrl click: toggle this id in/out. Plain
   *   click also moves the anchor; cmd / ctrl deliberately doesn't.
   * - shift + click: add the [anchor, id] range to the selection.
   */
  const toggle = (id: string, e?: MouseEvent) => {
    const shift = !!e && e.shiftKey;
    const meta = !!e && (e.metaKey || e.ctrlKey);

    if (shift && anchorId) {
      const ordered = visible.map((o) => o.id);
      const a = ordered.indexOf(anchorId);
      const b = ordered.indexOf(id);
      if (a >= 0 && b >= 0) {
        const [lo, hi] = a < b ? [a, b] : [b, a];
        const range = ordered.slice(lo, hi + 1);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          for (const r of range) next.add(r);
          return next;
        });
        return;
      }
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (!meta) setAnchorId(id);
  };

  const toggleFavourite = (id: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  /** Engine-side mode derived from selection count + the user's preferred multi layout. */
  const engineMode: InsertMode =
    selectedIds.size <= 1 ? 'single' : multiLayout;

  const insert = (offerOverride?: Offer) => {
    const payload: Offer[] = offerOverride
      ? [offerOverride]
      : offers.filter((o) => selectedIds.has(o.id));
    if (payload.length === 0) return;
    emit<InsertHandler>('INSERT', {
      kind: 'cards',
      offers: payload,
      mode: offerOverride || payload.length === 1 ? 'single' : multiLayout,
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
  const selectAllSections = () => {
    const available = (['gallery', 'titleHeader', 'quickFacts', 'reasonsToBook', 'reviews', 'amenities', 'roomInformation', 'description', 'houseRules', 'location', 'priceBreakdown', 'cancellationPolicy'] as SectionKind[]).filter(
      (k) => sectionHasData(k, offers.find((o) => o.id === detailOfferId)),
    );
    setSelectedSections(new Set<SectionKind>(available));
  };
  const clearAllSections = () => setSelectedSections(new Set());

  const randomize = () => {
    if (visible.length === 0) return;
    const pick = visible[Math.floor(Math.random() * visible.length)];
    setSelectedIds(new Set([pick.id]));
    // Scroll the picked tile into view.
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-offer-id="${pick.id}"]`);
      if (el && 'scrollIntoView' in el) {
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  const onTileDragStart = (offer: Offer, e: DragEvent) => {
    if (!e.dataTransfer) return;
    // Set the MIME types Figma's figma.on('drop') handler dispatches on.
    // We send three flavours so downstream code can differentiate single
    // vs multi vs section drops without having to inspect the body shape.
    const isMulti = selectedIds.size > 1 && selectedIds.has(offer.id);
    if (isMulti) {
      const ids = Array.from(selectedIds);
      const body = { offerIds: ids, locale, platform, mode: multiLayout };
      e.dataTransfer.setData(
        'application/htg-offer-multi',
        JSON.stringify(body),
      );
    } else {
      const body = { offerId: offer.id, locale, platform };
      e.dataTransfer.setData(
        'application/htg-offer',
        JSON.stringify(body),
      );
    }
    // text/plain fallback so non-Figma drop targets get something readable.
    e.dataTransfer.setData('text/plain', offer.title);
    e.dataTransfer.effectAllowed = 'copy';
    attachDragImage(e, offer, locale);
  };

  const onSectionDragStart = (offer: Offer, kind: SectionKind, e: DragEvent) => {
    if (!e.dataTransfer) return;
    const body = { offerId: offer.id, sectionKind: kind, locale, platform };
    e.dataTransfer.setData('application/htg-section', JSON.stringify(body));
    e.dataTransfer.setData('text/plain', `${kind} · ${offer.title}`);
    e.dataTransfer.effectAllowed = 'copy';
    attachSectionDragImage(e, sectionDragLabel(kind, locale));
  };

  // Canvas drops are handled exclusively by the main thread's
  // figma.on('drop') registration, which gets accurate canvas coords
  // and the node under the cursor. The iframe's dragend deliberately
  // does nothing — doing so would create a duplicate card alongside
  // the one figma.on('drop') already placed.

  // Resize: live-resize while dragging the corner handle, persist on commit.
  const handleResize = (s: UiSize) => {
    setUiSize(s);
    emit<ResizeHandler>('RESIZE', s);
  };
  const handleResizeCommit = (s: UiSize) => {
    emit<SaveUiSizeHandler>('SAVE_UI_SIZE', s);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inInput =
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
      // ⌘K / Ctrl+K opens the command palette regardless of focus.
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape') {
        if (paletteOpen) {
          setPaletteOpen(false);
          e.preventDefault();
          return;
        }
        if (level === 'detail') {
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
      // R = randomize, when focus isn't in a text field.
      if ((e.key === 'r' || e.key === 'R') && !inInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (level === 'search') {
          e.preventDefault();
          randomize();
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && level === 'search') {
        e.preventDefault();
        selectAllVisible();
      }
      // ⌘Z / Ctrl+Z fires the persistent footer Undo so designers'
      // muscle memory works inside the plugin too. Skipped while the
      // user is typing in an input.
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z') && !inInput && lastUndo) {
        e.preventDefault();
        emit<UndoHandler>('UNDO', { nodeIds: lastUndo.nodeIds });
        setLastUndo(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIds, multiLayout, visible, level, selectedSections, detailOfferId, paletteOpen, lastUndo]);

  const detailOffer = detailOfferId ? offersById.get(detailOfferId) ?? null : null;
  const count = selectedIds.size;

  // Plugin's primary CTA reads "Drop". When the user has selected 2+
  // properties the CTA reflects the active multiLayout preference; a
  // chevron next to the button opens a menu to switch layout.
  const insertLabel = () => {
    if (count === 0) return t('uiSelectAProperty', locale);
    if (count === 1) return t('uiDrop', locale);
    return multiLayout === 'list'
      ? t('uiDropNAsList', locale, { n: count })
      : t('uiDropNAsGrid', locale, { n: count });
  };

  const showBulkBar = level === 'search' && count >= 2;
  const hasActiveFilters =
    !!search ||
    sort !== 'default' ||
    Object.values(filters).some((v) => v !== undefined);

  const savePreset = (rawName: string) => {
    const name = rawName.trim();
    if (!name) return;
    const preset: UiPreset = {
      id: `preset-${Date.now()}`,
      label: name,
      multiLayout,
      platform,
      locale,
      gridColumns,
      sort,
    };
    setPresets((p) => [...p, preset]);
    setToast({
      message: t('uiPresetSaved', locale, { name: preset.label }),
      nodeIds: [],
      seq: Date.now(),
    });
  };

  const applyPreset = (p: UiPreset) => {
    setMultiLayout(p.multiLayout);
    setPlatform(p.platform);
    setLocale(p.locale);
    setGridColumns(p.gridColumns);
    setSort(p.sort);
  };

  // Build the palette command list. Order: actions → quick toggles
  // (mode/platform/locale/theme) → presets.
  const paletteCommands: PaletteCommand[] = useMemo(() => {
    const cmds: PaletteCommand[] = [
      {
        id: 'random',
        label: t('uiPaletteRandom', locale),
        hint: 'R',
        run: randomize,
      },
      {
        id: 'refresh',
        label: t('uiPaletteRefresh', locale),
        run: () => emit<RefreshHandler>('REFRESH'),
      },
      {
        id: 'find-all',
        label: t('uiPaletteFindAll', locale),
        run: () => emit<FindAllHandler>('FIND_ALL'),
      },
      {
        id: 'drop',
        label: t('uiPaletteDrop', locale),
        run: () => insert(),
      },
    ];

    const layouts: MultiLayout[] = ['list', 'grid'];
    for (const m of layouts) {
      cmds.push({
        id: `layout-${m}`,
        label: t('uiPaletteSetLayout', locale, {
          value: t(m === 'list' ? 'uiLayoutList' : 'uiLayoutGrid', locale),
        }),
        run: () => setMultiLayout(m),
      });
    }
    const platforms: Platform[] = ['web', 'ios', 'android'];
    for (const p of platforms) {
      cmds.push({
        id: `platform-${p}`,
        label: t('uiPaletteSetPlatform', locale, { value: p }),
        run: () => setPlatform(p),
      });
    }
    const locales: Locale[] = ['en', 'de', 'es', 'fr'];
    for (const l of locales) {
      cmds.push({
        id: `locale-${l}`,
        label: t('uiPaletteSetLocale', locale, { value: l.toUpperCase() }),
        run: () => setLocale(l),
      });
    }
    const themes: Theme[] = ['auto', 'light', 'dark'];
    for (const th of themes) {
      cmds.push({
        id: `theme-${th}`,
        label: t('uiPaletteSetTheme', locale, {
          value: t(themeLabelKey(th), locale),
        }),
        run: () => setTheme(th),
      });
    }
    for (const p of presets) {
      cmds.push({
        id: `preset-${p.id}`,
        label: t('uiPaletteApplyPreset', locale, { value: p.label }),
        run: () => applyPreset(p),
      });
    }
    return cmds;
  }, [locale, presets, multiLayout, platform, gridColumns, sort, theme, visible]);

  const deletePreset = (id: string) =>
    setPresets((all) => all.filter((p) => p.id !== id));

  // Build a smart default preset name from the live settings so the
  // user can usually just press Enter ("Web · EN · 3 cols").
  const platformLabel = (() => {
    const map: Record<Platform, string> = { web: 'Web', ios: 'iOS', android: 'Android' };
    return map[platform];
  })();
  const layoutLabel = multiLayout === 'grid' ? `${gridColumns} cols` : 'list';
  const presetDefaultName = `${platformLabel} · ${locale.toUpperCase()} · ${layoutLabel}`;

  const headerProps = {
    onRefresh: () => emit<RefreshHandler>('REFRESH'),
    onFindAll: () => emit<FindAllHandler>('FIND_ALL'),
    theme,
    onThemeChange: setTheme,
    presets,
    onApplyPreset: applyPreset,
    onSavePreset: savePreset,
    onDeletePreset: deletePreset,
    presetDefaultName,
    locale,
  };

  const overlays = (
    <Fragment>
      {toast && (
        <Toast
          key={toast.seq}
          message={toast.message}
          locale={locale}
          onDismiss={() => setToast(null)}
          onUndo={
            toast.nodeIds.length > 0
              ? () => {
                  emit<UndoHandler>('UNDO', { nodeIds: toast.nodeIds });
                  setToast(null);
                }
              : undefined
          }
        />
      )}
      <CommandPalette
        open={paletteOpen}
        commands={paletteCommands}
        onClose={() => setPaletteOpen(false)}
        locale={locale}
      />
    </Fragment>
  );

  if (level === 'detail' && detailOffer) {
    return (
      <div class={styles.root}>
        <Header {...headerProps} />
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
          onSectionDragStart={(kind, e) => onSectionDragStart(detailOffer, kind, e)}
          onCardDragStart={(e) => onTileDragStart(detailOffer, e)}
          locale={locale}
        />
        <div class={styles.footer}>
          <div class={`${styles.footerInfo} ${selectedSections.size > 0 ? styles.footerInfoActive : ''}`}>
            {selectedSections.size === 0
              ? t('uiPickSectionsToInsert', locale)
              : selectedSections.size === 1
                ? t('uiNSection', locale, { n: 1 })
                : t('uiNSections', locale, { n: selectedSections.size })}
          </div>
          <button
            class={`${styles.btn} ${styles.btnPrimary}`}
            onClick={insertSections}
            disabled={selectedSections.size === 0}
          >
            {selectedSections.size === 0
              ? t('uiSelectSections', locale)
              : selectedSections.size === 1
                ? t('uiInsertSection', locale)
                : t('uiInsertNSections', locale, { n: selectedSections.size })}
          </button>
        </div>
        <ResizeHandle
          size={uiSize}
          min={MIN_SIZE}
          max={MAX_SIZE}
          onResize={handleResize}
          onCommit={handleResizeCommit}
        />
        {overlays}
      </div>
    );
  }

  return (
    <div class={styles.root}>
      <Header {...headerProps} />
      <LocaleBar
        locale={locale}
        onLocaleChange={setLocale}
        platform={platform}
        onPlatformChange={setPlatform}
      />
      <SearchBar value={search} onChange={setSearch} locale={locale} />
      <FilterBar
        filters={filters}
        onChange={setFilters}
        favouritesCount={favourites.size}
        locale={locale}
      />
      <SortBar
        count={visible.length}
        total={offers.length}
        sort={sort}
        onSortChange={setSort}
        multiLayout={multiLayout}
        gridColumns={gridColumns}
        onGridColumnsChange={setGridColumns}
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
              onClick={selectAllVisible}
              disabled={count === visible.length}
            >
              {t('uiSelectAllN', locale, { n: visible.length })}
            </button>
            <button
              class={styles.bulkBarBtnGhost}
              onClick={clearSelection}
              disabled={count === 0}
            >
              {t('uiClear', locale)}
            </button>
          </div>
        </div>
      )}

      <div class={styles.scroll}>
        {loading ? (
          <div
            class={styles.grid}
            style={{
              gridTemplateColumns: `repeat(${
                multiLayout === 'grid' ? Math.max(2, Math.min(4, gridColumns)) : 2
              }, 1fr)`,
            }}
          >
            {Array.from({ length: multiLayout === 'grid' ? Math.max(2, Math.min(4, gridColumns)) * 2 : 6 }).map((_, i) => (
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
            <button
              class={styles.emptyBtn}
              onClick={() => setReloadTick((n) => n + 1)}
            >
              {t('uiLoadErrorRetry', locale)}
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div class={styles.empty}>
            <div class={styles.emptyIcon}>⌕</div>
            <div class={styles.emptyTitle}>{t('uiNoMatchTitle', locale)}</div>
            <div class={styles.emptySubtitle}>
              {t('uiNoMatchHint', locale)}
            </div>
            {hasActiveFilters && (
              <button class={styles.emptyBtn} onClick={clearAllFilters}>
                {t('uiClearAllFilters', locale)}
              </button>
            )}
          </div>
        ) : (
          <div
            class={styles.grid}
            style={{
              gridTemplateColumns: `repeat(${
                multiLayout === 'grid' ? Math.max(2, Math.min(4, gridColumns)) : 2
              }, 1fr)`,
            }}
          >
            {visible.map((o) => (
              <ProductTile
                key={o.id}
                offer={o}
                selected={selectedIds.has(o.id)}
                favourite={favourites.has(o.id)}
                pulse={pulseId === o.id}
                onToggle={(e) => toggle(o.id, e)}
                onToggleFavourite={() => toggleFavourite(o.id)}
                onOpen={() => openDetail(o.id)}
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
              setLastUndo(null);
            }}
            title={lastUndo.label}
          >
            ↺ {t('uiToastUndo', locale)}
          </button>
        )}
        <button
          class={styles.footerRandomBtn}
          onClick={randomize}
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
          onMultiLayoutChange={setMultiLayout}
          onDrop={() => insert()}
          label={insertLabel()}
          locale={locale}
        />
      </div>

      <ResizeHandle
        size={uiSize}
        min={MIN_SIZE}
        max={MAX_SIZE}
        onResize={handleResize}
        onCommit={handleResizeCommit}
      />

      {overlays}
    </div>
  );
}

function themeLabelKey(th: Theme): 'uiThemeAuto' | 'uiThemeLight' | 'uiThemeDark' {
  if (th === 'light') return 'uiThemeLight';
  if (th === 'dark') return 'uiThemeDark';
  return 'uiThemeAuto';
}

function sectionHasData(kind: SectionKind, offer: Offer | undefined): boolean {
  if (!offer) return false;
  switch (kind) {
    case 'gallery':
      return offer.images.length > 0;
    case 'reviews':
      return !!offer.reviewDetails || !!offer.rating;
    case 'amenities':
      return offer.amenities.length > 0;
    case 'description':
      return !!offer.fullDescription || !!offer.shortDescription;
    case 'priceBreakdown':
      return !!offer.priceBreakdown || !!offer.price;
    default:
      return true;
  }
}

function sectionDragLabel(kind: SectionKind, locale: Locale): string {
  const tileKey = `uiTile${kind.charAt(0).toUpperCase()}${kind.slice(1)}` as
    | 'uiTileGallery'
    | 'uiTileTitleHeader'
    | 'uiTileQuickFacts'
    | 'uiTileReasonsToBook'
    | 'uiTileReviews'
    | 'uiTileAmenities'
    | 'uiTileRoomInformation'
    | 'uiTileDescription'
    | 'uiTileHouseRules'
    | 'uiTileLocation'
    | 'uiTilePriceBreakdown'
    | 'uiTileCancellationPolicy';
  return t(tileKey, locale);
}

