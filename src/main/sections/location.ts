import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { t } from '@shared/locales';
import { BRAND, FONT } from '../brand';
import { applyImageFill, loadImageHash } from '../images';
import { placeIcon } from '../icons';
import {
  hframe,
  makeText,
  metrics,
  sectionFrame,
  sectionHeading,
  vframe,
} from './common';

/**
 * Location section — static map area with a pin in the centre, plus
 * the address line below. Map is either a bundled placeholder tile
 * (if `offer.mapImageUrl` is set) or a soft-gradient background.
 */
export async function buildLocation(
  offer: Offer,
  locale: Locale,
  platform: Platform,
): Promise<FrameNode> {
  const m = metrics(platform);
  const section = sectionFrame(`HomeDrop Section · Location · ${offer.title}`, platform);
  section.appendChild(sectionHeading(t('location', locale), platform));

  const innerWidth = m.width - m.padding * 2;
  const mapHeight = platform === 'web' ? 280 : 180;

  const map = figma.createFrame();
  map.name = 'mapTile';
  map.layoutAlign = 'STRETCH';
  map.resize(innerWidth, mapHeight);
  map.cornerRadius = 12;
  map.clipsContent = true;

  if (offer.mapImageUrl) {
    const hash = await loadImageHash(offer.mapImageUrl);
    if (hash) applyImageFill(map, hash);
    else map.fills = [{ type: 'SOLID', color: BRAND.surface }];
  } else {
    map.fills = [{ type: 'SOLID', color: BRAND.surface }];
  }

  // Pin marker centered on the map
  const pinBg = figma.createFrame();
  pinBg.resize(40, 40);
  pinBg.cornerRadius = 20;
  pinBg.fills = [{ type: 'SOLID', color: BRAND.violet }];
  pinBg.x = innerWidth / 2 - 20;
  pinBg.y = mapHeight / 2 - 20;
  const pinIcon = placeIcon('pin', BRAND.white);
  pinIcon.x = pinBg.x + 13;
  pinIcon.y = pinBg.y + 13;
  map.appendChild(pinBg);
  map.appendChild(pinIcon);

  section.appendChild(map);

  // Address block
  const addr = vframe('addrBlock', 4);
  addr.appendChild(
    makeText(
      'addrLabel',
      t('address', locale),
      FONT.semibold,
      12,
      BRAND.textSecondary,
    ),
  );
  addr.appendChild(
    makeText(
      '#address',
      offer.address ??
        (offer.location.neighborhood
          ? `${offer.location.neighborhood}, ${offer.location.city}, ${offer.location.country}`
          : `${offer.location.city}, ${offer.location.country}`),
      FONT.regular,
      14,
      BRAND.textPrimary,
    ),
  );
  section.appendChild(addr);

  return section;
}
