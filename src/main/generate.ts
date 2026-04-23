import type { Amenity, Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { t } from '@shared/locales';
import { PLATFORM_SPEC, isMobile } from '@shared/platforms';
import { formatPrice } from '@shared/format';
import { BRAND, FONT, VIEW_DEAL_GRADIENT } from './brand';
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

const MAX_AMENITY_ICONS_WEB = 8;
const MAX_AMENITY_ICONS_MOBILE = 5;

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

async function buildImagePanelWeb(offer: Offer, width: number, height: number): Promise<FrameNode> {
  const panel = figma.createFrame();
  panel.name = '#image';
  panel.layoutMode = 'NONE';
  panel.resize(width, height);
  panel.cornerRadius = 12;
  panel.fills = [{ type: 'SOLID', color: BRAND.surface }];
  panel.clipsContent = true;

  const heroUrl = offer.images[0]?.url;
  if (heroUrl) {
    const hash = await loadImageHash(heroUrl);
    if (hash) applyImageFill(panel, hash);
  }

  const fsBg = figma.createFrame();
  fsBg.name = 'fullscreenBtn';
  fsBg.resize(32, 32);
  fsBg.cornerRadius = 16;
  fsBg.fills = [{ type: 'SOLID', color: BRAND.white, opacity: 0.92 }];
  fsBg.x = width - 44;
  fsBg.y = height - 44;
  const fsIcon = placeIcon('fullscreen', BRAND.textPrimary);
  fsIcon.x = fsBg.x + 8;
  fsIcon.y = fsBg.y + 8;
  panel.appendChild(fsBg);
  panel.appendChild(fsIcon);

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
      dot.fills = [{ type: 'SOLID', color: BRAND.white, opacity: i === 0 ? 1 : 0.5 }];
      dotsWrap.appendChild(dot);
    }
    panel.appendChild(dotsWrap);
    dotsWrap.x = width / 2 - dotsWrap.width / 2;
    dotsWrap.y = height - 20;
  }

  return panel;
}

async function buildWebCard(offer: Offer, locale: Locale): Promise<FrameNode> {
  const spec = PLATFORM_SPEC.web;
  const imageWidth = 340;
  const actionsWidth = 200;

  const card = figma.createFrame();
  card.name = `HTG Card · ${offer.title}`;
  card.layoutMode = 'HORIZONTAL';
  card.primaryAxisSizingMode = 'FIXED';
  card.counterAxisSizingMode = 'FIXED';
  card.resize(spec.cardWidth, spec.cardHeight);
  card.cornerRadius = spec.radius;
  card.fills = [{ type: 'SOLID', color: BRAND.white }];
  card.strokes = [{ type: 'SOLID', color: BRAND.border }];
  card.strokeWeight = 1;
  card.clipsContent = true;
  card.effects = [
    {
      type: 'DROP_SHADOW',
      color: { r: 0.055, g: 0.094, b: 0.141, a: spec.shadowAlpha },
      offset: { x: 0, y: 2 },
      radius: spec.shadowBlur,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL',
    },
  ];

  // Image panel
  card.appendChild(await buildImagePanelWeb(offer, imageWidth, spec.cardHeight));

  // Content column
  const content = vframe('content', 6);
  content.layoutAlign = 'STRETCH';
  content.layoutGrow = 1;
  content.primaryAxisSizingMode = 'FIXED';
  content.paddingLeft = content.paddingRight = spec.padding;
  content.paddingTop = content.paddingBottom = spec.padding;
  content.resize(400, spec.cardHeight);

  content.appendChild(
    makeText(
      '#categoryLabel',
      offer.categoryLabel ?? t(offer.propertyType, locale),
      FONT.medium,
      13,
      BRAND.textSecondary,
    ),
  );

  const title = makeText('#title', offer.title, FONT.bold, spec.titleSize, BRAND.textPrimary);
  title.layoutAlign = 'STRETCH';
  title.textAutoResize = 'HEIGHT';
  content.appendChild(title);

  const locParts: string[] = [];
  if (offer.location.distanceToCenterKm !== undefined) {
    locParts.push(
      t('kmToCenter', locale, { n: offer.location.distanceToCenterKm.toFixed(1) }),
    );
  }
  if (offer.location.neighborhood) {
    locParts.push(`${offer.location.city} ${offer.location.neighborhood}`);
  } else {
    locParts.push(`${offer.location.city}, ${offer.location.country}`);
  }
  content.appendChild(
    makeText('#location', locParts.join(' · '), FONT.regular, 13, BRAND.textSecondary),
  );

  const iconNames = offer.amenities
    .map((a) => AMENITY_TO_ICON[a])
    .filter((n): n is IconName => n !== undefined)
    .slice(0, MAX_AMENITY_ICONS_WEB);

  if (iconNames.length > 0) {
    const icons = hframe('amenities', 10);
    icons.paddingTop = 6;
    for (const n of iconNames) icons.appendChild(placeIcon(n, BRAND.textSecondary));
    content.appendChild(icons);
  }

  const spacer = figma.createFrame();
  spacer.name = 'spacer';
  spacer.fills = [];
  spacer.layoutAlign = 'STRETCH';
  spacer.layoutGrow = 1;
  spacer.resize(1, 1);
  content.appendChild(spacer);

  const ratingRow = hframe('#ratingLine', 6);
  if (offer.rating) {
    ratingRow.appendChild(makeText('star', '★', FONT.bold, 14, BRAND.violet));
    ratingRow.appendChild(
      makeText('#ratingAverage', offer.rating.average.toFixed(1), FONT.bold, 14, BRAND.textPrimary),
    );
    ratingRow.appendChild(
      makeText(
        '#ratingCount',
        `(${offer.rating.count.toLocaleString()} ${t('reviews', locale)})`,
        FONT.regular,
        13,
        BRAND.textSecondary,
      ),
    );
  } else {
    ratingRow.appendChild(
      makeText('newBadge', t('newListing', locale), FONT.medium, 13, BRAND.textSecondary),
    );
  }
  content.appendChild(ratingRow);

  content.appendChild(
    makeText(
      '#providerLine',
      t('promotedBy', locale, { name: offer.provider.name }),
      FONT.regular,
      12,
      BRAND.textTertiary,
    ),
  );

  card.appendChild(content);

  // Actions column
  const actions = vframe('actions', 8);
  actions.layoutAlign = 'STRETCH';
  actions.primaryAxisSizingMode = 'FIXED';
  actions.counterAxisSizingMode = 'FIXED';
  actions.resize(actionsWidth, spec.cardHeight);
  actions.paddingLeft = actions.paddingRight = spec.padding;
  actions.paddingTop = actions.paddingBottom = spec.padding;
  actions.counterAxisAlignItems = 'MAX';
  actions.primaryAxisAlignItems = 'SPACE_BETWEEN';

  const topIcons = hframe('topIcons', 12);
  topIcons.appendChild(placeIcon('share', BRAND.textSecondary));
  topIcons.appendChild(placeIcon('heart', BRAND.textSecondary));
  actions.appendChild(topIcons);

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
    pill.fills = [{ type: 'SOLID', color: { r: 1, g: 0.933, b: 0.941 } }];
    pill.appendChild(
      makeText(
        'discountText',
        `${offer.discount.label ?? t('lastMinuteDeal', locale)}: -${offer.discount.percent}%`,
        FONT.semibold,
        11,
        BRAND.coral,
      ),
    );
    priceBlock.appendChild(pill);

    const original = makeText(
      '#priceOriginal',
      formatPrice(offer.discount.originalPerNight, offer.price.currency, locale),
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
      formatPrice(offer.price.perNight, offer.price.currency, locale),
      FONT.bold,
      spec.priceSize,
      BRAND.textPrimary,
    ),
  );

  priceBlock.appendChild(
    makeText(
      '#priceSuffix',
      t(offer.price.nights === 1 ? 'forNight' : 'forNights', locale, { n: offer.price.nights }),
      FONT.regular,
      11,
      BRAND.textSecondary,
    ),
  );

  const button = figma.createFrame();
  button.name = 'viewDealBtn';
  button.layoutMode = 'HORIZONTAL';
  button.primaryAxisSizingMode = 'AUTO';
  button.counterAxisSizingMode = 'AUTO';
  button.paddingLeft = button.paddingRight = 20;
  button.paddingTop = button.paddingBottom = 12;
  button.cornerRadius = 999;
  button.fills = [VIEW_DEAL_GRADIENT];
  button.appendChild(makeText('btnLabel', t('viewDeal', locale), FONT.bold, 14, BRAND.white));
  priceBlock.appendChild(button);

  actions.appendChild(priceBlock);
  card.appendChild(actions);

  return card;
}

async function buildMobileCard(
  offer: Offer,
  locale: Locale,
  platform: Platform,
): Promise<FrameNode> {
  const spec = PLATFORM_SPEC[platform];

  const card = figma.createFrame();
  card.name = `HTG Card · ${offer.title} (${platform})`;
  card.layoutMode = 'VERTICAL';
  card.primaryAxisSizingMode = 'AUTO';
  card.counterAxisSizingMode = 'FIXED';
  card.resize(spec.cardWidth, 1);
  card.cornerRadius = spec.radius;
  card.fills = [{ type: 'SOLID', color: BRAND.white }];
  card.strokes = platform === 'android' ? [] : [{ type: 'SOLID', color: BRAND.border }];
  card.strokeWeight = 1;
  card.clipsContent = true;
  card.effects = [
    {
      type: 'DROP_SHADOW',
      color: { r: 0.055, g: 0.094, b: 0.141, a: spec.shadowAlpha },
      offset: { x: 0, y: platform === 'android' ? 4 : 2 },
      radius: spec.shadowBlur,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL',
    },
  ];

  // Image panel (top)
  const image = figma.createFrame();
  image.name = '#image';
  image.layoutAlign = 'STRETCH';
  image.resize(spec.cardWidth, spec.imageHeight);
  image.fills = [{ type: 'SOLID', color: BRAND.surface }];
  image.clipsContent = true;

  const heroUrl = offer.images[0]?.url;
  if (heroUrl) {
    const hash = await loadImageHash(heroUrl);
    if (hash) applyImageFill(image, hash);
  }

  // Heart overlay top-right
  const heartBg = figma.createFrame();
  heartBg.resize(32, 32);
  heartBg.cornerRadius = 16;
  heartBg.fills = [{ type: 'SOLID', color: BRAND.white, opacity: 0.92 }];
  heartBg.x = spec.cardWidth - 44;
  heartBg.y = 12;
  const heartIcon = placeIcon('heart', BRAND.textPrimary);
  heartIcon.x = heartBg.x + 8;
  heartIcon.y = heartBg.y + 8;
  image.appendChild(heartBg);
  image.appendChild(heartIcon);

  if (offer.discount) {
    const pill = figma.createFrame();
    pill.name = '#discountLabel';
    pill.layoutMode = 'HORIZONTAL';
    pill.primaryAxisSizingMode = 'AUTO';
    pill.counterAxisSizingMode = 'AUTO';
    pill.paddingLeft = pill.paddingRight = 10;
    pill.paddingTop = pill.paddingBottom = 5;
    pill.cornerRadius = 999;
    pill.fills = [{ type: 'SOLID', color: BRAND.coral }];
    pill.appendChild(
      makeText(
        'discountText',
        `-${offer.discount.percent}%`,
        FONT.bold,
        11,
        BRAND.white,
      ),
    );
    pill.x = 12;
    pill.y = 12;
    image.appendChild(pill);
  }

  card.appendChild(image);

  // Body
  const body = vframe('body', spec.gap);
  body.layoutAlign = 'STRETCH';
  body.primaryAxisSizingMode = 'AUTO';
  body.counterAxisSizingMode = 'FIXED';
  body.resize(spec.cardWidth, 1);
  body.paddingTop = body.paddingBottom = spec.padding;
  body.paddingLeft = body.paddingRight = spec.padding;

  body.appendChild(
    makeText(
      '#categoryLabel',
      offer.categoryLabel ?? t(offer.propertyType, locale),
      FONT.medium,
      12,
      BRAND.textSecondary,
    ),
  );

  const title = makeText('#title', offer.title, FONT.bold, spec.titleSize, BRAND.textPrimary);
  title.layoutAlign = 'STRETCH';
  title.textAutoResize = 'HEIGHT';
  body.appendChild(title);

  const locParts: string[] = [];
  if (offer.location.distanceToCenterKm !== undefined) {
    locParts.push(
      t('kmToCenter', locale, { n: offer.location.distanceToCenterKm.toFixed(1) }),
    );
  }
  if (offer.location.neighborhood) {
    locParts.push(`${offer.location.city} ${offer.location.neighborhood}`);
  } else {
    locParts.push(`${offer.location.city}, ${offer.location.country}`);
  }
  body.appendChild(
    makeText('#location', locParts.join(' · '), FONT.regular, 12, BRAND.textSecondary),
  );

  const iconNames = offer.amenities
    .map((a) => AMENITY_TO_ICON[a])
    .filter((n): n is IconName => n !== undefined)
    .slice(0, MAX_AMENITY_ICONS_MOBILE);

  if (iconNames.length > 0) {
    const icons = hframe('amenities', 10);
    icons.paddingTop = 4;
    for (const n of iconNames) icons.appendChild(placeIcon(n, BRAND.textSecondary));
    body.appendChild(icons);
  }

  const ratingRow = hframe('#ratingLine', 4);
  ratingRow.paddingTop = 2;
  if (offer.rating) {
    ratingRow.appendChild(makeText('star', '★', FONT.bold, 13, BRAND.violet));
    ratingRow.appendChild(
      makeText('#ratingAverage', offer.rating.average.toFixed(1), FONT.bold, 13, BRAND.textPrimary),
    );
    ratingRow.appendChild(
      makeText(
        '#ratingCount',
        `(${offer.rating.count.toLocaleString()})`,
        FONT.regular,
        12,
        BRAND.textSecondary,
      ),
    );
  } else {
    ratingRow.appendChild(
      makeText('newBadge', t('newListing', locale), FONT.medium, 12, BRAND.textSecondary),
    );
  }
  body.appendChild(ratingRow);

  // Price + button row
  const priceRow = hframe('priceRow', 8);
  priceRow.layoutAlign = 'STRETCH';
  priceRow.primaryAxisSizingMode = 'FIXED';
  priceRow.counterAxisAlignItems = 'CENTER';
  priceRow.primaryAxisAlignItems = 'SPACE_BETWEEN';
  priceRow.resize(spec.cardWidth - spec.padding * 2, 40);
  priceRow.paddingTop = 8;

  const priceStack = vframe('priceStack', 2);
  if (offer.discount) {
    const original = makeText(
      '#priceOriginal',
      formatPrice(offer.discount.originalPerNight, offer.price.currency, locale),
      FONT.regular,
      11,
      BRAND.textSecondary,
    );
    original.textDecoration = 'STRIKETHROUGH';
    priceStack.appendChild(original);
  }
  priceStack.appendChild(
    makeText(
      '#pricePerNight',
      formatPrice(offer.price.perNight, offer.price.currency, locale),
      FONT.bold,
      spec.priceSize,
      BRAND.textPrimary,
    ),
  );
  priceRow.appendChild(priceStack);

  const button = figma.createFrame();
  button.name = 'viewDealBtn';
  button.layoutMode = 'HORIZONTAL';
  button.primaryAxisSizingMode = 'AUTO';
  button.counterAxisSizingMode = 'AUTO';
  button.paddingLeft = button.paddingRight = 18;
  button.paddingTop = button.paddingBottom = 10;
  button.cornerRadius = platform === 'android' ? 8 : 999;
  button.fills = [VIEW_DEAL_GRADIENT];
  button.appendChild(makeText('btnLabel', t('viewDeal', locale), FONT.bold, 13, BRAND.white));
  priceRow.appendChild(button);

  body.appendChild(priceRow);
  card.appendChild(body);

  return card;
}

/**
 * Adaptive HomeToGo-styled product card builder, platform- and locale-aware.
 *
 * - Web: horizontal 880×320 card (image · content · actions columns).
 * - iPhone / Android: vertical 360–375px-wide card (image top, content,
 *   price + button row bottom). Android drops the outline and uses
 *   stronger elevation + 8px radii to match Material 3.
 */
export async function buildCard(
  offer: Offer,
  locale: Locale = 'en',
  platform: Platform = 'web',
): Promise<FrameNode> {
  await loadBrandFonts();
  const card = isMobile(platform)
    ? await buildMobileCard(offer, locale, platform)
    : await buildWebCard(offer, locale);

  card.setPluginData('htgOfferId', offer.id);
  card.setPluginData('htgLocale', locale);
  card.setPluginData('htgPlatform', platform);
  card.setPluginData('htgInsertedAt', new Date().toISOString());
  return card;
}
