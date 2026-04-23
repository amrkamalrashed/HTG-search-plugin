import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { emit } from '@create-figma-plugin/utilities';
import type { Offer } from '@shared/types';
import type { InsertHandler, InsertMode, LoadedPayload } from '@shared/messages';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FilterBar, type Filters } from './components/FilterBar';
import { ProductTile } from './components/ProductTile';
import { PreviewModal } from './components/PreviewModal';
import styles from './styles.css';

export function App(props: LoadedPayload) {
  const [mode, setMode] = useState<InsertMode>('single');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);

  const offers = props.offers;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return offers.filter((o) => {
      if (q) {
        const hay = `${o.title} ${o.location.city} ${o.location.country}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.propertyType && o.propertyType !== filters.propertyType) return false;
      if (filters.minRating && (!o.rating || o.rating.average < filters.minRating)) return false;
      if (filters.priceMax && o.price.perNight > filters.priceMax) return false;
      if (filters.minGuests && o.capacity.guests < filters.minGuests) return false;
      return true;
    });
  }, [offers, search, filters]);

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

  const insert = (offerOverride?: Offer) => {
    const payload: Offer[] = offerOverride
      ? [offerOverride]
      : offers.filter((o) => selectedIds.has(o.id));
    if (payload.length === 0) return;
    emit<InsertHandler>('INSERT', {
      offers: payload,
      mode: offerOverride ? 'single' : mode,
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(visible.map((o) => o.id)));
  };

  const previewOffer = previewId ? offers.find((o) => o.id === previewId) : null;
  const count = selectedIds.size;

  const insertLabel = () => {
    if (count === 0) return 'Select a property';
    if (mode === 'single') return count === 1 ? 'Insert' : `Insert ${count}`;
    if (mode === 'list') return count === 1 ? 'Insert as list' : `Insert ${count} as list`;
    return count === 1 ? 'Insert as grid' : `Insert ${count} as grid`;
  };

  const showBulkBar = mode !== 'single';

  return (
    <div class={styles.root}>
      <Header mode={mode} onModeChange={handleModeChange} />
      <SearchBar value={search} onChange={setSearch} />
      <FilterBar filters={filters} onChange={setFilters} />

      {showBulkBar && (
        <div class={styles.bulkBar}>
          <span class={styles.bulkBarText}>
            {count === 0
              ? `Pick multiple properties to insert as ${mode}`
              : `${count} selected`}
          </span>
          <button class={styles.bulkBarBtn} onClick={selectAllVisible}>
            Select all {visible.length}
          </button>
        </div>
      )}

      <div class={styles.scroll}>
        {visible.length === 0 ? (
          <div class={styles.empty}>No properties match your filters.</div>
        ) : (
          <div class={styles.grid}>
            {visible.map((o) => (
              <ProductTile
                key={o.id}
                offer={o}
                selected={selectedIds.has(o.id)}
                onToggle={() => toggle(o.id)}
                onPreview={() => setPreviewId(o.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div class={styles.footer}>
        <div class={`${styles.footerInfo} ${count > 0 ? styles.footerInfoActive : ''}`}>
          {count === 0
            ? `${visible.length} of ${offers.length} properties`
            : `${count} selected`}
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
        />
      )}
    </div>
  );
}
