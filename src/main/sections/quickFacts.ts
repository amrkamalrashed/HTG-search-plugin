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

interface Fact {
  icon: IconName;
  label: string;
}

/**
 * Quick-facts section — a 2-column icon+label grid summarising the
 * most-asked property stats (bedrooms, bathrooms, guests, kitchen,
 * pets). Drawn adaptively: only real facts on the offer are shown.
 */
export function buildQuickFacts(
  offer: Offer,
  locale: Locale,
  platform: Platform,
): FrameNode {
  const m = metrics(platform);
  const section = sectionFrame(`HomeDrop Section · Quick facts · ${offer.title}`, platform);
  section.appendChild(sectionHeading(t('quickFacts', locale), platform));

  const facts: Fact[] = [];
  facts.push({
    icon: 'bed',
    label: `${offer.capacity.bedrooms} ${t('bedrooms', locale)}`,
  });
  facts.push({
    icon: 'bed',
    label: `${offer.capacity.beds} ${t('beds', locale)}`,
  });
  facts.push({
    icon: 'clean',
    label: `${offer.capacity.bathrooms} ${t('bathrooms', locale)}`,
  });
  facts.push({
    icon: 'pets',
    label: `${offer.capacity.guests} ${t('guests', locale)}`,
  });
  if (offer.amenities.includes('kitchen')) facts.push({ icon: 'kitchen', label: 'Kitchen' });
  if (offer.amenities.includes('wifi')) facts.push({ icon: 'wifi', label: 'Wi-Fi' });
  if (offer.amenities.includes('pets_allowed')) facts.push({ icon: 'pets', label: 'Pet-friendly' });
  if (offer.amenities.includes('parking')) facts.push({ icon: 'parking', label: 'Parking' });

  const innerWidth = m.width - m.padding * 2;
  const colWidth = (innerWidth - 12) / 2;

  const grid = figma.createFrame();
  grid.name = 'factsGrid';
  grid.layoutMode = 'HORIZONTAL';
  grid.layoutWrap = 'WRAP';
  grid.primaryAxisSizingMode = 'FIXED';
  grid.counterAxisSizingMode = 'AUTO';
  grid.resizeWithoutConstraints(innerWidth, 1);
  grid.itemSpacing = 12;
  grid.counterAxisSpacing = 12;
  grid.fills = [];

  for (const fact of facts.slice(0, 6)) {
    // hframe is HORIZONTAL → primary axis = horizontal (row width),
    // counter axis = vertical (row height). Fix width at colWidth and
    // let the row hug vertically.
    const row = hframe(`fact_${fact.label}`, 10);
    row.primaryAxisSizingMode = 'FIXED';
    row.counterAxisAlignItems = 'CENTER';
    row.resizeWithoutConstraints(colWidth, 1);
    row.appendChild(placeIcon(fact.icon, BRAND.textPrimary));
    row.appendChild(
      makeText('factLabel', fact.label, FONT.regular, 14, BRAND.textPrimary),
    );
    grid.appendChild(row);
  }

  section.appendChild(grid);
  return section;
}
