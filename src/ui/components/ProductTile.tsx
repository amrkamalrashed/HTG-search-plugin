import { h } from 'preact';
import styles from '../styles.css';
import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import { formatPrice } from '@shared/format';

interface Props {
  offer: Offer;
  selected: boolean;
  favourite: boolean;
  /** When true, render a brief outline pulse (canvas selection echo). */
  pulse?: boolean;
  onToggle: (e: MouseEvent) => void;
  onPreview: () => void;
  onOpen: () => void;
  onToggleFavourite: () => void;
  onMouseEnter?: (rect: DOMRect) => void;
  onMouseLeave?: () => void;
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  locale: Locale;
}

export function ProductTile({
  offer,
  selected,
  favourite,
  pulse,
  onToggle,
  onPreview,
  onOpen,
  onToggleFavourite,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDragEnd,
  locale,
}: Props) {
  const badge = offer.badges[0];
  const isDeal = badge === 'great_deal';

  return (
    <div
      class={`${styles.tile} ${selected ? styles.tileSelected : ''} ${pulse ? styles.tilePulse : ''}`}
      onClick={(e) => onToggle(e as unknown as MouseEvent)}
      data-offer-id={offer.id}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={(e) => {
        if (onMouseEnter) {
          onMouseEnter((e.currentTarget as HTMLElement).getBoundingClientRect());
        }
      }}
      onMouseLeave={onMouseLeave}
    >
      <div
        class={styles.tileImage}
        style={{ backgroundImage: `url(${offer.images[0]?.url})` }}
      >
        {badge && (
          <span class={`${styles.tileBadge} ${isDeal ? styles.tileBadgeGreen : ''}`}>
            {badge.replace(/_/g, ' ')}
          </span>
        )}
        {offer.discount && (
          <span class={styles.tileDiscount}>-{offer.discount.percent}%</span>
        )}
        <button
          class={`${styles.tileFavBtn} ${favourite ? styles.tileFavBtnActive : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavourite();
          }}
          title={t(favourite ? 'uiFavouriteRemove' : 'uiFavouriteAdd', locale)}
          aria-pressed={favourite}
        >
          {favourite ? '★' : '☆'}
        </button>
        {selected && <span class={styles.tileCheck}>✓</span>}
        <div class={styles.tileHoverActions}>
          <button
            class={styles.tileHoverBtn}
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            title={t('uiPreviewTooltip', locale)}
          >
            i
          </button>
          <button
            class={styles.tileHoverBtn}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            title={t('uiOpenDetails', locale)}
          >
            →
          </button>
        </div>
      </div>
      <div class={styles.tileBody}>
        <div class={styles.tileTitleRow}>
          <div class={styles.tileTitle}>{offer.title}</div>
          {offer.rating && (
            <span class={styles.tileRating}>
              <span class={styles.tileRatingStar}>★</span>
              {offer.rating.average.toFixed(1)}
            </span>
          )}
        </div>
        <div class={styles.tileLocation}>
          {offer.location.city}, {offer.location.country}
        </div>
        <div class={styles.tilePriceRow}>
          {offer.discount && (
            <span class={styles.tilePriceOriginal}>
              {formatPrice(offer.discount.originalPerNight, offer.price.currency, locale)}
            </span>
          )}
          <span class={styles.tilePrice}>
            {formatPrice(offer.price.perNight, offer.price.currency, locale)}
          </span>
          <span class={styles.tilePriceSuffix}>{t('uiPerNightSlash', locale)}</span>
        </div>
      </div>
    </div>
  );
}
