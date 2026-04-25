import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { t } from '@shared/locales';
import { formatPrice } from '@shared/format';
import { BRAND, FONT } from '../brand';
import { placeIcon } from '../icons';
import {
  hframe,
  makeText,
  metrics,
  sectionFrame,
  vframe,
} from './common';

/**
 * Title header section — the top block of the detail page: badges row,
 * title, rating line, location, and a hero price block.
 */
export function buildTitleHeader(
  offer: Offer,
  locale: Locale,
  platform: Platform,
): FrameNode {
  const m = metrics(platform);
  const section = sectionFrame(`HomeDrop Section · Title · ${offer.title}`, platform);
  section.itemSpacing = 6;

  // Badges row (best-effort from offer.badges)
  if (offer.badges.length > 0) {
    const badgesRow = hframe('badges', 6);
    for (const b of offer.badges.slice(0, 3)) {
      const pill = figma.createFrame();
      pill.layoutMode = 'HORIZONTAL';
      pill.primaryAxisSizingMode = 'AUTO';
      pill.counterAxisSizingMode = 'AUTO';
      pill.paddingLeft = pill.paddingRight = 8;
      pill.paddingTop = pill.paddingBottom = 3;
      pill.cornerRadius = 999;
      pill.fills = [{ type: 'SOLID', color: BRAND.violet, opacity: 0.1 }];
      pill.appendChild(
        makeText(
          'badgeText',
          b.replace(/_/g, ' '),
          FONT.semibold,
          10,
          BRAND.violet,
        ),
      );
      badgesRow.appendChild(pill);
    }
    section.appendChild(badgesRow);
  }

  // Title
  const title = makeText(
    '#title',
    offer.title,
    FONT.bold,
    platform === 'web' ? 28 : 22,
    BRAND.textPrimary,
  );
  title.layoutAlign = 'STRETCH';
  title.textAutoResize = 'HEIGHT';
  section.appendChild(title);

  // Rating line
  if (offer.rating) {
    const ratingRow = hframe('#ratingLine', 6);
    ratingRow.counterAxisAlignItems = 'CENTER';
    ratingRow.appendChild(makeText('star', '★', FONT.bold, 14, BRAND.violet));
    ratingRow.appendChild(
      makeText(
        'ratingAvg',
        offer.rating.average.toFixed(1),
        FONT.bold,
        14,
        BRAND.textPrimary,
      ),
    );
    ratingRow.appendChild(
      makeText(
        'ratingCount',
        `(${offer.rating.count.toLocaleString()} ${t('reviews', locale)})`,
        FONT.regular,
        13,
        BRAND.textSecondary,
      ),
    );
    section.appendChild(ratingRow);
  }

  // Location
  const locRow = hframe('locRow', 6);
  locRow.counterAxisAlignItems = 'CENTER';
  locRow.appendChild(placeIcon('pin', BRAND.textSecondary));
  locRow.appendChild(
    makeText(
      '#location',
      `${offer.location.neighborhood ? offer.location.neighborhood + ', ' : ''}${offer.location.city}, ${offer.location.country}`,
      FONT.regular,
      13,
      BRAND.textSecondary,
    ),
  );
  section.appendChild(locRow);

  // Price hero — prominent per-night or total
  const priceBlock = hframe('priceBlock', 8);
  priceBlock.counterAxisAlignItems = 'BASELINE';
  priceBlock.paddingTop = 4;
  priceBlock.appendChild(
    makeText(
      '#pricePerNight',
      formatPrice(offer.price.perNight, offer.price.currency, locale),
      FONT.bold,
      platform === 'web' ? 28 : 22,
      BRAND.textPrimary,
    ),
  );
  priceBlock.appendChild(
    makeText(
      'priceSuffix',
      t('perNightHero', locale),
      FONT.regular,
      13,
      BRAND.textSecondary,
    ),
  );
  section.appendChild(priceBlock);

  if (offer.discount) {
    const strike = makeText(
      '#priceOriginal',
      formatPrice(offer.discount.originalPerNight, offer.price.currency, locale),
      FONT.regular,
      13,
      BRAND.textSecondary,
    );
    strike.textDecoration = 'STRIKETHROUGH';
    section.appendChild(strike);
  }

  return section;
}
