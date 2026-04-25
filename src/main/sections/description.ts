import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { t } from '@shared/locales';
import { BRAND, FONT } from '../brand';
import { makeText, metrics, sectionFrame, sectionHeading } from './common';

/**
 * Description section — `offer.fullDescription` with a "See more" ghost
 * button. Falls back to `offer.shortDescription` when no full text is set.
 */
export function buildDescription(
  offer: Offer,
  locale: Locale,
  platform: Platform,
): FrameNode {
  const m = metrics(platform);
  const section = sectionFrame(`HomeDrop Section · Description · ${offer.title}`, platform);
  section.appendChild(sectionHeading(t('description', locale), platform));

  const text = offer.fullDescription ?? offer.shortDescription ?? '';
  if (text) {
    const body = makeText('#description', text, FONT.regular, 14, BRAND.textPrimary);
    body.layoutAlign = 'STRETCH';
    body.textAutoResize = 'HEIGHT';
    body.lineHeight = { value: 150, unit: 'PERCENT' };
    section.appendChild(body);
  }

  if (offer.highlights && offer.highlights.length > 0) {
    for (const h of offer.highlights.slice(0, 4)) {
      const bullet = makeText('highlight', `· ${h}`, FONT.regular, 13, BRAND.textSecondary);
      section.appendChild(bullet);
    }
  }

  const seeMore = figma.createFrame();
  seeMore.name = 'seeMore';
  seeMore.layoutMode = 'HORIZONTAL';
  seeMore.primaryAxisSizingMode = 'AUTO';
  seeMore.counterAxisSizingMode = 'AUTO';
  seeMore.paddingLeft = seeMore.paddingRight = 0;
  seeMore.paddingTop = 4;
  seeMore.fills = [];
  seeMore.appendChild(
    makeText('seeMoreLabel', t('seeMore', locale), FONT.semibold, 13, BRAND.violet),
  );
  section.appendChild(seeMore);

  return section;
}
