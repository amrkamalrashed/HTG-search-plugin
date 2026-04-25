import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { t } from '@shared/locales';
import { BRAND, FONT } from '../brand';
import { placeIcon, type IconName } from '../icons';
import {
  hframe,
  makeText,
  metrics,
  sectionFrame,
  sectionHeading,
  vframe,
} from './common';

const DEFAULT_REASONS: Array<{ iconKey: string; title: string; description: string }> = [
  {
    iconKey: 'check',
    title: 'Free cancellation',
    description: 'Book with flexibility — cancel for free up to 7 days before arrival.',
  },
  {
    iconKey: 'check',
    title: 'Great location',
    description: 'Quiet neighbourhood, minutes from everything you came for.',
  },
  {
    iconKey: 'check',
    title: 'Top-rated host',
    description: 'Consistent 4.8+ ratings on cleanliness, communication, and value.',
  },
];

function iconFor(key: string): IconName {
  const known: Record<string, IconName> = {
    check: 'check',
    heart: 'heart',
    wifi: 'wifi',
    kitchen: 'kitchen',
    parking: 'parking',
    pets: 'pets',
  };
  return known[key] ?? 'check';
}

/**
 * Reasons-to-book section — vertical list of icon + title + description
 * items (typically 3). Falls back to a sensible default list when the
 * offer doesn't supply `reasonsToBook`.
 */
export function buildReasonsToBook(
  offer: Offer,
  locale: Locale,
  platform: Platform,
): FrameNode {
  const section = sectionFrame(`HomeDrop Section · Reasons · ${offer.title}`, platform);
  section.appendChild(sectionHeading(t('reasonsToBook', locale), platform));

  const items =
    offer.reasonsToBook && offer.reasonsToBook.length > 0
      ? offer.reasonsToBook
      : DEFAULT_REASONS;

  for (const reason of items.slice(0, 4)) {
    const row = hframe(`reason_${reason.title}`, 12);
    row.counterAxisAlignItems = 'MIN';
    row.layoutAlign = 'STRETCH';
    row.primaryAxisSizingMode = 'FIXED';
    row.resizeWithoutConstraints(metrics(platform).width - metrics(platform).padding * 2, 1);

    const iconBg = figma.createFrame();
    iconBg.resize(32, 32);
    iconBg.cornerRadius = 999;
    iconBg.fills = [{ type: 'SOLID', color: BRAND.violet, opacity: 0.1 }];
    iconBg.layoutAlign = 'INHERIT';
    const iconNode = placeIcon(iconFor(reason.iconKey), BRAND.violet);
    iconNode.x = 8;
    iconNode.y = 8;
    iconBg.appendChild(iconNode);
    row.appendChild(iconBg);

    // vframe is VERTICAL → primary axis = vertical (column height),
    // counter axis = horizontal (column width). Let the column hug
    // vertically so long descriptions aren't clipped; layoutGrow=1
    // stretches it horizontally to fill the remaining row width.
    const col = vframe('reasonCol', 2);
    col.layoutGrow = 1;
    col.primaryAxisSizingMode = 'AUTO';
    col.counterAxisSizingMode = 'FIXED';
    col.resizeWithoutConstraints(200, 1);
    col.appendChild(
      makeText('reasonTitle', reason.title, FONT.semibold, 14, BRAND.textPrimary),
    );
    if (reason.description) {
      const desc = makeText(
        'reasonDesc',
        reason.description,
        FONT.regular,
        13,
        BRAND.textSecondary,
      );
      desc.layoutAlign = 'STRETCH';
      desc.textAutoResize = 'HEIGHT';
      col.appendChild(desc);
    }
    row.appendChild(col);

    section.appendChild(row);
  }

  return section;
}
