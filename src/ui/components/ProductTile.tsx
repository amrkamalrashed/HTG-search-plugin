import { h } from 'preact';
import styles from '../styles.css';
import type { Offer } from '@shared/types';
import { formatPrice } from '@shared/format';

interface Props {
  offer: Offer;
  selected: boolean;
  onToggle: () => void;
  onPreview: () => void;
  onOpen: () => void;
}

export function ProductTile({ offer, selected, onToggle, onPreview, onOpen }: Props) {
  const badge = offer.badges[0];
  const isDeal = badge === 'great_deal';

  return (
    <div
      class={`${styles.tile} ${selected ? styles.tileSelected : ''}`}
      onClick={onToggle}
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
        {selected && <span class={styles.tileCheck}>✓</span>}
        <div class={styles.tileHoverActions}>
          <button
            class={styles.tileHoverBtn}
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            title="Preview details"
          >
            i
          </button>
          <button
            class={styles.tileHoverBtn}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            title="Open property detail (insert sections)"
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
              {formatPrice(offer.discount.originalPerNight, offer.price.currency)}
            </span>
          )}
          <span class={styles.tilePrice}>
            {formatPrice(offer.price.perNight, offer.price.currency)}
          </span>
          <span class={styles.tilePriceSuffix}>/ night</span>
        </div>
      </div>
    </div>
  );
}
