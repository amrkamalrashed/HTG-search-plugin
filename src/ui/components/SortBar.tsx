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
  onRandomize: () => void;
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
  onRandomize,
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
        <button
          class={styles.sortRandomizeBtn}
          onClick={onRandomize}
          title={t('uiRandomizeTooltip', locale)}
          aria-label={t('uiRandomize', locale)}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8" cy="8" r="1" fill="currentColor" />
            <circle cx="16" cy="8" r="1" fill="currentColor" />
            <circle cx="8" cy="16" r="1" fill="currentColor" />
            <circle cx="16" cy="16" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </svg>
        </button>
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
