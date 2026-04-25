import { h } from 'preact';
import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import { formatPrice } from '@shared/format';
import styles from '../styles.css';

interface Props {
  offer: Offer;
  /** Anchor rect in viewport coords (the tile being hovered). */
  rect: DOMRect;
  locale: Locale;
}

/**
 * Side-panel preview that appears after a 450 ms hover on a tile.
 * Anchors to the tile's right edge when there's room, otherwise
 * flips to the left. Stays inside the iframe viewport vertically.
 */
export function HoverPeek({ offer, rect, locale }: Props) {
  const PEEK_W = 240;
  const PEEK_H = 220;
  const MARGIN = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = rect.right + MARGIN;
  if (left + PEEK_W > vw - MARGIN) {
    left = rect.left - PEEK_W - MARGIN;
  }
  if (left < MARGIN) left = MARGIN;

  let top = rect.top;
  if (top + PEEK_H > vh - MARGIN) top = vh - PEEK_H - MARGIN;
  if (top < MARGIN) top = MARGIN;

  const heroUrl = offer.images[0]?.url;

  return (
    <div class={styles.hoverPeek} style={{ left: `${left}px`, top: `${top}px` }}>
      <div class={styles.hoverPeekImg} style={heroUrl ? { backgroundImage: `url(${heroUrl})` } : undefined} />
      <div class={styles.hoverPeekBody}>
        <div class={styles.hoverPeekLabel}>{t('uiHoverPeekTitle', locale)}</div>
        <div class={styles.hoverPeekTitle}>{offer.title}</div>
        <div class={styles.hoverPeekMeta}>
          {offer.location.city}, {offer.location.country}
        </div>
        <div class={styles.hoverPeekStats}>
          <div class={styles.hoverPeekStat}>
            <strong>{offer.capacity.guests}</strong>
            <span>{t('uiLabelGuests', locale)}</span>
          </div>
          <div class={styles.hoverPeekStat}>
            <strong>{offer.capacity.bedrooms}</strong>
            <span>{t('uiLabelBedrooms', locale)}</span>
          </div>
          <div class={styles.hoverPeekStat}>
            <strong>
              {formatPrice(offer.price.perNight, offer.price.currency, locale)}
            </strong>
            <span>{t('uiPerNightSlash', locale)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
