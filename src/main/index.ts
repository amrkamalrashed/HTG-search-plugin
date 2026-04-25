import { emit, on, showUI } from '@create-figma-plugin/utilities';
import type { Offer } from '@shared/types';
import type {
  FindAllHandler,
  HighlightHandler,
  InsertCardsPayload,
  InsertHandler,
  InsertMode,
  InsertPayload,
  InsertedHandler,
  InsertSectionsPayload,
  LoadedPayload,
  RefreshHandler,
  ResizeHandler,
  SaveStateHandler,
  SaveUiSizeHandler,
  SectionKind,
  SyncOffersHandler,
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
  firstTargetInSelection,
  hasFieldNames,
  populateSelection,
} from './populate';

// Catalogue cache. Populated by the UI via SYNC_OFFERS on every
// successful fetch (initial load + on locale change). Refresh / DROP /
// native drop look offers up here; the data source itself lives in
// the UI iframe (see src/ui/offers-source.ts).
let OFFERS: Offer[] = [];
const OFFER_BY_ID: Record<string, Offer> = {};

const LAYOUT_GAP = 16;
const UI_STATE_KEY = 'htgUiState';
const UI_SIZE_KEY = 'htgUiSize';
const DEFAULT_SIZE: UiSize = { width: 420, height: 720 };
const MIN_SIZE: UiSize = { width: 360, height: 480 };
const MAX_SIZE: UiSize = { width: 900, height: 1200 };

export default async function () {
  // Boot in parallel: only state Figma can hand us before the UI runs.
  // The catalogue itself is loaded on the UI side and synced back via
  // SYNC_OFFERS once it arrives.
  const [savedState, savedSizeRaw] = await Promise.all([
    figma.clientStorage.getAsync(UI_STATE_KEY) as Promise<UiState | undefined>,
    figma.clientStorage.getAsync(UI_SIZE_KEY) as Promise<UiSize | undefined>,
  ]);

  const uiSize = clampSize(savedSizeRaw ?? DEFAULT_SIZE);

  const initialData: LoadedPayload = {
    savedState,
    uiSize,
  };
  showUI({ width: uiSize.width, height: uiSize.height }, { ...initialData });

  on<SyncOffersHandler>('SYNC_OFFERS', ({ offers }) => {
    OFFERS = offers;
    for (const o of offers) OFFER_BY_ID[o.id] = o;
  });

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
      figma.notify('No HomeDrop cards on this page.');
      return;
    }
    figma.currentPage.selection = tagged;
    figma.viewport.scrollAndZoomIntoView(tagged);
    figma.notify(`Selected ${tagged.length} HomeDrop node${tagged.length === 1 ? '' : 's'}.`);
  });

  on<RefreshHandler>('REFRESH', async () => {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify('Select one or more HomeDrop cards first.', { error: true });
      return;
    }
    const tagged = collectTaggedFrames(selection);
    if (tagged.length === 0) {
      figma.notify('No inserted HomeDrop cards in the current selection.', { error: true });
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
        : `Refreshed ${refreshed} HomeDrop ${refreshed === 1 ? 'card' : 'cards'}`,
    );
  });

  // Wire canvas → UI awareness. We surface two things on every selection
  // change: the offerId of a tagged HomeDrop card (so the matching tile
  // can pulse), and the "drop target" — a frame the user has selected so
  figma.on('selectionchange', () => {
    pushHighlight();
  });
  // Initial push so the UI starts in sync.
  pushHighlight();

  // Native Figma drop event. Fires when the user releases a drag from
  // the plugin iframe over the canvas. We dispatch on three MIME types:
  //   - application/htg-offer       → single card
  //   - application/htg-offer-multi → list/grid of cards
  //   - application/htg-section     → a single detail-page section
  // Returning false tells Figma not to insert a default text node.
  figma.on('drop', (event) => {
    for (const item of event.items) {
      if (item.type === 'application/htg-offer') {
        const body = safeParse(item.data) as { offerId?: string; locale?: Locale; platform?: Platform } | null;
        if (!body || !body.offerId) continue;
        void handleNativeDropOffer(body.offerId, body.locale ?? 'en', body.platform ?? 'web', event);
        return false;
      }
      if (item.type === 'application/htg-offer-multi') {
        const body = safeParse(item.data) as
          | { offerIds?: string[]; locale?: Locale; platform?: Platform; mode?: InsertMode }
          | null;
        if (!body || !Array.isArray(body.offerIds) || body.offerIds.length === 0) continue;
        void handleNativeDropMulti(
          body.offerIds,
          body.locale ?? 'en',
          body.platform ?? 'web',
          body.mode ?? 'list',
          event,
        );
        return false;
      }
      if (item.type === 'application/htg-section') {
        const body = safeParse(item.data) as
          | { offerId?: string; sectionKind?: SectionKind; locale?: Locale; platform?: Platform }
          | null;
        if (!body || !body.offerId || !body.sectionKind) continue;
        void handleNativeDropSection(
          body.offerId,
          body.sectionKind,
          body.locale ?? 'en',
          body.platform ?? 'web',
          event,
        );
        return false;
      }
    }
    return true;
  });
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

async function handleNativeDropOffer(
  offerId: string,
  locale: Locale,
  platform: Platform,
  event: DropEvent,
): Promise<void> {
  const offer = OFFER_BY_ID[offerId];
  if (!offer) return;

  const dropTarget = nativeDropTargetFrame(event);
  if (dropTarget && hasFieldNames(dropTarget)) {
    const filled = await populateSelection(dropTarget, offer, locale);
    if (filled > 0) {
      const label = filled === 1 ? 'Filled 1 field' : `Filled ${filled} fields`;
      figma.notify(label);
      emit<InsertedHandler>('INSERTED', {
        createdNodeIds: [],
        label,
        kind: 'populated',
      });
      return;
    }
  }

  const card = await buildCard(offer, locale, platform);
  await landAtDropEvent(card, event);
  emit<InsertedHandler>('INSERTED', {
    createdNodeIds: [card.id],
    label: 'Card dropped',
    kind: 'dropped',
  });
}

function nativeDropTargetFrame(event: DropEvent): FrameNode | null {
  const n = event.node;
  if (n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'INSTANCE') {
    return n as FrameNode;
  }
  return null;
}

async function handleNativeDropMulti(
  offerIds: string[],
  locale: Locale,
  platform: Platform,
  mode: InsertMode,
  event: DropEvent,
): Promise<void> {
  const offers = offerIds.map((id) => OFFER_BY_ID[id]).filter((o): o is Offer => !!o);
  if (offers.length === 0) return;
  const created = await insertCards(offers, mode, 2, locale, platform);
  if (created.length > 0) {
    const first = created[0];
    first.x = event.absoluteX - first.width / 2;
    first.y = event.absoluteY - first.height / 2;
  }
  emit<InsertedHandler>('INSERTED', {
    createdNodeIds: created.map((n) => n.id),
    label: `${offers.length} cards dropped`,
    kind: 'dropped',
  });
}

async function handleNativeDropSection(
  offerId: string,
  kind: SectionKind,
  locale: Locale,
  platform: Platform,
  event: DropEvent,
): Promise<void> {
  const offer = OFFER_BY_ID[offerId];
  if (!offer) return;
  const node = await buildSection(kind, offer, locale, platform);
  await landAtDropEvent(node, event);
  emit<InsertedHandler>('INSERTED', {
    createdNodeIds: [node.id],
    label: 'Section dropped',
    kind: 'dropped',
  });
}

/**
 * Place a fresh node at the figma.on('drop') event coordinates.
 * If the drop landed inside a frame, we append as a child relative to
 * the frame's local coordinates; otherwise we drop on the page using
 * absoluteX / absoluteY.
 */
async function landAtDropEvent(node: SceneNode, event: DropEvent): Promise<void> {
  if (event.node.type === 'PAGE') {
    figma.currentPage.appendChild(node);
    node.x = event.absoluteX - node.width / 2;
    node.y = event.absoluteY - node.height / 2;
  } else if ('appendChild' in event.node) {
    (event.node as ChildrenMixin & SceneNode).appendChild(node);
    node.x = event.x - node.width / 2;
    node.y = event.y - node.height / 2;
  } else {
    figma.currentPage.appendChild(node);
    node.x = event.absoluteX - node.width / 2;
    node.y = event.absoluteY - node.height / 2;
  }
  figma.currentPage.selection = [node];
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
  emit<HighlightHandler>('HIGHLIGHT_OFFER', { offerId });
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
      const label = filled === 1 ? 'Filled 1 field' : `Filled ${filled} fields`;
      figma.notify(label);
      emit<InsertedHandler>('INSERTED', {
        createdNodeIds: [],
        label,
        kind: 'populated',
      });
      return;
    }
    figma.notify('No #fields found — dropped a card instead');
  }

  const created = await insertCards(offers, mode, gridColumns, locale, platform);
  figma.currentPage.selection = created;
  figma.viewport.scrollAndZoomIntoView(created);

  const label = offers.length === 1 ? 'Card dropped' : `${offers.length} cards dropped`;
  figma.notify(label);
  emit<InsertedHandler>('INSERTED', {
    createdNodeIds: created.map((n) => n.id),
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
      ? `HomeDrop Card Grid · ${platform} · ${offers.length}`
      : `HomeDrop Card List · ${platform} · ${offers.length}`;
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
    figma.notify('Pick at least one section to drop', { error: true });
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
    const label = 'Section dropped';
    figma.notify(label);
    emit<InsertedHandler>('INSERTED', {
      createdNodeIds: [node.id],
      label,
      kind: 'inserted',
    });
    return;
  }

  // Multiple sections → pure auto-layout group (no fills, no padding,
  // no radius) so designers can drop it straight into their own screen
  // chrome without having to unstyle a wrapper.
  const container = figma.createFrame();
  container.name = `HomeDrop Sections · ${platform} · ${offer.title}`;
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
  const label = `${sections.length} sections dropped`;
  figma.notify(label);
  emit<InsertedHandler>('INSERTED', {
    createdNodeIds: [container.id],
    label,
    kind: 'inserted',
  });
}

