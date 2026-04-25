import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { t } from '@shared/locales';
import { BRAND, FONT } from '../brand';
import {
  hframe,
  makeText,
  metrics,
  sectionFrame,
  sectionHeading,
  vframe,
} from './common';

const DEFAULT_TIERS = [
  { label: 'Free cancellation', description: 'Cancel for free up to 7 days before arrival.', refundPct: 100 },
  { label: '50% refund', description: 'Cancel up to 48h before arrival for a 50% refund.', refundPct: 50 },
  { label: 'No refund', description: 'Cancellations within 48h of arrival are non-refundable.', refundPct: 0 },
];

function refundColor(pct?: number): RGB {
  if (pct === undefined) return BRAND.textSecondary;
  if (pct >= 100) return BRAND.greatDealGreen;
  if (pct >= 50) return BRAND.violet;
  return BRAND.coral;
}

/**
 * Cancellation policy section — refund tiers rendered as stacked
 * cards with a colored left rail (green → violet → coral).
 */
export function buildCancellationPolicy(
  offer: Offer,
  locale: Locale,
  platform: Platform,
): FrameNode {
  const m = metrics(platform);
  const section = sectionFrame(`HomeDrop Section · Cancellation · ${offer.title}`, platform);
  section.appendChild(sectionHeading(t('cancellationPolicy', locale), platform));

  const tiers = offer.cancellationPolicy?.tiers ?? DEFAULT_TIERS;
  const innerWidth = m.width - m.padding * 2;

  for (const tier of tiers) {
    const card = figma.createFrame();
    card.name = `tier_${tier.label}`;
    card.layoutMode = 'HORIZONTAL';
    card.primaryAxisSizingMode = 'FIXED';
    card.counterAxisSizingMode = 'AUTO';
    card.resizeWithoutConstraints(innerWidth, 1);
    card.cornerRadius = 12;
    card.fills = [{ type: 'SOLID', color: BRAND.surface }];
    card.clipsContent = true;

    const rail = figma.createFrame();
    rail.resizeWithoutConstraints(4, 1);
    rail.layoutAlign = 'STRETCH';
    rail.fills = [{ type: 'SOLID', color: refundColor(tier.refundPct) }];
    card.appendChild(rail);

    const content = vframe('tierContent', 4);
    content.paddingTop = content.paddingBottom = 12;
    content.paddingLeft = 14;
    content.paddingRight = 14;
    content.layoutGrow = 1;

    content.appendChild(makeText('tierLabel', tier.label, FONT.semibold, 14, BRAND.textPrimary));
    if (tier.description) {
      const d = makeText(
        'tierDesc',
        tier.description,
        FONT.regular,
        13,
        BRAND.textSecondary,
      );
      d.layoutAlign = 'STRETCH';
      d.textAutoResize = 'HEIGHT';
      content.appendChild(d);
    }

    card.appendChild(content);
    section.appendChild(card);
  }

  return section;
}
