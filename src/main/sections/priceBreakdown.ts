import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { t, type StringKey } from '@shared/locales';
import { formatPrice } from '@shared/format';
import { BRAND, FONT, VIEW_DEAL_GRADIENT } from '../brand';
import {
  hframe,
  makeText,
  metrics,
  sectionFrame,
  sectionHeading,
  vframe,
} from './common';

/**
 * Price breakdown section. Line items (per-night × N, cleaning, service,
 * taxes), a rule, then the total. Always renders in the canvas — if the
 * offer doesn't have `priceBreakdown`, we synthesise a default row from
 * `offer.price`.
 */
export function buildPriceBreakdown(
  offer: Offer,
  locale: Locale,
  platform: Platform = 'web',
): FrameNode {
  const m = metrics(platform);
  const section = sectionFrame(`HTG Section · Price · ${offer.title}`, platform);
  section.appendChild(sectionHeading(t('priceBreakdown', locale), platform));

  const breakdown = offer.priceBreakdown ?? {
    lineItems: [
      {
        key: 'perNight',
        amount: offer.price.total,
        quantity: offer.price.nights,
        quantityLabel: `${formatPrice(offer.price.perNight, offer.price.currency, locale)} × ${offer.price.nights} ${t(offer.price.nights === 1 ? 'forNight' : 'nights', locale, { n: offer.price.nights })}`,
      },
    ],
    total: offer.price.total,
    currency: offer.price.currency,
  };

  const innerWidth = m.width - m.padding * 2;

  for (const item of breakdown.lineItems) {
    const row = hframe(`line_${item.key}`, 8);
    row.primaryAxisAlignItems = 'SPACE_BETWEEN';
    row.counterAxisAlignItems = 'CENTER';
    row.layoutAlign = 'STRETCH';
    row.primaryAxisSizingMode = 'FIXED';
    row.resize(innerWidth, 1);

    const label = item.quantityLabel ?? item.label ?? resolveKeyLabel(item.key, locale);
    row.appendChild(makeText('lineLabel', label, FONT.regular, 14, BRAND.textPrimary));
    row.appendChild(
      makeText(
        'lineAmount',
        formatPrice(item.amount, breakdown.currency, locale),
        FONT.regular,
        14,
        BRAND.textPrimary,
      ),
    );
    section.appendChild(row);
  }

  // Divider
  const divider = figma.createFrame();
  divider.name = 'divider';
  divider.layoutAlign = 'STRETCH';
  divider.resize(innerWidth, 1);
  divider.fills = [{ type: 'SOLID', color: BRAND.border }];
  section.appendChild(divider);

  // Total row
  const totalRow = hframe('totalRow', 8);
  totalRow.primaryAxisAlignItems = 'SPACE_BETWEEN';
  totalRow.counterAxisAlignItems = 'CENTER';
  totalRow.layoutAlign = 'STRETCH';
  totalRow.primaryAxisSizingMode = 'FIXED';
  totalRow.resize(innerWidth, 1);
  totalRow.appendChild(makeText('totalLabel', t('total', locale), FONT.bold, 16, BRAND.textPrimary));
  totalRow.appendChild(
    makeText(
      'totalAmount',
      formatPrice(breakdown.total, breakdown.currency, locale),
      FONT.bold,
      20,
      BRAND.textPrimary,
    ),
  );
  section.appendChild(totalRow);

  // CTA
  const cta = figma.createFrame();
  cta.name = 'viewDealBtn';
  cta.layoutMode = 'HORIZONTAL';
  cta.primaryAxisSizingMode = 'FIXED';
  cta.counterAxisSizingMode = 'AUTO';
  cta.resize(innerWidth, 1);
  cta.primaryAxisAlignItems = 'CENTER';
  cta.counterAxisAlignItems = 'CENTER';
  cta.paddingTop = cta.paddingBottom = 14;
  cta.cornerRadius = 999;
  cta.fills = [VIEW_DEAL_GRADIENT];
  cta.appendChild(makeText('btnLabel', t('viewDeal', locale), FONT.bold, 15, BRAND.white));
  section.appendChild(cta);

  return section;
}

function resolveKeyLabel(key: string, locale: Locale): string {
  const knownKeys: Record<string, StringKey> = {
    cleaning: 'cleanlinessFees',
    serviceFee: 'serviceFee',
    taxes: 'taxes',
    perNight: 'perNight',
  };
  const strKey = knownKeys[key];
  if (strKey) return t(strKey, locale);
  return key;
}
