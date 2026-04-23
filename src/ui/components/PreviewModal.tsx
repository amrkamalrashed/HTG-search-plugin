import { h } from 'preact';
import styles from '../styles.css';
import type { Offer } from '@shared/types';
import { formatPrice } from '@shared/format';

interface Props {
  offer: Offer;
  onClose: () => void;
  onInsert: () => void;
}

export function PreviewModal({ offer, onClose, onInsert }: Props) {
  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div
          class={styles.modalImage}
          style={{ backgroundImage: `url(${offer.images[0]?.url})` }}
        >
          <button class={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <div class={styles.modalBody}>
          <h2 class={styles.modalTitle}>{offer.title}</h2>
          <div class={styles.modalLocation}>
            {offer.location.city}
            {offer.location.region ? `, ${offer.location.region}` : ''}, {offer.location.country}
          </div>

          <div class={styles.modalStatsRow}>
            <div class={styles.modalStat}>
              <div class={styles.modalStatValue}>{offer.capacity.guests}</div>
              <div class={styles.modalStatLabel}>Guests</div>
            </div>
            <div class={styles.modalStat}>
              <div class={styles.modalStatValue}>{offer.capacity.bedrooms}</div>
              <div class={styles.modalStatLabel}>Bedrooms</div>
            </div>
            <div class={styles.modalStat}>
              <div class={styles.modalStatValue}>{offer.capacity.bathrooms}</div>
              <div class={styles.modalStatLabel}>Baths</div>
            </div>
            <div class={styles.modalStat}>
              <div class={styles.modalStatValue}>
                {offer.rating ? offer.rating.average.toFixed(1) : '—'}
              </div>
              <div class={styles.modalStatLabel}>
                {offer.rating ? `${offer.rating.count} reviews` : 'New'}
              </div>
            </div>
          </div>

          {offer.shortDescription && (
            <p class={styles.modalDescription}>{offer.shortDescription}</p>
          )}

          <div class={styles.modalSection}>
            <div class={styles.modalSectionLabel}>Amenities</div>
            <div class={styles.amenityGrid}>
              {offer.amenities.map((a) => (
                <span key={a} class={styles.amenityChip}>
                  {a.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          <div class={styles.modalSection}>
            <div class={styles.modalPriceRow}>
              {offer.discount && (
                <span class={styles.modalPriceOriginal}>
                  {formatPrice(offer.discount.originalPerNight, offer.price.currency)}
                </span>
              )}
              <span class={styles.modalPrice}>
                {formatPrice(offer.price.perNight, offer.price.currency)}
              </span>
              <span class={styles.modalPriceSuffix}>/ night</span>
            </div>
            <div class={styles.modalProvider}>
              by {offer.provider.name} · {offer.price.nights} nights:{' '}
              {formatPrice(offer.price.total, offer.price.currency)} total
            </div>
          </div>
        </div>
        <div class={styles.modalActions}>
          <button
            class={`${styles.btn} ${styles.btnPrimary} ${styles.modalActionsBtn}`}
            onClick={onInsert}
          >
            Insert into canvas
          </button>
        </div>
      </div>
    </div>
  );
}
