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
} from './common';

const DEFAULT_RULES: Array<{ iconKey: string; text: string; allowed?: boolean }> = [
  { iconKey: 'smoking', text: 'Smoking not allowed', allowed: false },
  { iconKey: 'pets', text: 'Pets allowed', allowed: true },
  { iconKey: 'check', text: 'Check-in from 3pm', allowed: true },
  { iconKey: 'check', text: 'Check-out before 11am', allowed: true },
];

function iconFor(key: string): IconName {
  const known: Record<string, IconName> = {
    smoking: 'smoking',
    pets: 'pets',
    check: 'check',
  };
  return known[key] ?? 'check';
}

/**
 * House-rules section — bullet-icon list. Uses `offer.houseRules` if
 * set, otherwise a sensible default derived from amenity flags.
 */
export function buildHouseRules(
  offer: Offer,
  locale: Locale,
  platform: Platform,
): FrameNode {
  const section = sectionFrame(`HomeDrop Section · Rules · ${offer.title}`, platform);
  section.appendChild(sectionHeading(t('houseRules', locale), platform));

  const rules = offer.houseRules && offer.houseRules.length > 0
    ? offer.houseRules
    : DEFAULT_RULES;

  for (const rule of rules.slice(0, 8)) {
    const row = hframe(`rule_${rule.text}`, 10);
    row.counterAxisAlignItems = 'CENTER';
    row.layoutAlign = 'STRETCH';
    const tint = rule.allowed === false ? BRAND.coral : BRAND.textSecondary;
    row.appendChild(placeIcon(iconFor(rule.iconKey), tint));
    row.appendChild(makeText('ruleText', rule.text, FONT.regular, 14, BRAND.textPrimary));
    section.appendChild(row);
  }

  return section;
}
