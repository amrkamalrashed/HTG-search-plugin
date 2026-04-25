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

const KIND_TO_ICON: Record<string, IconName> = {
  bedroom: 'bed',
  bathroom: 'clean',
  kitchen: 'kitchen',
  living: 'tv',
};

/**
 * Room information section — one card per room (Bedroom No 1 · 1 queen,
 * Bathroom · shower, …). Falls back to a single card derived from
 * `offer.capacity` when `offer.rooms` isn't provided.
 */
export function buildRoomInformation(
  offer: Offer,
  locale: Locale,
  platform: Platform,
): FrameNode {
  const m = metrics(platform);
  const section = sectionFrame(`HomeDrop Section · Rooms · ${offer.title}`, platform);
  section.appendChild(sectionHeading(t('roomInformation', locale), platform));

  const rooms =
    offer.rooms && offer.rooms.length > 0
      ? offer.rooms
      : [
          {
            kind: 'bedroom' as const,
            label: `Bedroom · ${offer.capacity.beds} bed${offer.capacity.beds === 1 ? '' : 's'}`,
          },
          {
            kind: 'bathroom' as const,
            label: `${offer.capacity.bathrooms} bathroom${offer.capacity.bathrooms === 1 ? '' : 's'}`,
          },
        ];

  const innerWidth = m.width - m.padding * 2;

  for (const room of rooms.slice(0, 6)) {
    const card = vframe(`room_${room.label}`, 6);
    card.layoutAlign = 'STRETCH';
    card.primaryAxisSizingMode = 'AUTO';
    card.counterAxisSizingMode = 'FIXED';
    card.resizeWithoutConstraints(innerWidth, 1);
    card.paddingTop = card.paddingBottom = 14;
    card.paddingLeft = card.paddingRight = 14;
    card.cornerRadius = 12;
    card.fills = [{ type: 'SOLID', color: BRAND.surface }];

    const head = hframe('roomHead', 8);
    head.counterAxisAlignItems = 'CENTER';
    head.appendChild(placeIcon(KIND_TO_ICON[room.kind] ?? 'bed', BRAND.textPrimary));
    head.appendChild(makeText('roomLabel', room.label, FONT.semibold, 14, BRAND.textPrimary));
    card.appendChild(head);

    if (room.beds && room.beds.length > 0) {
      const beds = room.beds.map((b) => `${b.count} ${b.type}`).join(' · ');
      card.appendChild(makeText('roomBeds', beds, FONT.regular, 13, BRAND.textSecondary));
    }
    if (room.features && room.features.length > 0) {
      card.appendChild(
        makeText('roomFeatures', room.features.join(' · '), FONT.regular, 13, BRAND.textSecondary),
      );
    }

    section.appendChild(card);
  }

  // "See all rooms" ghost button
  const seeAll = figma.createFrame();
  seeAll.name = 'seeAllRooms';
  seeAll.layoutMode = 'HORIZONTAL';
  seeAll.primaryAxisSizingMode = 'AUTO';
  seeAll.counterAxisSizingMode = 'AUTO';
  seeAll.paddingLeft = seeAll.paddingRight = 16;
  seeAll.paddingTop = seeAll.paddingBottom = 8;
  seeAll.cornerRadius = 999;
  seeAll.strokes = [{ type: 'SOLID', color: BRAND.textPrimary }];
  seeAll.strokeWeight = 1;
  seeAll.fills = [];
  seeAll.appendChild(
    makeText('seeAllLabel', t('seeAllRooms', locale), FONT.semibold, 13, BRAND.textPrimary),
  );
  section.appendChild(seeAll);

  return section;
}
