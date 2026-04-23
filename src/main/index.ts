import { on, showUI } from '@create-figma-plugin/utilities';
import productsJson from '@data/products.json';
import type { Offer } from '@shared/types';
import type { InsertHandler, InsertMode, LoadedPayload } from '@shared/messages';
import { buildCard } from './generate';
import { CARD } from './brand';
import { firstTargetInSelection, populateSelection } from './populate';

const OFFERS = productsJson as unknown as Offer[];
const GRID_COLUMNS = 2;
const LAYOUT_GAP = 16;
const CONTAINER_PADDING = 20;

export default function () {
  const initialData: LoadedPayload = { offers: OFFERS };
  showUI({ width: 420, height: 680 }, { ...initialData });

  on<InsertHandler>('INSERT', async ({ offers, mode }) => {
    if (offers.length === 0) return;

    // Hybrid: if the user has a component/frame selected and picked single,
    // try the #fieldName populate path first.
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

    const created = await insertCards(offers, mode);
    figma.currentPage.selection = created;
    figma.viewport.scrollAndZoomIntoView(created);

    const verb = mode === 'grid' ? 'grid' : mode === 'list' ? 'list' : 'card';
    figma.notify(
      offers.length === 1
        ? `Inserted "${offers[0].title}"`
        : `Inserted ${offers.length} properties as a ${verb}`,
    );
  });
}

async function insertCards(offers: Offer[], mode: InsertMode): Promise<SceneNode[] > {
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
      // stagger if multiple in single mode (rare but possible)
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
  container.primaryAxisSizingMode = mode === 'grid' ? 'FIXED' : 'AUTO';
  container.counterAxisSizingMode = 'AUTO';
  container.itemSpacing = LAYOUT_GAP;
  if (mode === 'grid') {
    container.layoutWrap = 'WRAP';
    container.counterAxisSpacing = LAYOUT_GAP;
    const gridWidth =
      GRID_COLUMNS * CARD.width +
      (GRID_COLUMNS - 1) * LAYOUT_GAP +
      CONTAINER_PADDING * 2;
    container.resize(gridWidth, 1);
  }
  container.paddingTop = container.paddingBottom = CONTAINER_PADDING;
  container.paddingLeft = container.paddingRight = CONTAINER_PADDING;
  container.cornerRadius = 20;
  container.fills = [{ type: 'SOLID', color: { r: 0.969, g: 0.976, b: 0.988 } }];

  for (const offer of offers) {
    const card = await buildCard(offer);
    container.appendChild(card);
  }

  container.x = figma.viewport.center.x - container.width / 2;
  container.y = figma.viewport.center.y - container.height / 2;
  figma.currentPage.appendChild(container);
  return [container];
}
