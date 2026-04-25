import { h } from 'preact';
import type { SortKey, MultiLayout } from '@shared/messages';
import type { Locale, StringKey } from '@shared/locales';
import { t } from '@shared/locales';
import styles from '../styles.css';

interface Props {
  count: number;
  total: number;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  multiLayout: MultiLayout;
  gridColumns: number;
  onGridColumnsChange: (n: number) => void;
  locale: Locale;
}

const SORT_LABEL_KEYS: Record<SortKey, StringKey> = {
  default: 'uiSortRecommended',
  priceAsc: 'uiSortPriceAsc',
  priceDesc: 'uiSortPriceDesc',
  ratingDesc: 'uiSortTopRated',
  newest: 'uiSortNewListings',
};

export function SortBar({
  count,
  total,
  sort,
  onSortChange,
  multiLayout,
  gridColumns,
  onGridColumnsChange,
  locale,
}: Props) {
  return (
    <div class={styles.sortBar}>
      <span class={styles.sortCount}>
        {count === total
          ? t('uiNProperties', locale, { n: total })
          : t('uiNOfTotal', locale, { n: count, total })}
      </span>
      <div class={styles.sortBarRight}>
        {multiLayout === 'grid' && (
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
            {(Object.keys(SORT_LABEL_KEYS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {t(SORT_LABEL_KEYS[k], locale)}
              </option>
            ))}
          </select>
          <span class={styles.sortSelectChevron}>▾</span>
        </div>
      </div>
    </div>
  );
}
