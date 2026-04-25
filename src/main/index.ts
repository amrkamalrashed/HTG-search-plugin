import { emit, on, showUI } from '@create-figma-plugin/utilities';
import productsJson from '@data/products.json';
import type { Offer } from '@shared/types';
import type {
  DropHandler,
  DropPayload,
  FindAllHandler,
  HighlightOfferHandler,
  InsertCardsPayload,
  InsertHandler,
  InsertMode,
  InsertPayload,
  InsertResultHandler,
  InsertSectionsPayload,
  LoadedPayload,
  RefreshHandler,
  ResizeHandler,
  SaveStateHandler,
  SaveUiSizeHandler,
  SectionKind,
  SelectionTargetHandler,
  SelectionTargetInfo,
  UiSize,
  UiState,
  UndoHandler,
} from '@shared/messages';
import type { Locale } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { PLATFORM_SPEC } from '@shared/platforms';
import { buildCard } from './generate';
import { buildSection } from './sections';
import {
  fillIntoTarget,
  firstTargetInSelection,
  hasFieldNames,
  populateSelection,
} from './populate';

const OFFERS = productsJson as unknown as Offer[];
const OFFER_BY_ID: Record<string, Offer> = Object.fromEntries(
  OFFERS.map((o) => [o.id, o]),
);
const LAYOUT_GAP = 16;
const UI_STATE_KEY = 'htgUiState';
const UI_SIZE_KEY = 'htgUiSize';
const DEFAULT_SIZE: UiSize = { width: 420, height: 720 };
const MIN_SIZE: UiSize = { width: 360, height: 480 };
const MAX_SIZE: UiSize = { width: 900, height: 1200 };

export default async function () {
  const savedState = (await figma.clientStorage.getAsync(UI_STATE_KEY)) as
    | UiState
    | undefined;
  const savedSize = ((await figma.clientStorage.getAsync(UI_SIZE_KEY)) as
    | UiSize
    | undefined) ?? DEFAULT_SIZE;
  const uiSize = clampSize(savedSize);

  const initialData: LoadedPayload = {
    offers: OFFERS,
    savedState,
    uiSize,
  };
  showUI({ width: uiSize.width, height: uiSize.height }, { ...initialData });

  on<SaveStateHandler>('SAVE_STATE', async (state) => {
    await figma.clientStorage.setAsync(UI_STATE_KEY, state);
  });

  on<SaveUiSizeHandler>('SAVE_UI_SIZE', async (size) => {
    await figma.clientStorage.setAsync(UI_SIZE_KEY, clampSize(size));
  });

  on<ResizeHandler>('RESIZE', (size) => {
    const c = clampSize(size);
    figma.ui.resize(c.width, c.height);
  });

  on<InsertHandler>('INSERT', async (payload: InsertPayload) => {
    if (payload.kind === 'sections') {
      await insertSections(payload);
      return;
    }
    await insertLevel1(payload);
  });

  on<DropHandler>('DROP', async (payload) => {
    await handleDrop(payload);
  });

  on<UndoHandler>('UNDO', async ({ nodeIds }) => {
    let removed = 0;
    for (const id of nodeIds) {
      const node = await figma.getNodeByIdAsync(id);
      if (node && !node.removed && 'remove' in node) {
        (node as SceneNode).remove();
        removed++;
      }
    }
    figma.notify(
      removed === 0 ? 'Nothing to undo.' : `Undid ${removed} insert${removed === 1 ? '' : 's'}.`,
    );
  });

  on<FindAllHandler>('FIND_ALL', () => {
    const tagged: SceneNode[] = [];
    const visit = (node: BaseNode) => {
      if ('getPluginData' in node) {
        const id = (node as SceneNode).getPluginData('htgOfferId');
        if (id && (node as SceneNode).type === 'FRAME') tagged.push(node as SceneNode);
      }
      if ('children' in node) {
        for (const child of (node as ChildrenMixin).children) visit(child);
      }
    };
    visit(figma.currentPage);
    if (tagged.length === 0) {
      figma.notify('No HTG cards on this page.');
      return;
    }
    figma.currentPage.selection = tagged;
    figma.viewport.scrollAndZoomIntoView(tagged);
    figma.notify(`Selected ${tagged.length} HTG node${tagged.length === 1 ? '' : 's'}.`);
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

  // Wire canvas → UI awareness. We surface two things on every selection
  // change: the offerId of a tagged HTG card (so the matching tile can
  // pulse), and the "drop target" — a frame the user has selected so the
  // UI can show the "Drop into 'X'" banner with a Replace toggle.
  figma.on('selectionchange', () => {
    pushHighlight();
    pushSelectionTarget();
  });
  // Initial push so the UI starts in sync.
  pushHighlight();
  pushSelectionTarget();
}

function clampSize(s: UiSize): UiSize {
  return {
    width: Math.max(MIN_SIZE.width, Math.min(MAX_SIZE.width, Math.round(s.width))),
    height: Math.max(MIN_SIZE.height, Math.min(MAX_SIZE.height, Math.round(s.height))),
  };
}

function pushHighlight(): void {
  const sel = figma.currentPage.selection;
  let offerId: string | null = null;
  for (const node of sel) {
    if (node.type === 'FRAME') {
      const id = node.getPluginData('htgOfferId');
      if (id) {
        offerId = id;
        break;
      }
    }
  }
  emit<HighlightOfferHandler>('HIGHLIGHT_OFFER', { offerId });
}

function pushSelectionTarget(): void {
  const sel = figma.currentPage.selection;
  const target = firstTargetInSelection(sel);
  if (!target) {
    emit<SelectionTargetHandler>('SELECTION_TARGET', null);
    return;
  }
  // Skip nodes that are themselves an inserted HTG card — they aren't
  // useful drop targets, only refresh targets.
  if (target.getPluginData('htgOfferId')) {
    emit<SelectionTargetHandler>('SELECTION_TARGET', null);
    return;
  }
  const info: SelectionTargetInfo = {
    id: target.id,
    name: target.name || 'Frame',
    hasFieldNames: hasFieldNames(target),
  };
  emit<SelectionTargetHandler>('SELECTION_TARGET', info);
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
  const label =
    offers.length === 1
      ? `Inserted "${offers[0].title}" (${platform}, ${locale.toUpperCase()})`
      : `Inserted ${offers.length} properties as a ${verb}`;
  figma.notify(label);
  emit<InsertResultHandler>('INSERT_RESULT', {
    nodeIds: created.map((n) => n.id),
    label,
    kind: 'inserted',
  });
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

  // Pure layout frame — no background fill, no padding, no corner
  // radius. It groups the cards for auto-layout only so designers can
  // drop it into their own screen chrome.
  const container = figma.createFrame();
  container.name =
    mode === 'grid'
      ? `HTG Card Grid · ${platform} · ${offers.length}`
      : `HTG Card List · ${platform} · ${offers.length}`;
  container.layoutMode = mode === 'grid' ? 'HORIZONTAL' : 'VERTICAL';
  container.itemSpacing = LAYOUT_GAP;
  container.fills = [];
  container.paddingTop = container.paddingBottom = 0;
  container.paddingLeft = container.paddingRight = 0;
  container.cornerRadius = 0;

  if (mode === 'grid') {
    const cols = Math.max(1, Math.min(4, gridColumns || 2));
    container.layoutWrap = 'WRAP';
    container.counterAxisSpacing = LAYOUT_GAP;
    const gridWidth = cols * spec.cardWidth + (cols - 1) * LAYOUT_GAP;
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
  const { offerId, sections, locale, platform } = payload;
  const offer = OFFER_BY_ID[offerId];
  if (!offer || sections.length === 0) {
    figma.notify('Pick at least one section to insert.', { error: true });
    return;
  }

  // Single section → drop it on the canvas directly. No wrapper.
  if (sections.length === 1) {
    const node = await buildSection(sections[0], offer, locale, platform);
    node.x = figma.viewport.center.x - node.width / 2;
    node.y = figma.viewport.center.y - node.height / 2;
    figma.currentPage.appendChild(node);
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
    const label = `Inserted "${sections[0]}" for "${offer.title}"`;
    figma.notify(label);
    emit<InsertResultHandler>('INSERT_RESULT', {
      nodeIds: [node.id],
      label,
      kind: 'inserted',
    });
    return;
  }

  // Multiple sections → pure auto-layout group (no fills, no padding,
  // no radius) so designers can drop it straight into their own screen
  // chrome without having to unstyle a wrapper.
  const container = figma.createFrame();
  container.name = `HTG Sections · ${platform} · ${offer.title}`;
  container.layoutMode = 'VERTICAL';
  container.primaryAxisSizingMode = 'AUTO';
  container.counterAxisSizingMode = 'AUTO';
  container.itemSpacing = platform === 'web' ? LAYOUT_GAP : 0;
  container.fills = [];
  container.paddingTop = container.paddingBottom = 0;
  container.paddingLeft = container.paddingRight = 0;
  container.cornerRadius = 0;

  for (const kind of sections) {
    const node = await buildSection(kind, offer, locale, platform);
    container.appendChild(node);
  }

  container.x = figma.viewport.center.x - container.width / 2;
  container.y = figma.viewport.center.y - container.height / 2;
  figma.currentPage.appendChild(container);

  figma.currentPage.selection = [container];
  figma.viewport.scrollAndZoomIntoView([container]);
  const label = `Inserted ${sections.length} detail sections for "${offer.title}"`;
  figma.notify(label);
  emit<InsertResultHandler>('INSERT_RESULT', {
    nodeIds: [container.id],
    label,
    kind: 'inserted',
  });
}

type DropMode = 'populate' | 'fill' | 'viewport';

/**
 * Picks where a tile-drop should land based on:
 *   - whether the user has a frame selected,
 *   - whether that frame has any #fieldName layers (populate-eligible),
 *   - and the user's Replace toggle state.
 *
 * Rules:
 *   selection has #fields  → populate (Replace toggle ignored)
 *   selection w/o #fields  → fill    (Replace flag determines clear vs append)
 *   no selection           → viewport (drop at canvas coords)
 */
function resolveDropTarget(
  target: ReturnType<typeof firstTargetInSelection>,
): DropMode {
  if (!target) return 'viewport';
  if (target.getPluginData('htgOfferId')) return 'viewport';
  return hasFieldNames(target) ? 'populate' : 'fill';
}

async function handleDrop(payload: DropPayload): Promise<void> {
  const { offerId, locale, platform, canvasX, canvasY, replaceOnDrop } = payload;
  const offer = OFFER_BY_ID[offerId];
  if (!offer) return;

  const target = firstTargetInSelection(figma.currentPage.selection);
  const mode = resolveDropTarget(target);

  if (mode === 'populate' && target) {
    const filled = await populateSelection(target, offer, locale);
    if (filled > 0) {
      const label = `Populated ${filled} layer${filled === 1 ? '' : 's'} in "${target.name}".`;
      figma.notify(label);
      emit<InsertResultHandler>('INSERT_RESULT', {
        nodeIds: [],
        label,
        kind: 'populated',
      });
      return;
    }
    // No layer keys matched — fall through to fill.
  }

  if ((mode === 'fill' || mode === 'populate') && target) {
    const card = await buildCard(offer, locale, platform);
    fillIntoTarget(target, card, !!replaceOnDrop);
    figma.currentPage.selection = [card];
    const label = `${replaceOnDrop ? 'Replaced into' : 'Dropped into'} "${target.name}".`;
    figma.notify(label);
    emit<InsertResultHandler>('INSERT_RESULT', {
      nodeIds: [card.id],
      label,
      kind: replaceOnDrop ? 'replaced' : 'dropped',
    });
    return;
  }

  // Viewport fallback: place the card at the drop point on the page.
  const card = await buildCard(offer, locale, platform);
  if (typeof canvasX === 'number' && typeof canvasY === 'number') {
    card.x = canvasX - card.width / 2;
    card.y = canvasY - card.height / 2;
  } else {
    card.x = figma.viewport.center.x - card.width / 2;
    card.y = figma.viewport.center.y - card.height / 2;
  }
  figma.currentPage.appendChild(card);
  figma.currentPage.selection = [card];
  const label = `Dropped "${offer.title}" on the canvas.`;
  figma.notify(label);
  emit<InsertResultHandler>('INSERT_RESULT', {
    nodeIds: [card.id],
    label,
    kind: 'dropped',
  });
}
