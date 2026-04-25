import { h } from 'preact';
import type { Offer } from '@shared/types';
import type { SectionKind } from '@shared/messages';
import { SECTION_KINDS } from '@shared/messages';
import type { Locale, StringKey } from '@shared/locales';
import { t } from '@shared/locales';
import styles from '../styles.css';

interface Props {
  offer: Offer;
  selected: Set<SectionKind>;
  onToggle: (kind: SectionKind) => void;
  onBack: () => void;
  onSelectAll: () => void;
  onClear: () => void;
  onSectionDragStart?: (kind: SectionKind, e: DragEvent) => void;
  locale: Locale;
}

const TILE_KEYS: Record<SectionKind, { label: StringKey; desc: StringKey }> = {
  gallery: { label: 'uiTileGallery', desc: 'uiTileGalleryDesc' },
  titleHeader: { label: 'uiTileTitleHeader', desc: 'uiTileTitleHeaderDesc' },
  quickFacts: { label: 'uiTileQuickFacts', desc: 'uiTileQuickFactsDesc' },
  reasonsToBook: { label: 'uiTileReasonsToBook', desc: 'uiTileReasonsToBookDesc' },
  reviews: { label: 'uiTileReviews', desc: 'uiTileReviewsDesc' },
  amenities: { label: 'uiTileAmenities', desc: 'uiTileAmenitiesDesc' },
  roomInformation: { label: 'uiTileRoomInformation', desc: 'uiTileRoomInformationDesc' },
  description: { label: 'uiTileDescription', desc: 'uiTileDescriptionDesc' },
  houseRules: { label: 'uiTileHouseRules', desc: 'uiTileHouseRulesDesc' },
  location: { label: 'uiTileLocation', desc: 'uiTileLocationDesc' },
  priceBreakdown: { label: 'uiTilePriceBreakdown', desc: 'uiTilePriceBreakdownDesc' },
  cancellationPolicy: { label: 'uiTileCancellationPolicy', desc: 'uiTileCancellationPolicyDesc' },
};

export function DetailView({
  offer,
  selected,
  onToggle,
  onBack,
  onSelectAll,
  onClear,
  onSectionDragStart,
  locale,
}: Props) {
  const heroUrl = offer.images[0]?.url;
  return (
    <div class={styles.detail}>
      <div class={styles.detailBreadcrumb}>
        <button class={styles.detailBackBtn} onClick={onBack}>
          ← {t('uiBreadcrumbProperties', locale)}
        </button>
      </div>

      <div
        class={styles.detailHero}
        style={heroUrl ? { backgroundImage: `url(${heroUrl})` } : undefined}
      >
        <div class={styles.detailHeroOverlay}>
          <div class={styles.detailCategory}>
            {offer.categoryLabel ?? t(offer.propertyType as StringKey, locale)}
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
        <span class={styles.detailSectionHeading}>{t('uiSectionsToInsert', locale)}</span>
        <div class={styles.detailSectionActionsBtns}>
          <button
            class={styles.bulkBarBtn}
            onClick={onSelectAll}
            disabled={selected.size === SECTION_KINDS.length}
          >
            {t('uiSelectAll', locale)}
          </button>
          <button
            class={styles.bulkBarBtnGhost}
            onClick={onClear}
            disabled={selected.size === 0}
          >
            {t('uiClear', locale)}
          </button>
        </div>
      </div>

      <div class={styles.sectionGrid}>
        {SECTION_KINDS.map((kind) => {
          const keys = TILE_KEYS[kind];
          const isSelected = selected.has(kind);
          const hasData = sectionHasData(kind, offer);
          return (
            <button
              key={kind}
              class={`${styles.sectionTile} ${isSelected ? styles.sectionTileSelected : ''} ${!hasData ? styles.sectionTileDisabled : ''}`}
              onClick={() => hasData && onToggle(kind)}
              disabled={!hasData}
              draggable={hasData && !!onSectionDragStart}
              onDragStart={(e) => hasData && onSectionDragStart?.(kind, e as unknown as DragEvent)}
              title={!hasData ? t('uiTileNotAvailable', locale) : undefined}
            >
              <div class={styles.sectionTileLabel}>{t(keys.label, locale)}</div>
              <div class={styles.sectionTileDescription}>
                {hasData ? t(keys.desc, locale) : t('uiTileNotAvailable', locale)}
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
    case 'titleHeader':
      return true;
    case 'quickFacts':
      return true;
    case 'reasonsToBook':
      return true;
    case 'reviews':
      return !!offer.reviewDetails || !!offer.rating;
    case 'amenities':
      return offer.amenities.length > 0;
    case 'roomInformation':
      return true;
    case 'description':
      return !!offer.fullDescription || !!offer.shortDescription;
    case 'houseRules':
      return true;
    case 'location':
      return true;
    case 'priceBreakdown':
      return !!offer.priceBreakdown || !!offer.price;
    case 'cancellationPolicy':
      return true;
  }
}
