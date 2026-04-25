import type { Amenity, Offer } from '@shared/types';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { t } from '@shared/locales';
import { localize } from '@shared/localize';
import { PLATFORM_SPEC, isMobile } from '@shared/platforms';
import { formatPrice } from '@shared/format';
import { BRAND, FONT, VIEW_DEAL_GRADIENT } from './brand';
import { loadBrandFonts } from './fonts';
import { applyImageFill, loadImageHash } from './images';
import { placeIcon, type IconName } from './icons';
import { placeHomeToGoLogo } from './logo';

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
  fsBg.constraints = { horizontal: 'MAX', vertical: 'MAX' };
  const fsIcon = placeIcon('fullscreen', BRAND.textPrimary);
  fsIcon.x = fsBg.x + 8;
  fsIcon.y = fsBg.y + 8;
  fsIcon.constraints = { horizontal: 'MAX', vertical: 'MAX' };
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
    dotsWrap.constraints = { horizontal: 'CENTER', vertical: 'MAX' };
  }

  return panel;
}

async function buildWebCard(offer: Offer, locale: Locale): Promise<FrameNode> {
  const spec = PLATFORM_SPEC.web;
  const imageWidth = 340;
  const actionsWidth = 200;

  // Web card geometry:
  //   - HORIZONTAL auto-layout
  //   - primary axis (width)  → FIXED at spec.cardWidth
  //   - counter axis (height) → AUTO, so the card hugs the tallest
  //     child (which is the content column).
  // We deliberately do NOT set minHeight: that would lock the card at
  // 320 px even when the offer has fewer amenities / no rating /
  // shorter title. Instead the card hugs and the image + actions
  // columns stretch to match.
  const card = figma.createFrame();
  card.name = `HomeDrop Card · ${offer.title}`;
  card.layoutMode = 'HORIZONTAL';
  card.primaryAxisSizingMode = 'FIXED';
  card.counterAxisSizingMode = 'AUTO';
  card.resizeWithoutConstraints(spec.cardWidth, 1);
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

  // Image panel — stretches vertically to match the card's hugged height.
  const image = await buildImagePanelWeb(offer, imageWidth, spec.cardHeight);
  image.layoutAlign = 'STRETCH';
  card.appendChild(image);

  // Content column — vertically AUTO so its hugged height drives the card.
  // Intentionally NOT layoutAlign='STRETCH' so it contributes to the card's hug.
  const content = vframe('content', 6);
  content.layoutGrow = 1;
  content.primaryAxisSizingMode = 'AUTO';
  content.paddingLeft = content.paddingRight = spec.padding;
  content.paddingTop = content.paddingBottom = spec.padding;

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

  const brandRow = hframe('brand', 6);
  brandRow.counterAxisAlignItems = 'CENTER';
  brandRow.paddingTop = 6;
  brandRow.appendChild(
    makeText('brandVia', 'via', FONT.regular, 11, BRAND.textTertiary),
  );
  brandRow.appendChild(placeHomeToGoLogo(14));
  content.appendChild(brandRow);

  card.appendChild(content);

  // Actions column. layoutAlign STRETCH on a HORIZONTAL parent makes
  // it stretch vertically to match the card's hugged height (driven
  // by the content column). We keep its width FIXED but its height
  // AUTO so it doesn't impose a floor of its own.
  const actions = vframe('actions', 8);
  actions.layoutAlign = 'STRETCH';
  actions.primaryAxisSizingMode = 'AUTO';
  actions.counterAxisSizingMode = 'FIXED';
  actions.resizeWithoutConstraints(actionsWidth, 1);
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
  const width = spec.cardWidth;
  const imageHeight = spec.imageHeight;

  const card = figma.createFrame();
  card.name = `HomeDrop Card · ${offer.title} (${platform})`;
  card.layoutMode = 'VERTICAL';
  card.counterAxisSizingMode = 'FIXED';
  card.primaryAxisSizingMode = 'AUTO';
  card.resizeWithoutConstraints(width, 1);
  card.cornerRadius = spec.radius;
  card.fills = [{ type: 'SOLID', color: BRAND.white }];
  card.strokes = platform === 'android' ? [] : [{ type: 'SOLID', color: BRAND.border }];
  card.strokeWeight = 1;
  card.clipsContent = true;
  card.itemSpacing = 0;
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

  const image = figma.createFrame();
  image.name = '#image';
  image.layoutAlign = 'STRETCH';
  image.resize(width, imageHeight);
  image.fills = [{ type: 'SOLID', color: BRAND.surface }];
  image.clipsContent = true;

  const heroUrl = offer.images[0]?.url;
  if (heroUrl) {
    const hash = await loadImageHash(heroUrl);
    if (hash) applyImageFill(image, hash);
  }

  if (offer.travelDatesLabel) {
    const dateBadge = figma.createFrame();
    dateBadge.name = '#travelDates';
    dateBadge.layoutMode = 'HORIZONTAL';
    dateBadge.primaryAxisSizingMode = 'AUTO';
    dateBadge.counterAxisSizingMode = 'AUTO';
    dateBadge.paddingLeft = dateBadge.paddingRight = 10;
    dateBadge.paddingTop = dateBadge.paddingBottom = 5;
    dateBadge.cornerRadius = 8;
    dateBadge.fills = [{ type: 'SOLID', color: BRAND.white, opacity: 0.92 }];
    dateBadge.appendChild(
      makeText('dateLabel', offer.travelDatesLabel, FONT.semibold, 12, BRAND.textPrimary),
    );
    image.appendChild(dateBadge);
    dateBadge.x = 16;
    dateBadge.y = 16;
  }

  const heartBg = figma.createFrame();
  heartBg.name = 'heartBtn';
  heartBg.resize(40, 40);
  heartBg.cornerRadius = 20;
  heartBg.fills = [{ type: 'SOLID', color: BRAND.white }];
  heartBg.effects = [
    {
      type: 'DROP_SHADOW',
      color: { r: 0.055, g: 0.094, b: 0.141, a: 0.12 },
      offset: { x: 0, y: 1 },
      radius: 4,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL',
    },
  ];
  heartBg.x = width - 56;
  heartBg.y = 16;
  const heartIcon = placeIcon('heart', BRAND.textPrimary);
  heartIcon.x = heartBg.x + 11;
  heartIcon.y = heartBg.y + 11;
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
    pill.cornerRadius = 8;
    pill.fills = [{ type: 'SOLID', color: BRAND.coral }];
    pill.appendChild(
      makeText(
        'discountText',
        `${offer.discount.label ?? t('lastMinuteDeal', locale)} · -${offer.discount.percent}%`,
        FONT.bold,
        11,
        BRAND.white,
      ),
    );
    image.appendChild(pill);
    pill.x = 16;
    pill.y = imageHeight - pill.height - 16;
  }

  card.appendChild(image);

  const body = vframe('body', 6);
  body.layoutAlign = 'STRETCH';
  body.primaryAxisSizingMode = 'AUTO';
  body.paddingTop = body.paddingBottom = spec.padding;
  body.paddingLeft = body.paddingRight = spec.padding;

  const metaParts: string[] = [];
  const typeLabel = offer.categoryLabel ?? t(offer.propertyType, locale);
  if (offer.areaSqm !== undefined) {
    metaParts.push(`${offer.areaSqm} m² ${typeLabel}`);
  } else {
    metaParts.push(typeLabel);
  }
  metaParts.push(
    `${offer.capacity.bedrooms} ${t(offer.capacity.bedrooms === 1 ? 'bedroom' : 'bedrooms', locale)}`,
  );
  metaParts.push(`${offer.capacity.guests} ${t('guests', locale)}`);
  body.appendChild(
    makeText('#capacityMeta', metaParts.join(' · '), FONT.regular, 13, BRAND.textSecondary),
  );

  const title = makeText('#title', offer.title, FONT.bold, spec.titleSize, BRAND.textPrimary);
  title.layoutAlign = 'STRETCH';
  title.textAutoResize = 'HEIGHT';
  body.appendChild(title);

  if (offer.rating) {
    const ratingRow = hframe('#ratingLine', 8);
    ratingRow.paddingTop = 2;
    ratingRow.counterAxisAlignItems = 'CENTER';

    const stars = hframe('stars', 2);
    const avg = offer.rating.average;
    for (let i = 0; i < 5; i++) {
      const filled = i < Math.floor(avg);
      const half = !filled && i < Math.floor(avg) + (avg % 1 >= 0.3 ? 1 : 0);
      const color = filled ? BRAND.violet : half ? BRAND.violet : BRAND.border;
      const glyph = filled ? '★' : half ? '★' : '☆';
      const star = makeText('star', glyph, FONT.bold, 16, color);
      if (half) star.opacity = 0.6;
      stars.appendChild(star);
    }
    ratingRow.appendChild(stars);
    ratingRow.appendChild(
      makeText(
        '#ratingLineText',
        `${offer.rating.average.toFixed(1)}/5 (${offer.rating.count.toLocaleString()})`,
        FONT.regular,
        13,
        BRAND.textPrimary,
      ),
    );
    body.appendChild(ratingRow);
  } else {
    body.appendChild(
      makeText('#ratingLine', t('newListing', locale), FONT.medium, 13, BRAND.textSecondary),
    );
  }

  const locRow = hframe('#locationRow', 6);
  locRow.counterAxisAlignItems = 'CENTER';
  locRow.appendChild(placeIcon('pin', BRAND.textSecondary));
  const locText = offer.location.neighborhood
    ? `${offer.location.neighborhood}, ${offer.location.city}`
    : `${offer.location.city}, ${offer.location.country}`;
  locRow.appendChild(
    makeText('#location', locText, FONT.regular, 13, BRAND.textSecondary),
  );
  body.appendChild(locRow);

  const priceRow = hframe('priceRow', 6);
  priceRow.counterAxisAlignItems = 'BASELINE';
  priceRow.paddingTop = 4;
  priceRow.appendChild(
    makeText(
      '#priceTotal',
      formatPrice(offer.price.total, offer.price.currency, locale),
      FONT.bold,
      spec.priceSize,
      BRAND.textPrimary,
    ),
  );
  priceRow.appendChild(
    makeText('priceSuffix', t('total', locale), FONT.regular, 13, BRAND.textSecondary),
  );
  body.appendChild(priceRow);

  const brandRow = hframe('brand', 6);
  brandRow.counterAxisAlignItems = 'CENTER';
  brandRow.paddingTop = 2;
  brandRow.appendChild(
    makeText('brandVia', 'via', FONT.regular, 11, BRAND.textTertiary),
  );
  brandRow.appendChild(placeHomeToGoLogo(14));
  body.appendChild(brandRow);

  const divider = figma.createFrame();
  divider.name = 'divider';
  divider.layoutAlign = 'STRETCH';
  divider.resize(width - spec.padding * 2, 1);
  divider.fills = [{ type: 'SOLID', color: BRAND.border }];
  body.appendChild(divider);

  const compareRow = hframe('compareRow', 0);
  compareRow.primaryAxisAlignItems = 'SPACE_BETWEEN';
  compareRow.counterAxisAlignItems = 'CENTER';
  compareRow.layoutAlign = 'STRETCH';
  compareRow.primaryAxisSizingMode = 'FIXED';
  compareRow.paddingTop = compareRow.paddingBottom = 4;

  compareRow.appendChild(
    makeText('compareLabel', t('compare', locale), FONT.regular, 14, BRAND.textPrimary),
  );

  const checkbox = figma.createFrame();
  checkbox.name = 'checkbox';
  checkbox.resize(22, 22);
  checkbox.cornerRadius = platform === 'android' ? 2 : 4;
  checkbox.strokes = [{ type: 'SOLID', color: BRAND.border }];
  checkbox.strokeWeight = 1.5;
  checkbox.fills = [];
  compareRow.appendChild(checkbox);

  body.appendChild(compareRow);

  card.appendChild(body);

  // Re-affirm AUTO after all children are attached so the card hugs their total height.
  card.primaryAxisSizingMode = 'AUTO';
  return card;
}

export async function buildCard(
  offer: Offer,
  locale: Locale = 'en',
  platform: Platform = 'web',
): Promise<FrameNode> {
  await loadBrandFonts();
  const view = localize(offer, locale);
  const card = isMobile(platform)
    ? await buildMobileCard(view, locale, platform)
    : await buildWebCard(view, locale);

  card.setPluginData('htgOfferId', offer.id);
  card.setPluginData('htgLocale', locale);
  card.setPluginData('htgPlatform', platform);
  card.setPluginData('htgInsertedAt', new Date().toISOString());
  return card;
 }
