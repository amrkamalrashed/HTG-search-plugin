import { h } from 'preact';
import type { Offer } from '@shared/types';
import type { SectionKind } from '@shared/messages';
import { SECTION_KINDS } from '@shared/messages';
import styles from '../styles.css';

interface Props {
  offer: Offer;
  selected: Set<SectionKind>;
  onToggle: (kind: SectionKind) => void;
  onBack: () => void;
  onSelectAll: () => void;
  onClear: () => void;
}

const LABELS: Record<SectionKind, { label: string; description: string }> = {
  gallery: {
    label: 'Gallery',
    description: 'Hero + thumbnail grid',
  },
  amenities: {
    label: 'Amenities',
    description: 'Grouped icon + label grid',
  },
  reviews: {
    label: 'Reviews',
    description: 'Overall score + sub-ratings + review cards',
  },
  priceBreakdown: {
    label: 'Price breakdown',
    description: 'Line items, total, CTA',
  },
};

export function DetailView({
  offer,
  selected,
  onToggle,
  onBack,
  onSelectAll,
  onClear,
}: Props) {
  const heroUrl = offer.images[0]?.url;
  return (
    <div class={styles.detail}>
      <div class={styles.detailBreadcrumb}>
        <button class={styles.detailBackBtn} onClick={onBack}>
          ← Properties
        </button>
      </div>

      <div
        class={styles.detailHero}
        style={heroUrl ? { backgroundImage: `url(${heroUrl})` } : undefined}
      >
        <div class={styles.detailHeroOverlay}>
          <div class={styles.detailCategory}>
            {offer.categoryLabel ?? offer.propertyType}
          </div>
          <div class={styles.detailTitle}>{offer.title}</div>
          <div class={styles.detailLocation}>
            {offer.location.neighborhood
              ? `${offer.location.city} ${offer.location.neighborhood}`
              : `${offer.location.city}, ${offer.location.country}`}
          </div>
        </div>
      </div>

      <div class={styles.detailSectionActions}>
        <span class={styles.detailSectionHeading}>Sections to insert</span>
        <div class={styles.detailSectionActionsBtns}>
          <button
            class={styles.bulkBarBtn}
            onClick={onSelectAll}
            disabled={selected.size === SECTION_KINDS.length}
          >
            Select all
          </button>
          <button
            class={styles.bulkBarBtnGhost}
            onClick={onClear}
            disabled={selected.size === 0}
          >
            Clear
          </button>
        </div>
      </div>

      <div class={styles.sectionGrid}>
        {SECTION_KINDS.map((kind) => {
          const info = LABELS[kind];
          const isSelected = selected.has(kind);
          const hasData = sectionHasData(kind, offer);
          return (
            <button
              key={kind}
              class={`${styles.sectionTile} ${isSelected ? styles.sectionTileSelected : ''} ${!hasData ? styles.sectionTileDisabled : ''}`}
              onClick={() => hasData && onToggle(kind)}
              disabled={!hasData}
              title={!hasData ? 'This offer has no data for this section' : undefined}
            >
              <div class={styles.sectionTileLabel}>{info.label}</div>
              <div class={styles.sectionTileDescription}>
                {hasData ? info.description : 'Not available for this offer'}
              </div>
              {isSelected && <span class={styles.sectionTileCheck}>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function sectionHasData(kind: SectionKind, offer: Offer): boolean {
  switch (kind) {
    case 'gallery':
      return offer.images.length > 0;
    case 'amenities':
      return offer.amenities.length > 0;
    case 'reviews':
      return !!offer.reviewDetails || !!offer.rating;
    case 'priceBreakdown':
      return !!offer.priceBreakdown || !!offer.price;
  }
}
