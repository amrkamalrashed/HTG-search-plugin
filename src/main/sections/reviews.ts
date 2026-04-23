import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { t } from '@shared/locales';
import { BRAND, FONT, VIEW_DEAL_GRADIENT } from '../brand';
import {
  hframe,
  makeText,
  metrics,
  sectionFrame,
  sectionHeading,
  vframe,
} from './common';

const BAR_WIDTH = 160;
const BAR_HEIGHT = 4;

function ratingBar(label: string, score: number): FrameNode {
  const row = hframe(`rating_${label}`, 12);
  row.counterAxisAlignItems = 'CENTER';
  row.primaryAxisAlignItems = 'SPACE_BETWEEN';
  row.layoutAlign = 'STRETCH';
  row.resize(300, 1);
  row.primaryAxisSizingMode = 'FIXED';

  row.appendChild(makeText('label', label, FONT.regular, 13, BRAND.textPrimary));

  const right = hframe('rightRow', 8);
  right.counterAxisAlignItems = 'CENTER';

  const track = figma.createFrame();
  track.name = 'track';
  track.resize(BAR_WIDTH, BAR_HEIGHT);
  track.cornerRadius = BAR_HEIGHT / 2;
  track.fills = [{ type: 'SOLID', color: BRAND.border }];

  const fill = figma.createFrame();
  fill.name = 'fill';
  fill.resize((BAR_WIDTH * Math.min(5, Math.max(0, score))) / 5, BAR_HEIGHT);
  fill.cornerRadius = BAR_HEIGHT / 2;
  fill.fills = [VIEW_DEAL_GRADIENT];
  fill.x = 0;
  fill.y = 0;
  track.appendChild(fill);

  right.appendChild(track);
  right.appendChild(makeText('score', score.toFixed(1), FONT.semibold, 13, BRAND.textPrimary));
  row.appendChild(right);
  return row;
}

/**
 * Reviews section. Overall score block on the left, sub-ratings (cleanliness,
 * location, value, communication) with gradient progress bars on the right,
 * and up to 3 individual review cards below.
 */
export function buildReviews(
  offer: Offer,
  locale: Locale,
  platform: Platform = 'web',
): FrameNode {
  const m = metrics(platform);
  const section = sectionFrame(`HTG Section · Reviews · ${offer.title}`, platform);
  section.appendChild(sectionHeading(t('reviewsHeader', locale), platform));

  const details = offer.reviewDetails;
  if (!details && !offer.rating) {
    // Nothing to render beyond the header — show a brief note.
    section.appendChild(
      makeText(
        'noReviews',
        t('newListing', locale),
        FONT.regular,
        13,
        BRAND.textSecondary,
      ),
    );
    return section;
  }

  // Header strip: overall score + count + sub-ratings
  const headerStrip = platform === 'web'
    ? hframe('headerStrip', 40)
    : (() => {
        const v = vframe('headerStrip', 16);
        v.layoutAlign = 'STRETCH';
        return v;
      })();
  headerStrip.counterAxisAlignItems = 'MIN';
  headerStrip.layoutAlign = 'STRETCH';

  const overallBlock = vframe('overallBlock', 2);
  const overallValue = details?.overall ?? offer.rating?.average ?? 0;
  const verdict =
    overallValue >= 4.7 ? t('ratingOutstanding', locale)
      : overallValue >= 4.3 ? t('ratingExcellent', locale)
        : t('ratingGood', locale);
  const headRow = hframe('headRow', 10);
  headRow.counterAxisAlignItems = 'CENTER';
  headRow.appendChild(
    makeText('overallHuge', overallValue.toFixed(1), FONT.bold, platform === 'web' ? 40 : 32, BRAND.textPrimary),
  );
  const verdictCol = vframe('verdictCol', 2);
  verdictCol.appendChild(makeText('verdict', verdict, FONT.bold, 14, BRAND.textPrimary));
  verdictCol.appendChild(
    makeText(
      'overallLabel',
      `${details?.count ?? offer.rating?.count ?? 0} ${t('reviews', locale)}`,
      FONT.regular,
      13,
      BRAND.textSecondary,
    ),
  );
  headRow.appendChild(verdictCol);
  overallBlock.appendChild(headRow);
  headerStrip.appendChild(overallBlock);

  if (details?.subRatings) {
    const bars = vframe('subBars', 10);
    for (const [key, label] of [
      ['cleanliness', t('ratingCleanliness', locale)],
      ['location', t('ratingLocation', locale)],
      ['value', t('ratingValue', locale)],
      ['communication', t('ratingCommunication', locale)],
    ] as const) {
      const v = details.subRatings[key as keyof typeof details.subRatings];
      if (v === undefined) continue;
      bars.appendChild(ratingBar(label, v));
    }
    headerStrip.appendChild(bars);
  }
  section.appendChild(headerStrip);

  // Individual reviews
  if (details?.items?.length) {
    const innerWidth = m.width - m.padding * 2;
    const reviewsRow = figma.createFrame();
    reviewsRow.name = 'reviewsRow';
    reviewsRow.layoutMode = platform === 'web' ? 'HORIZONTAL' : 'VERTICAL';
    // Sizing modes are axis-relative: primary = layout direction, counter
    // = perpendicular. Swap them with the layout mode so the fixed width
    // and hugged height always line up on the right axes.
    if (platform === 'web') {
      reviewsRow.primaryAxisSizingMode = 'FIXED'; // horizontal = FIXED width
      reviewsRow.counterAxisSizingMode = 'AUTO'; // vertical = hug
    } else {
      reviewsRow.primaryAxisSizingMode = 'AUTO'; // vertical = hug
      reviewsRow.counterAxisSizingMode = 'FIXED'; // horizontal = FIXED width
    }
    reviewsRow.resize(innerWidth, 1);
    reviewsRow.itemSpacing = platform === 'web' ? 16 : 12;
    reviewsRow.fills = [];

    const cardWidth = platform === 'web' ? (innerWidth - 32) / 3 : innerWidth;

    for (const item of details.items.slice(0, 3)) {
      const card = vframe(`review_${item.author}`, 8);
      card.counterAxisSizingMode = 'FIXED';
      card.resize(cardWidth, 1);
      card.paddingTop = card.paddingBottom = 16;
      card.paddingLeft = card.paddingRight = 16;
      card.cornerRadius = 12;
      card.fills = [{ type: 'SOLID', color: BRAND.surface }];

      const authorRow = hframe('authorRow', 10);
      authorRow.counterAxisAlignItems = 'CENTER';
      const avatar = figma.createEllipse();
      avatar.resize(32, 32);
      avatar.fills = [VIEW_DEAL_GRADIENT];
      authorRow.appendChild(avatar);
      const nameCol = vframe('nameCol', 2);
      nameCol.appendChild(makeText('author', item.author, FONT.semibold, 13, BRAND.textPrimary));
      nameCol.appendChild(makeText('date', item.date, FONT.regular, 11, BRAND.textSecondary));
      authorRow.appendChild(nameCol);
      card.appendChild(authorRow);

      const stars = hframe('stars', 2);
      for (let i = 0; i < 5; i++) {
        stars.appendChild(
          makeText(
            'star',
            '★',
            FONT.bold,
            12,
            i < item.rating ? BRAND.violet : BRAND.border,
          ),
        );
      }
      card.appendChild(stars);

      const body = makeText('body', item.text, FONT.regular, 13, BRAND.textPrimary);
      body.layoutAlign = 'STRETCH';
      body.textAutoResize = 'HEIGHT';
      card.appendChild(body);

      reviewsRow.appendChild(card);
    }

    section.appendChild(reviewsRow);
  }

  return section;
}
