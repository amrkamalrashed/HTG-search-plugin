import { emit, on, showUI } from '@create-figma-plugin/utilities';
import type { Offer } from '@shared/types';
import type {
  Appearance,
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

/**
 * "Replace mode" — when a designer has a frame selected on canvas
 * and clicks Drop (or drags onto it), we want the dropped card to
 * land at that frame's exact position and remove the original. The
 * frame is treated as a positioning placeholder. We skip HomeDrop's
 * own inserted cards (recognised by their htgOfferId plugin-data).
 */
type ReplaceableFrame = FrameNode | ComponentNode | InstanceNode;

function isReplaceableFrame(node: SceneNode | undefined | null): node is ReplaceableFrame {
  if (!node) return false;
  if (node.type !== 'FRAME' && node.type !== 'COMPONENT' && node.type !== 'INSTANCE') {
    return false;
  }
  // Existing HomeDrop cards (those carrying htgOfferId plugin-data)
  // are intentionally replaceable too — swapping an old property card
  // with a new one is one of the main reasons to use this feature.
  return true;
}

function firstReplaceableFrameInSelection(
  selection: readonly SceneNode[],
): ReplaceableFrame | null {
  for (const node of selection) {
    if (isReplaceableFrame(node)) return node;
  }
  return null;
}

/** Drop `child` at the position the placeholder frame currently sits in,
 *  then remove the placeholder. Inherits the placeholder's parent +
 *  index so the card slots into auto-layout containers correctly. */
function replaceFrame(placeholder: ReplaceableFrame, child: SceneNode): void {
  const parent = placeholder.parent;
  if (!parent || !('appendChild' in parent)) {
    figma.currentPage.appendChild(child);
    child.x = placeholder.x;
    child.y = placeholder.y;
    placeholder.remove();
    return;
  }
  const idx = 'children' in parent ? (parent as ChildrenMixin).children.indexOf(placeholder) : -1;
  if (idx >= 0 && 'insertChild' in parent) {
    (parent as ChildrenMixin & { insertChild(i: number, c: SceneNode): void }).insertChild(idx, child);
  } else {
    (parent as ChildrenMixin & SceneNode).appendChild(child);
  }
  child.x = placeholder.x;
  child.y = placeholder.y;
  placeholder.remove();
}

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
      figma.notify('Select one or more HomeDrop cards first');
      return;
    }
    const tagged = collectTaggedFrames(selection);
    if (tagged.length === 0) {
      figma.notify('No inserted HomeDrop cards in the current selection');
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
      const appearance = (node.getPluginData('htgAppearance') as Appearance) || 'light';
      const sectionKind = node.getPluginData('htgSectionKind') as SectionKind | '';
      const parent = node.parent;
      if (!parent || !('children' in parent)) continue;
      const replacement = sectionKind
        ? await buildSection(sectionKind, offer, locale, platform, appearance)
        : await buildCard(offer, locale, platform, appearance);
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
    // Diagnostic: surface what Figma actually delivered. Some browsers
    // / Figma versions silently drop custom MIME types from the
    // iframe; if we land here with only `text/plain` we know the
    // application/htg-* payload didn't survive the iframe boundary.
    if (event.items.length === 0) {
      figma.notify('Drop received no items — drag payload was lost', { error: true });
      return true;
    }
    const types = event.items.map((it) => it.type).join(', ');
    for (const item of event.items) {
      if (item.type === 'application/htg-offer') {
        const body = safeParse(item.data) as
          | { offerId?: string; locale?: Locale; platform?: Platform; appearance?: Appearance }
          | null;
        if (!body || !body.offerId) {
          figma.notify('Drop body parse failed', { error: true });
          continue;
        }
        if (!OFFER_BY_ID[body.offerId]) {
          figma.notify(`Drop: offer ${body.offerId} not in cache (have ${Object.keys(OFFER_BY_ID).length})`, { error: true });
          continue;
        }
        handleNativeDropOffer(
          body.offerId,
          body.locale ?? 'en',
          body.platform ?? 'web',
          body.appearance ?? 'light',
          event,
        ).catch((err) => {
          figma.notify(`Drop failed: ${err instanceof Error ? err.message : String(err)}`, { error: true });
        });
        return false;
      }
      if (item.type === 'application/htg-offer-multi') {
        const body = safeParse(item.data) as
          | { offerIds?: string[]; locale?: Locale; platform?: Platform; mode?: InsertMode; appearance?: Appearance }
          | null;
        if (!body || !Array.isArray(body.offerIds) || body.offerIds.length === 0) continue;
        void handleNativeDropMulti(
          body.offerIds,
          body.locale ?? 'en',
          body.platform ?? 'web',
          body.mode ?? 'list',
          body.appearance ?? 'light',
          event,
        );
        return false;
      }
      if (item.type === 'application/htg-section') {
        const body = safeParse(item.data) as
          | { offerId?: string; sectionKind?: SectionKind; locale?: Locale; platform?: Platform; appearance?: Appearance }
          | null;
        if (!body || !body.offerId || !body.sectionKind) continue;
        void handleNativeDropSection(
          body.offerId,
          body.sectionKind,
          body.locale ?? 'en',
          body.platform ?? 'web',
          body.appearance ?? 'light',
          event,
        );
        return false;
      }
    }
    // No HomeDrop MIME matched but items did arrive — surface the
    // types so we can diagnose if Figma stripped our application/htg-*
    // and only delivered text/plain.
    figma.notify(`Drop: no HomeDrop MIME (got ${types})`, { error: true });
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
  appearance: Appearance,
  event: DropEvent,
): Promise<void> {
  const offer = OFFER_BY_ID[offerId];
  if (!offer) return;

  const card = await buildCard(offer, locale, platform, appearance);

  // Dropped onto a frame (any frame, including a previously-inserted
  // HomeDrop card) → replace mode: swap the frame for the new card at
  // the same canvas position, inheriting the parent + index.
  const placeholder = isReplaceableFrame(event.node as SceneNode) ? (event.node as ReplaceableFrame) : null;
  if (placeholder) {
    replaceFrame(placeholder, card);
    figma.currentPage.selection = [card];
    emit<InsertedHandler>('INSERTED', {
      createdNodeIds: [card.id],
      label: 'Card dropped',
      kind: 'dropped',
    });
    return;
  }

  await landAtDropEvent(card, event);
  emit<InsertedHandler>('INSERTED', {
    createdNodeIds: [card.id],
    label: 'Card dropped',
    kind: 'dropped',
  });
}

async function handleNativeDropMulti(
  offerIds: string[],
  locale: Locale,
  platform: Platform,
  mode: InsertMode,
  appearance: Appearance,
  event: DropEvent,
): Promise<void> {
  const offers = offerIds.map((id) => OFFER_BY_ID[id]).filter((o): o is Offer => !!o);
  if (offers.length === 0) return;
  const created = await insertCards(offers, mode, 2, locale, platform, appearance);
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
  appearance: Appearance,
  event: DropEvent,
): Promise<void> {
  const offer = OFFER_BY_ID[offerId];
  if (!offer) return;
  const node = await buildSection(kind, offer, locale, platform, appearance);
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
  const { offers, mode, gridColumns, locale, platform, appearance } = payload;
  if (offers.length === 0) return;

  // Replace mode — single-card single-offer with a frame selected:
  // swap the frame for the new card at its current canvas position
  // (same parent, same index in the auto-layout container if any).
  // Works on plain placeholder frames AND previously-inserted HomeDrop
  // cards, so designers can swap an existing card with a different
  // property without having to delete + re-drop.
  if (mode === 'single' && offers.length === 1) {
    const placeholder = firstReplaceableFrameInSelection(figma.currentPage.selection);
    if (placeholder) {
      const card = await buildCard(offers[0], locale, platform, appearance);
      replaceFrame(placeholder, card);
      figma.currentPage.selection = [card];
      figma.viewport.scrollAndZoomIntoView([card]);
      figma.notify('Card replaced');
      emit<InsertedHandler>('INSERTED', {
        createdNodeIds: [card.id],
        label: 'Card replaced',
        kind: 'dropped',
      });
      return;
    }
  }

  const created = await insertCards(offers, mode, gridColumns, locale, platform, appearance);
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
  appearance: Appearance,
): Promise<SceneNode[]> {
  const spec = PLATFORM_SPEC[platform];

  if (mode === 'single') {
    const created: SceneNode[] = [];
    let x = figma.viewport.center.x - spec.cardWidth / 2;
    let y = figma.viewport.center.y - spec.cardHeight / 2;
    for (const offer of offers) {
      const card = await buildCard(offer, locale, platform, appearance);
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
    const card = await buildCard(offer, locale, platform, appearance);
    container.appendChild(card);
  }
  container.counterAxisSizingMode = 'AUTO';

  container.x = figma.viewport.center.x - container.width / 2;
  container.y = figma.viewport.center.y - container.height / 2;
  figma.currentPage.appendChild(container);
  return [container];
}

async function insertSections(payload: InsertSectionsPayload): Promise<void> {
  const { offerId, sections, locale, platform, appearance } = payload;
  const offer = OFFER_BY_ID[offerId];
  if (!offer || sections.length === 0) {
    figma.notify('Pick at least one section to drop');
    return;
  }

  // Single section → drop it on the canvas directly. No wrapper.
  if (sections.length === 1) {
    const node = await buildSection(sections[0], offer, locale, platform, appearance);
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
  container.itemSpacing = LAYOUT_GAP;
  container.fills = [];
  container.paddingTop = container.paddingBottom = 0;
  container.paddingLeft = container.paddingRight = 0;
  container.cornerRadius = 0;

  for (const kind of sections) {
    const node = await buildSection(kind, offer, locale, platform, appearance);
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

