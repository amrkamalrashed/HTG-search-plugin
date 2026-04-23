import { h } from 'preact';
import type { SortKey, InsertMode } from '@shared/messages';
import styles from '../styles.css';

interface Props {
  count: number;
  total: number;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  mode: InsertMode;
  gridColumns: number;
  onGridColumnsChange: (n: number) => void;
}

const SORT_LABELS: Record<SortKey, string> = {
  default: 'Recommended',
  priceAsc: 'Price: low to high',
  priceDesc: 'Price: high to low',
  ratingDesc: 'Top rated',
  newest: 'New listings',
};

export function SortBar({
  count,
  total,
  sort,
  onSortChange,
  mode,
  gridColumns,
  onGridColumnsChange,
}: Props) {
  return (
    <div class={styles.sortBar}>
      <span class={styles.sortCount}>
        {count === total ? `${total} properties` : `${count} of ${total}`}
      </span>
      <div class={styles.sortBarRight}>
        {mode === 'grid' && (
          <div class={styles.colStepper}>
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                class={`${styles.colStepperBtn} ${gridColumns === n ? styles.colStepperBtnActive : ''}`}
                onClick={() => onGridColumnsChange(n)}
                title={`${n} columns`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
        <div class={styles.sortSelectWrap}>
          <select
            class={styles.sortSelect}
            value={sort}
            onChange={(e) => onSortChange((e.target as HTMLSelectElement).value as SortKey)}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
          <span class={styles.sortSelectChevron}>▾</span>
        </div>
      </div>
    </div>
  );
}
