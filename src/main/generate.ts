import type { Amenity, Currency, Offer } from '@shared/types';
import { formatPrice } from '@shared/format';
import { BRAND, CARD, FONT, VIEW_DEAL_GRADIENT } from './brand';
import { loadBrandFonts } from './fonts';
import { applyImageFill, loadImageHash } from './images';
import { placeIcon, type IconName } from './icons';

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
};

const MAX_AMENITY_ICONS = 8;

function makeText(
  name: string,
  characters: string,
  font: FontName,
  size: number,
  color: RGB,
): TextNode {
  const t = figma.createText();
  t.name = name;
  t.fontName = font;
  t.fontSize = size;
  t.characters = characters;
  t.fills = [{ type: 'SOLID', color }];
  return t;
}

function hframe(name: string, gap = 0): FrameNode {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = 'HORIZONTAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.counterAxisAlignItems = 'CENTER';
  f.itemSpacing = gap;
  f.fills = [];
  return f;
}

function vframe(name: string, gap = 0): FrameNode {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = 'VERTICAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.itemSpacing = gap;
  f.fills = [];
  return f;
}

async function buildImagePanel(offer: Offer): Promise<FrameNode> {
  const panel = figma.createFrame();
  panel.name = '#image';
  panel.layoutMode = 'NONE';
  panel.resize(CARD.imageWidth, CARD.height);
  panel.cornerRadius = 12;
  panel.fills = [{ type: 'SOLID', color: BRAND.surface }];
  panel.clipsContent = true;

  const heroUrl = offer.images[0]?.url;
  if (heroUrl) {
    const hash = await loadImageHash(heroUrl);
    if (hash) applyImageFill(panel, hash);
  }

  // Fullscreen button bottom-right
  const fsBg = figma.createFrame();
  fsBg.name = 'fullscreenBtn';
  fsBg.resize(32, 32);
  fsBg.cornerRadius = 16;
  fsBg.fills = [{ type: 'SOLID', color: BRAND.white, opacity: 0.92 }];
  fsBg.x = CARD.imageWidth - 44;
  fsBg.y = CARD.height - 44;
  const fsIcon = placeIcon('fullscreen', BRAND.textPrimary);
  fsIcon.x = fsBg.x + 8;
  fsIcon.y = fsBg.y + 8;
  panel.appendChild(fsBg);
  panel.appendChild(fsIcon);

  // Pagination dots
  const dotCount = Math.min(3, Math.max(1, offer.images.length));
  if (dotCount > 1) {
    const dotsWrap = figma.createFrame();
    dotsWrap.name = 'paginationDots';
    dotsWrap.layoutMode = 'HORIZONTAL';
    dotsWrap.primaryAxisSizingMode = 'AUTO';
    dotsWrap.counterAxisSizingMode = 'AUTO';
    dotsWrap.itemSpacing = 4;
    dotsWrap.fills = [];
    for (let i = 0; i < dotCount; i++) {
      const dot = figma.createEllipse();
      dot.resize(6, 6);
      dot.fills = [
        { type: 'SOLID', color: BRAND.white, opacity: i === 0 ? 1 : 0.5 },
      ];
      dotsWrap.appendChild(dot);
    }
    panel.appendChild(dotsWrap);
    dotsWrap.x = CARD.imageWidth / 2 - dotsWrap.width / 2;
    dotsWrap.y = CARD.height - 20;
  }

  return panel;
}

async function buildContent(offer: Offer): Promise<FrameNode> {
  const content = vframe('content', 6);
  content.layoutAlign = 'STRETCH';
  content.layoutGrow = 1;
  content.primaryAxisSizingMode = 'FIXED';
  content.paddingLeft = CARD.padding;
  content.paddingRight = CARD.padding;
  content.paddingTop = CARD.padding;
  content.paddingBottom = CARD.padding;
  content.resize(400, CARD.height);

  const category = makeText(
    '#categoryLabel',
    offer.categoryLabel ?? offer.propertyType.charAt(0).toUpperCase() + offer.propertyType.slice(1),
    FONT.medium,
    13,
    BRAND.textSecondary,
  );
  content.appendChild(category);

  const title = makeText('#title', offer.title, FONT.bold, 20, BRAND.textPrimary);
  title.layoutAlign = 'STRETCH';
  title.textAutoResize = 'HEIGHT';
  content.appendChild(title);

  // Location line — adaptive
  const locParts: string[] = [];
  if (offer.location.distanceToCenterKm !== undefined) {
    locParts.push(`${offer.location.distanceToCenterKm.toFixed(1)} km to center`);
  }
  if (offer.location.neighborhood) {
    locParts.push(`${offer.location.city} ${offer.location.neighborhood}`);
  } else {
    locParts.push(`${offer.location.city}, ${offer.location.country}`);
  }
  const location = makeText(
    '#location',
    locParts.join(' · '),
    FONT.regular,
    13,
    BRAND.textSecondary,
  );
  content.appendChild(location);

  // Amenity icons — skip if none available to render
  const iconNames = offer.amenities
    .map((a) => AMENITY_TO_ICON[a])
    .filter((n): n is IconName => n !== undefined)
    .slice(0, MAX_AMENITY_ICONS);

  if (iconNames.length > 0) {
    const icons = hframe('amenities', 10);
    icons.paddingTop = 6;
    for (const n of iconNames) icons.appendChild(placeIcon(n, BRAND.textSecondary));
    content.appendChild(icons);
  }

  // Spacer pushes the rating + provider lines to the bottom
  const spacer = figma.createFrame();
  spacer.name = 'spacer';
  spacer.fills = [];
  spacer.layoutAlign = 'STRETCH';
  spacer.layoutGrow = 1;
  spacer.resize(1, 1);
  content.appendChild(spacer);

  // Rating line — "New" if no rating
  const ratingRow = hframe('#ratingLine', 6);
  if (offer.rating) {
    ratingRow.appendChild(makeText('star', '★', FONT.bold, 14, BRAND.violet));
    ratingRow.appendChild(
      makeText('#ratingAverage', offer.rating.average.toFixed(1), FONT.bold, 14, BRAND.textPrimary),
    );
    ratingRow.appendChild(
      makeText(
        '#ratingCount',
        `(${offer.rating.count.toLocaleString('en-US')} reviews)`,
        FONT.regular,
        13,
        BRAND.textSecondary,
      ),
    );
  } else {
    ratingRow.appendChild(makeText('newBadge', 'New listing', FONT.medium, 13, BRAND.textSecondary));
  }
  content.appendChild(ratingRow);

  content.appendChild(
    makeText(
      '#providerLine',
      `Promoted by ${offer.provider.name}`,
      FONT.regular,
      12,
      BRAND.textTertiary,
    ),
  );

  return content;
}

function buildActions(offer: Offer): FrameNode {
  const actions = vframe('actions', 8);
  actions.layoutAlign = 'STRETCH';
  actions.primaryAxisSizingMode = 'FIXED';
  actions.counterAxisSizingMode = 'FIXED';
  actions.resize(CARD.actionsWidth, CARD.height);
  actions.paddingLeft = actions.paddingRight = CARD.padding;
  actions.paddingTop = actions.paddingBottom = CARD.padding;
  actions.counterAxisAlignItems = 'MAX';
  actions.primaryAxisAlignItems = 'SPACE_BETWEEN';

  // Top row: share + heart icons
  const topIcons = hframe('topIcons', 12);
  topIcons.appendChild(placeIcon('share', BRAND.textSecondary));
  topIcons.appendChild(placeIcon('heart', BRAND.textSecondary));
  actions.appendChild(topIcons);

  // Price block (discount pill, strikethrough, big price, suffix, button)
  const priceBlock = vframe('priceBlock', 4);
  priceBlock.counterAxisAlignItems = 'MAX';

  if (offer.discount) {
    const pill = figma.createFrame();
    pill.name = '#discountLabel';
    pill.layoutMode = 'HORIZONTAL';
    pill.primaryAxisSizingMode = 'AUTO';
    pill.counterAxisSizingMode = 'AUTO';
    pill.paddingLeft = pill.paddingRight = 10;
    pill.paddingTop = pill.paddingBottom = 5;
    pill.cornerRadius = 999;
    pill.fills = [{ type: 'SOLID', color: { r: 1, g: 0.933, b: 0.941 } }]; // #FFEEF0
    pill.appendChild(
      makeText(
        'discountText',
        `${offer.discount.label ?? 'Deal'}: -${offer.discount.percent}%`,
        FONT.semibold,
        11,
        BRAND.coral,
      ),
    );
    priceBlock.appendChild(pill);

    const original = makeText(
      '#priceOriginal',
      formatPrice(offer.discount.originalPerNight, offer.price.currency),
      FONT.regular,
      12,
      BRAND.textSecondary,
    );
    original.textDecoration = 'STRIKETHROUGH';
    priceBlock.appendChild(original);
  }

  priceBlock.appendChild(
    makeText(
      '#pricePerNight',
      formatPrice(offer.price.perNight, offer.price.currency),
      FONT.bold,
      28,
      BRAND.textPrimary,
    ),
  );

  priceBlock.appendChild(
    makeText(
      '#priceSuffix',
      `for ${offer.price.nights} ${offer.price.nights === 1 ? 'night' : 'nights'}, incl. fees`,
      FONT.regular,
      11,
      BRAND.textSecondary,
    ),
  );

  // Gradient "View deal" button
  const button = figma.createFrame();
  button.name = 'viewDealBtn';
  button.layoutMode = 'HORIZONTAL';
  button.primaryAxisSizingMode = 'AUTO';
  button.counterAxisSizingMode = 'AUTO';
  button.paddingLeft = button.paddingRight = 20;
  button.paddingTop = button.paddingBottom = 12;
  button.cornerRadius = 999;
  button.fills = [VIEW_DEAL_GRADIENT];
  button.appendChild(makeText('btnLabel', 'View deal', FONT.bold, 14, BRAND.white));
  priceBlock.appendChild(button);

  actions.appendChild(priceBlock);

  return actions;
}

/**
 * Adaptive HomeToGo-styled product card builder.
 *
 * Renders only the parts the offer actually has:
 *   - discount pill + strikethrough price only when `offer.discount` is set
 *   - amenity icons row only when we have recognised amenities
 *   - rating row shows "New listing" when `offer.rating` is absent
 *   - pagination dots appear only when `offer.images.length > 1`
 */
export async function buildCard(offer: Offer): Promise<FrameNode> {
  await loadBrandFonts();

  const card = figma.createFrame();
  card.name = `HTG Card · ${offer.title}`;
  card.layoutMode = 'HORIZONTAL';
  card.primaryAxisSizingMode = 'FIXED';
  card.counterAxisSizingMode = 'FIXED';
  card.resize(CARD.width, CARD.height);
  card.cornerRadius = CARD.radius;
  card.fills = [{ type: 'SOLID', color: BRAND.white }];
  card.strokes = [{ type: 'SOLID', color: BRAND.border }];
  card.strokeWeight = 1;
  card.clipsContent = true;
  card.effects = [
    {
      type: 'DROP_SHADOW',
      color: { r: 0.055, g: 0.094, b: 0.141, a: 0.06 },
      offset: { x: 0, y: 2 },
      radius: 12,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL',
    },
  ];

  card.appendChild(await buildImagePanel(offer));
  card.appendChild(await buildContent(offer));
  card.appendChild(buildActions(offer));

  card.setPluginData('htgOfferId', offer.id);
  card.setPluginData('htgInsertedAt', new Date().toISOString());

  return card;
}
