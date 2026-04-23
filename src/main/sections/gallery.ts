import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import { BRAND, FONT } from '../brand';
import { applyImageFill, loadImageHash } from '../images';
import { makeText, sectionFrame, SECTION_WIDTH, SECTION_PADDING } from './common';
import { placeIcon } from '../icons';

const HERO_WIDTH = SECTION_WIDTH - SECTION_PADDING * 2 - 8 - 320;
const HERO_HEIGHT = 420;
const THUMB_WIDTH = 320;
const THUMB_ROW_H = 206;

/**
 * Gallery section. Hero image on the left, a 2×2 grid of thumbnails on
 * the right, and a "Show all N photos" pill on the hero. Adaptive:
 * 1 image → hero only, 2 → hero + one thumb, up to 5 thumbs shown.
 */
export async function buildGallery(offer: Offer, locale: Locale): Promise<FrameNode> {
  const section = sectionFrame(`HTG Section · Gallery · ${offer.title}`);
  section.paddingTop = section.paddingBottom = 0;
  section.paddingLeft = section.paddingRight = 0;
  section.itemSpacing = 0;
  section.cornerRadius = 16;

  const row = figma.createFrame();
  row.name = 'galleryRow';
  row.layoutMode = 'HORIZONTAL';
  row.primaryAxisSizingMode = 'FIXED';
  row.counterAxisSizingMode = 'AUTO';
  row.resize(SECTION_WIDTH, 1);
  row.itemSpacing = 8;
  row.fills = [];
  row.clipsContent = true;

  // Hero
  const hero = figma.createFrame();
  hero.name = '#image';
  hero.resize(HERO_WIDTH, HERO_HEIGHT);
  hero.fills = [{ type: 'SOLID', color: BRAND.surface }];
  hero.clipsContent = true;
  hero.layoutAlign = 'INHERIT';
  const heroUrl = offer.images[0]?.url;
  if (heroUrl) {
    const hash = await loadImageHash(heroUrl);
    if (hash) applyImageFill(hero, hash);
  }

  // Show-all-photos pill on hero
  if (offer.images.length > 1) {
    const pill = figma.createFrame();
    pill.name = 'showAllPhotos';
    pill.layoutMode = 'HORIZONTAL';
    pill.primaryAxisSizingMode = 'AUTO';
    pill.counterAxisSizingMode = 'AUTO';
    pill.paddingLeft = pill.paddingRight = 14;
    pill.paddingTop = pill.paddingBottom = 8;
    pill.cornerRadius = 999;
    pill.fills = [{ type: 'SOLID', color: BRAND.white, opacity: 0.95 }];
    pill.appendChild(
      makeText(
        'showAllText',
        t('galleryShowAll', locale, { n: offer.images.length }),
        FONT.semibold,
        12,
        BRAND.textPrimary,
      ),
    );
    hero.appendChild(pill);
    pill.x = 16;
    pill.y = HERO_HEIGHT - pill.height - 16;
  }

  row.appendChild(hero);

  // Thumbnails 2×2
  if (offer.images.length > 1) {
    const thumbCol = figma.createFrame();
    thumbCol.name = 'thumbs';
    thumbCol.layoutMode = 'VERTICAL';
    thumbCol.primaryAxisSizingMode = 'AUTO';
    thumbCol.counterAxisSizingMode = 'FIXED';
    thumbCol.resize(THUMB_WIDTH, 1);
    thumbCol.itemSpacing = 8;
    thumbCol.fills = [];

    const rowsNeeded = Math.min(2, Math.ceil((offer.images.length - 1) / 2));
    let idx = 1;
    for (let r = 0; r < rowsNeeded; r++) {
      const rowThumbs = figma.createFrame();
      rowThumbs.name = `thumbRow${r}`;
      rowThumbs.layoutMode = 'HORIZONTAL';
      rowThumbs.primaryAxisSizingMode = 'AUTO';
      rowThumbs.counterAxisSizingMode = 'AUTO';
      rowThumbs.itemSpacing = 8;
      rowThumbs.fills = [];

      for (let c = 0; c < 2 && idx < offer.images.length && idx < 5; c++) {
        const thumb = figma.createFrame();
        thumb.name = `thumb${idx}`;
        thumb.resize((THUMB_WIDTH - 8) / 2, THUMB_ROW_H);
        thumb.fills = [{ type: 'SOLID', color: BRAND.surface }];
        thumb.clipsContent = true;
        const url = offer.images[idx]?.url;
        if (url) {
          const hash = await loadImageHash(url);
          if (hash) applyImageFill(thumb, hash);
        }
        rowThumbs.appendChild(thumb);
        idx++;
      }
      thumbCol.appendChild(rowThumbs);
    }
    row.appendChild(thumbCol);
  }

  section.appendChild(row);
  return section;
}
