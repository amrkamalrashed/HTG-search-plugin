import type { Amenity, AmenityCategory, Offer } from '@shared/types';
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
import { placeIcon, type IconName } from '../icons';

const AMENITY_TO_ICON: Partial<Record<Amenity, IconName>> = {
  wifi: 'wifi',
  air_conditioning: 'snowflake',
  pets_allowed: 'pets',
  smoking_allowed: 'smoking',
  parking: 'parking',
  tv: 'tv',
  kitchen: 'kitchen',
  hair_dryer: 'hair_dryer',
  breakfast: 'breakfast',
  heating: 'heating',
  elevator: 'elevator',
  pool: 'pool',
  hot_tub: 'pool',
  washer: 'clean',
  dryer: 'clean',
  bbq: 'clean',
};

const CATEGORY_LABELS: Record<AmenityCategory, { en: string; de: string; es: string; fr: string }> = {
  internet_tv: { en: 'Internet & TV', de: 'Internet & TV', es: 'Internet y TV', fr: 'Internet & TV' },
  kitchen: { en: 'Kitchen', de: 'Küche', es: 'Cocina', fr: 'Cuisine' },
  bathroom: { en: 'Bathroom', de: 'Badezimmer', es: 'Baño', fr: 'Salle de bain' },
  bedroom: { en: 'Bedroom', de: 'Schlafzimmer', es: 'Dormitorio', fr: 'Chambre' },
  outdoor: { en: 'Outdoor', de: 'Außenbereich', es: 'Exterior', fr: 'Extérieur' },
  cooling_heating: { en: 'Heating & cooling', de: 'Heizung & Kühlung', es: 'Calefacción y aire', fr: 'Chauffage & clim.' },
  parking_accessibility: { en: 'Parking & accessibility', de: 'Parkplatz & Barrierefreiheit', es: 'Aparcamiento y accesibilidad', fr: 'Parking & accessibilité' },
  services: { en: 'Services', de: 'Services', es: 'Servicios', fr: 'Services' },
  policies: { en: 'House rules', de: 'Hausregeln', es: 'Normas', fr: 'Règlement intérieur' },
};

function prettyAmenity(a: Amenity): string {
  return a.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Amenities section. Groups amenities by category if `amenitiesByCategory`
 * is provided, otherwise falls back to a flat list. Each amenity = icon +
 * label on one row. Categories laid out in 2 columns.
 */
export function buildAmenities(
  offer: Offer,
  locale: Locale,
  platform: Platform = 'web',
): FrameNode {
  const m = metrics(platform);
  const section = sectionFrame(`HomeDrop Section · Amenities · ${offer.title}`, platform);

  section.appendChild(sectionHeading(t('amenities', locale), platform));

  const grouped = offer.amenitiesByCategory;
  const innerWidth = m.width - m.padding * 2;

  const grid = figma.createFrame();
  grid.name = 'amenitiesGrid';
  grid.layoutMode = 'HORIZONTAL';
  grid.layoutWrap = 'WRAP';
  grid.primaryAxisSizingMode = 'FIXED';
  grid.counterAxisSizingMode = 'AUTO';
  grid.resizeWithoutConstraints(innerWidth, 1);
  grid.itemSpacing = 16;
  grid.counterAxisSpacing = 20;
  grid.fills = [];

  const renderAmenityRow = (amenity: Amenity): FrameNode | null => {
    const icon = AMENITY_TO_ICON[amenity];
    if (!icon) return null;
    const row = hframe(`amenity_${amenity}`, 10);
    row.appendChild(placeIcon(icon, BRAND.textPrimary));
    row.appendChild(makeText('amenityLabel', prettyAmenity(amenity), FONT.regular, 14, BRAND.textPrimary));
    return row;
  };

  if (grouped && Object.keys(grouped).length > 0) {
    const colWidth = (innerWidth - 16) / 2;
    for (const [cat, items] of Object.entries(grouped) as Array<[AmenityCategory, Amenity[]]>) {
      if (!items || items.length === 0) continue;
      const col = vframe(`cat_${cat}`, 8);
      col.counterAxisSizingMode = 'FIXED';
      col.resizeWithoutConstraints(colWidth, 1);
      col.appendChild(
        makeText(
          'catLabel',
          CATEGORY_LABELS[cat]?.[locale] ?? String(cat),
          FONT.semibold,
          13,
          BRAND.textSecondary,
        ),
      );
      for (const amenity of items) {
        const r = renderAmenityRow(amenity);
        if (r) col.appendChild(r);
      }
      grid.appendChild(col);
    }
  } else {
    for (const amenity of offer.amenities) {
      const r = renderAmenityRow(amenity);
      if (r) grid.appendChild(r);
    }
  }

  section.appendChild(grid);

  if (offer.amenities.length > 0) {
    const showAll = figma.createFrame();
    showAll.name = 'showAllAmenities';
    showAll.layoutMode = 'HORIZONTAL';
    showAll.primaryAxisSizingMode = 'AUTO';
    showAll.counterAxisSizingMode = 'AUTO';
    showAll.paddingLeft = showAll.paddingRight = 18;
    showAll.paddingTop = showAll.paddingBottom = 10;
    showAll.cornerRadius = 999;
    showAll.strokes = [{ type: 'SOLID', color: BRAND.textPrimary }];
    showAll.strokeWeight = 1;
    showAll.fills = [];
    showAll.appendChild(
      makeText(
        'showAllLabel',
        t('amenitiesShowAll', locale, { n: offer.amenities.length }),
        FONT.semibold,
        13,
        BRAND.textPrimary,
      ),
    );
    section.appendChild(showAll);
  }

  return section;
}
