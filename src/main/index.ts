import { on, showUI } from '@create-figma-plugin/utilities';
import productsJson from '@data/products.json';
import type { Offer } from '@shared/types';
import type {
  InsertCardsPayload,
  InsertHandler,
  InsertMode,
  InsertPayload,
  InsertSectionsPayload,
  LoadedPayload,
  RefreshHandler,
  SaveStateHandler,
  SectionKind,
  UiState,
} from '@shared/messages';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { PLATFORM_SPEC } from '@shared/platforms';
import { buildCard } from './generate';
import { buildSection } from './sections';
import { firstTargetInSelection, populateSelection } from './populate';

const OFFERS = productsJson as unknown as Offer[];
const OFFER_BY_ID: Record<string, Offer> = Object.fromEntries(
  OFFERS.map((o) => [o.id, o]),
);
const LAYOUT_GAP = 16;
const CONTAINER_PADDING = 20;
const UI_STATE_KEY = 'htgUiState';

export default async function () {
  const savedState = (await figma.clientStorage.getAsync(UI_STATE_KEY)) as
    | UiState
    | undefined;

  const initialData: LoadedPayload = { offers: OFFERS, savedState };
  showUI({ width: 420, height: 720 }, { ...initialData });

  on<SaveStateHandler>('SAVE_STATE', async (state) => {
    await figma.clientStorage.setAsync(UI_STATE_KEY, state);
  });

  on<InsertHandler>('INSERT', async (payload: InsertPayload) => {
    if (payload.kind === 'sections') {
      await insertSections(payload);
      return;
    }
    await insertLevel1(payload);
  });

  on<RefreshHandler>('REFRESH', async () => {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify('Select one or more HomeToGo cards first.', { error: true });
      return;
    }
    const tagged = collectTaggedFrames(selection);
    if (tagged.length === 0) {
      figma.notify('No inserted HomeToGo cards in the current selection.', { error: true });
      return;
    }
    let refreshed = 0;
    const fresh: SceneNode[] = [];
    for (const node of tagged) {
      const offerId = node.getPluginData('htgOfferId');
      const offer = OFFER_BY_ID[offerId];
      if (!offer) continue;
      const locale = (node.getPluginData('htgLocale') as Locale) || 'en';
      const platform = (node.getPluginData('htgPlatform') as Platform) || 'web';
      const sectionKind = node.getPluginData('htgSectionKind') as SectionKind | '';
      const parent = node.parent;
      if (!parent || !('children' in parent)) continue;
      const replacement = sectionKind
        ? await buildSection(sectionKind, offer, locale)
        : await buildCard(offer, locale, platform);
      replacement.x = node.x;
      replacement.y = node.y;
      const idx = parent.children.indexOf(node);
      parent.insertChild(idx, replacement);
      node.remove();
      fresh.push(replacement);
      refreshed++;
    }
    if (fresh.length > 0) figma.currentPage.selection = fresh;
    figma.notify(
      refreshed === 0
        ? 'Nothing refreshed — offer data not found.'
        : `Refreshed ${refreshed} HomeToGo ${refreshed === 1 ? 'card' : 'cards'}`,
    );
  });
}

function collectTaggedFrames(selection: readonly SceneNode[]): FrameNode[] {
  const out: FrameNode[] = [];
  const visit = (node: SceneNode) => {
    if (node.type === 'FRAME' && node.getPluginData('htgOfferId')) {
      out.push(node);
      return;
    }
    if ('children' in node) {
      for (const child of node.children) visit(child);
    }
  };
  for (const s of selection) visit(s);
  return out;
}

async function insertLevel1(payload: InsertCardsPayload): Promise<void> {
  const { offers, mode, gridColumns, locale, platform } = payload;
  if (offers.length === 0) return;

  const target = firstTargetInSelection(figma.currentPage.selection);
  if (target && mode === 'single' && offers.length === 1) {
    const filled = await populateSelection(target, offers[0], locale);
    if (filled > 0) {
      figma.notify(
        `Populated ${filled} layer${filled === 1 ? '' : 's'} in "${target.name}"`,
      );
      return;
    }
    figma.notify(
      `No #fieldName layers in "${target.name}" — inserting a new card instead.`,
    );
  }

  const created = await insertCards(offers, mode, gridColumns, locale, platform);
  figma.currentPage.selection = created;
  figma.viewport.scrollAndZoomIntoView(created);

  const verb = mode === 'grid' ? 'grid' : mode === 'list' ? 'list' : 'card';
  figma.notify(
    offers.length === 1
      ? `Inserted "${offers[0].title}" (${platform}, ${locale.toUpperCase()})`
      : `Inserted ${offers.length} properties as a ${verb}`,
  );
}

async function insertCards(
  offers: Offer[],
  mode: InsertMode,
  gridColumns: number,
  locale: Locale,
  platform: Platform,
): Promise<SceneNode[]> {
  const spec = PLATFORM_SPEC[platform];

  if (mode === 'single') {
    const created: SceneNode[] = [];
    let x = figma.viewport.center.x - spec.cardWidth / 2;
    let y = figma.viewport.center.y - spec.cardHeight / 2;
    for (const offer of offers) {
      const card = await buildCard(offer, locale, platform);
      card.x = x;
      card.y = y;
      figma.currentPage.appendChild(card);
      created.push(card);
      x += 40;
      y += 40;
    }
    return created;
  }

  const container = figma.createFrame();
  container.name =
    mode === 'grid'
      ? `HTG Search Grid (${offers.length}) · ${platform}`
      : `HTG Search Results (${offers.length}) · ${platform}`;
  container.layoutMode = mode === 'grid' ? 'HORIZONTAL' : 'VERTICAL';
  container.itemSpacing = LAYOUT_GAP;
  container.paddingTop = container.paddingBottom = CONTAINER_PADDING;
  container.paddingLeft = container.paddingRight = CONTAINER_PADDING;
  container.cornerRadius = 20;
  container.fills = [{ type: 'SOLID', color: { r: 0.969, g: 0.976, b: 0.988 } }];

  if (mode === 'grid') {
    const cols = Math.max(1, Math.min(4, gridColumns || 2));
    container.layoutWrap = 'WRAP';
    container.counterAxisSpacing = LAYOUT_GAP;
    const gridWidth =
      cols * spec.cardWidth + (cols - 1) * LAYOUT_GAP + CONTAINER_PADDING * 2;
    container.resizeWithoutConstraints(gridWidth, 1);
    container.primaryAxisSizingMode = 'FIXED';
  } else {
    container.primaryAxisSizingMode = 'AUTO';
  }
  container.counterAxisSizingMode = 'AUTO';

  for (const offer of offers) {
    const card = await buildCard(offer, locale, platform);
    container.appendChild(card);
  }
  container.counterAxisSizingMode = 'AUTO';

  container.x = figma.viewport.center.x - container.width / 2;
  container.y = figma.viewport.center.y - container.height / 2;
  figma.currentPage.appendChild(container);
  return [container];
}

async function insertSections(payload: InsertSectionsPayload): Promise<void> {
  const { offerId, sections, locale } = payload;
  const offer = OFFER_BY_ID[offerId];
  if (!offer || sections.length === 0) {
    figma.notify('Pick at least one section to insert.', { error: true });
    return;
  }

  const container = figma.createFrame();
  container.name = `HTG Detail · ${offer.title}`;
  container.layoutMode = 'VERTICAL';
  container.primaryAxisSizingMode = 'AUTO';
  container.counterAxisSizingMode = 'AUTO';
  container.itemSpacing = LAYOUT_GAP;
  container.paddingTop = container.paddingBottom = CONTAINER_PADDING;
  container.paddingLeft = container.paddingRight = CONTAINER_PADDING;
  container.cornerRadius = 24;
  container.fills = [{ type: 'SOLID', color: { r: 0.969, g: 0.976, b: 0.988 } }];

  for (const kind of sections) {
    const node = await buildSection(kind, offer, locale);
    container.appendChild(node);
  }

  container.x = figma.viewport.center.x - container.width / 2;
  container.y = figma.viewport.center.y - container.height / 2;
  figma.currentPage.appendChild(container);

  figma.currentPage.selection = [container];
  figma.viewport.scrollAndZoomIntoView([container]);
  figma.notify(
    sections.length === 1
      ? `Inserted "${sections[0]}" for "${offer.title}"`
      : `Inserted ${sections.length} detail sections for "${offer.title}"`,
  );
}
