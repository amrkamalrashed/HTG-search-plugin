import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import { formatPrice } from '@shared/format';

/**
 * Build a custom drag-preview image for a tile and attach it to the
 * DataTransfer. The browser snapshots the DOM node at dragstart time,
 * so we render a small detached node off-screen and clean it up next
 * tick. Returns the cleanup function.
 */
export function attachDragImage(
  e: DragEvent,
  offer: Offer,
  locale: Locale,
): () => void {
  if (!e.dataTransfer) return () => {};

  const ghost = document.createElement('div');
  ghost.className = 'htg-drag-ghost';
  ghost.style.cssText = [
    'position: fixed',
    'top: -1000px',
    'left: -1000px',
    'width: 220px',
    'background: var(--htg-card)',
    'border: 1px solid var(--htg-border)',
    'border-radius: 10px',
    'overflow: hidden',
    'box-shadow: 0 8px 24px rgba(14,24,36,0.18)',
    "font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    'font-size: 12px',
    'color: var(--htg-text)',
  ].join(';');

  const heroUrl = offer.images[0]?.url ?? '';
  const img = document.createElement('div');
  img.style.cssText = [
    'height: 110px',
    `background: var(--htg-surface) url("${heroUrl}") center / cover no-repeat`,
  ].join(';');
  ghost.appendChild(img);

  const body = document.createElement('div');
  body.style.cssText = 'padding: 8px 10px 10px';
  const title = document.createElement('div');
  title.style.cssText = 'font-weight: 700; line-height: 1.2;';
  title.textContent = offer.title;
  const meta = document.createElement('div');
  meta.style.cssText = 'font-size: 11px; color: var(--htg-text-muted); margin-top: 2px;';
  meta.textContent = `${offer.location.city} · ${formatPrice(offer.price.perNight, offer.price.currency, locale)}`;
  body.appendChild(title);
  body.appendChild(meta);
  ghost.appendChild(body);

  document.body.appendChild(ghost);
  e.dataTransfer.setDragImage(ghost, 24, 24);

  // Browsers need the element to live until the snapshot is taken;
  // clean up next tick.
  const cleanup = () => {
    if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
  };
  setTimeout(cleanup, 0);
  return cleanup;
}
