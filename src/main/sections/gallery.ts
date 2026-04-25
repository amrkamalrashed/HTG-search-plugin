import type { Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { t } from '@shared/locales';
import { BRAND, FONT } from '../brand';
import { applyImageFill, loadImageHash } from '../images';
import { makeText, metrics, sectionFrame } from './common';

/**
 * Gallery section. Web: hero + 2×2 thumbnail grid side-by-side.
 * Mobile: full-width hero, then 2×2 thumbnail grid below.
 */
export async function buildGallery(
  offer: Offer,
  locale: Locale,
  platform: Platform = 'web',
): Promise<FrameNode> {
  const m = metrics(platform);
  const section = sectionFrame(`HomeDrop Section · Gallery · ${offer.title}`, platform);
  section.paddingTop = section.paddingBottom = 0;
  section.paddingLeft = section.paddingRight = 0;
  section.itemSpacing = 8;
  section.cornerRadius = 16;
  section.clipsContent = true;

  const isWeb = platform === 'web';
  const width = m.width;
  const heroWidth = isWeb ? width - 8 - 320 : width;
  const heroHeight = isWeb ? 420 : 280;
  const thumbWidth = isWeb ? 320 : width;
  const thumbRowH = isWeb ? 206 : 100;

  if (isWeb) {
    const row = figma.createFrame();
    row.name = 'galleryRow';
    row.layoutMode = 'HORIZONTAL';
    row.primaryAxisSizingMode = 'FIXED';
    row.counterAxisSizingMode = 'AUTO';
    row.resizeWithoutConstraints(width, 1);
    row.itemSpacing = 8;
    row.fills = [];
    row.clipsContent = true;

    const hero = await makeHero(offer, locale, heroWidth, heroHeight);
    row.appendChild(hero);

    if (offer.images.length > 1) {
      const thumbCol = await makeThumbs(offer, thumbWidth, thumbRowH);
      row.appendChild(thumbCol);
    }
    section.appendChild(row);
  } else {
    const hero = await makeHero(offer, locale, width, heroHeight);
    hero.layoutAlign = 'INHERIT';
    section.appendChild(hero);

    if (offer.images.length > 1) {
      const thumbs = await makeThumbs(offer, width, thumbRowH);
      thumbs.layoutAlign = 'INHERIT';
      section.appendChild(thumbs);
    }
  }

  return section;
}

async function makeHero(
  offer: Offer,
  locale: Locale,
  width: number,
  height: number,
): Promise<FrameNode> {
  const hero = figma.createFrame();
  hero.name = '#image';
  hero.resize(width, height);
  hero.fills = [{ type: 'SOLID', color: BRAND.surface }];
  hero.clipsContent = true;

  const heroUrl = offer.images[0]?.url;
  if (heroUrl) {
    const hash = await loadImageHash(heroUrl);
    if (hash) applyImageFill(hero, hash);
  }

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
    pill.y = height - pill.height - 16;
  }

  return hero;
}

async function makeThumbs(
  offer: Offer,
  width: number,
  rowHeight: number,
): Promise<FrameNode> {
  const col = figma.createFrame();
  col.name = 'thumbs';
  col.layoutMode = 'VERTICAL';
  col.primaryAxisSizingMode = 'AUTO';
  col.counterAxisSizingMode = 'FIXED';
  col.resizeWithoutConstraints(width, 1);
  col.itemSpacing = 8;
  col.fills = [];

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
      thumb.resize((width - 8) / 2, rowHeight);
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
    col.appendChild(rowThumbs);
  }
  return col;
}
