import { on, showUI } from '@create-figma-plugin/utilities';
import productsJson from '@data/products.json';
import type { Offer } from '@shared/types';
import type {
  InsertHandler,
  InsertMode,
  LoadedPayload,
  RefreshHandler,
  SaveStateHandler,
  UiState,
} from '@shared/messages';
import { buildCard } from './generate';
import { CARD } from './brand';
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
  showUI({ width: 420, height: 680 }, { ...initialData });

  on<SaveStateHandler>('SAVE_STATE', async (state) => {
    await figma.clientStorage.setAsync(UI_STATE_KEY, state);
  });

  on<InsertHandler>('INSERT', async ({ offers, mode, gridColumns }) => {
    if (offers.length === 0) return;

    const target = firstTargetInSelection(figma.currentPage.selection);
    if (target && mode === 'single' && offers.length === 1) {
      const filled = await populateSelection(target, offers[0]);
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

    const created = await insertCards(offers, mode, gridColumns);
    figma.currentPage.selection = created;
    figma.viewport.scrollAndZoomIntoView(created);

    const verb = mode === 'grid' ? 'grid' : mode === 'list' ? 'list' : 'card';
    figma.notify(
      offers.length === 1
        ? `Inserted "${offers[0].title}"`
        : `Inserted ${offers.length} properties as a ${verb}`,
    );
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
      const parent = node.parent;
      if (!parent || !('children' in parent)) continue;
      const card = await buildCard(offer);
      card.x = node.x;
      card.y = node.y;
      const idx = parent.children.indexOf(node);
      parent.insertChild(idx, card);
      node.remove();
      fresh.push(card);
      refreshed++;
    }
    if (fresh.length > 0) figma.currentPage.selection = fresh;
    figma.notify(
      refreshed === 0
        ? 'Nothing refreshed — offer data not found.'
        : `Refreshed ${refreshed} HomeToGo card${refreshed === 1 ? '' : 's'}`,
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

async function insertCards(
  offers: Offer[],
  mode: InsertMode,
  gridColumns: number,
): Promise<SceneNode[]> {
  if (mode === 'single') {
    const created: SceneNode[] = [];
    let x = figma.viewport.center.x - CARD.width / 2;
    let y = figma.viewport.center.y - CARD.height / 2;
    for (const offer of offers) {
      const card = await buildCard(offer);
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
      ? `HTG Search Grid (${offers.length})`
      : `HTG Search Results (${offers.length})`;
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
      cols * CARD.width + (cols - 1) * LAYOUT_GAP + CONTAINER_PADDING * 2;
    container.resizeWithoutConstraints(gridWidth, 1);
    container.primaryAxisSizingMode = 'FIXED';
  } else {
    container.primaryAxisSizingMode = 'AUTO';
  }
  container.counterAxisSizingMode = 'AUTO';

  for (const offer of offers) {
    const card = await buildCard(offer);
    container.appendChild(card);
  }

  // Re-affirm hug so Figma recomputes the counter-axis size after the
  // wrap layout has measured all children (fixes the grid-hug issue).
  container.counterAxisSizingMode = 'AUTO';

  container.x = figma.viewport.center.x - container.width / 2;
  container.y = figma.viewport.center.y - container.height / 2;
  figma.currentPage.appendChild(container);
  return [container];
}
