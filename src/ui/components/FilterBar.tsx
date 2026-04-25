import { h } from 'preact';
import styles from '../styles.css';
import type { PropertyType } from '@shared/types';
import type { Locale, StringKey } from '@shared/locales';
import { t } from '@shared/locales';

export interface Filters {
  propertyType?: PropertyType;
  minRating?: number;
  priceMax?: number;
  minGuests?: number;
  favouritesOnly?: boolean;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  /** Number of favourited offers; drives the chip's count badge. */
  favouritesCount: number;
  locale: Locale;
}

const PROPERTY_TYPES: PropertyType[] = ['apartment', 'villa', 'house', 'chalet', 'cabin', 'cottage', 'studio', 'penthouse'];

export function FilterBar({ filters, onChange, favouritesCount, locale }: Props) {
  const toggle = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value });

  const clearAll = () => onChange({});
  const hasAny = Object.values(filters).some((v) => v !== undefined && v !== false);

  return (
    <div class={styles.filterBar}>
      <button
        class={`${styles.chip} ${!hasAny ? styles.chipActive : ''}`}
        onClick={clearAll}
      >
        {t('uiFilterAll', locale)}
      </button>
      <button
        class={`${styles.chip} ${filters.favouritesOnly ? styles.chipActive : ''}`}
        onClick={() => toggle('favouritesOnly', filters.favouritesOnly ? undefined : true)}
        disabled={favouritesCount === 0}
        title={
          favouritesCount === 0
            ? t('uiFilterFavouritesEmpty', locale)
            : t('uiFilterFavourites', locale, { n: favouritesCount })
        }
      >
        ★ {t('uiFilterFavourites', locale, { n: favouritesCount })}
      </button>
      <button
        class={`${styles.chip} ${filters.priceMax === 150 ? styles.chipActive : ''}`}
        onClick={() => toggle('priceMax', 150)}
      >
        {t('uiFilterPriceMax', locale, { amount: '€150' })}
      </button>
      <button
        class={`${styles.chip} ${filters.priceMax === 300 ? styles.chipActive : ''}`}
        onClick={() => toggle('priceMax', 300)}
      >
        {t('uiFilterPriceMax', locale, { amount: '€300' })}
      </button>
      <button
        class={`${styles.chip} ${filters.minRating === 4.5 ? styles.chipActive : ''}`}
        onClick={() => toggle('minRating', 4.5)}
      >
        {t('uiFilterRatingPlus', locale)}
      </button>
      <button
        class={`${styles.chip} ${filters.minGuests === 4 ? styles.chipActive : ''}`}
        onClick={() => toggle('minGuests', 4)}
      >
        {t('uiFilterGuestsPlus', locale, { n: 4 })}
      </button>
      <button
        class={`${styles.chip} ${filters.minGuests === 8 ? styles.chipActive : ''}`}
        onClick={() => toggle('minGuests', 8)}
      >
        {t('uiFilterGuestsPlus', locale, { n: 8 })}
      </button>
      {PROPERTY_TYPES.map((pt) => (
        <button
          key={pt}
          class={`${styles.chip} ${filters.propertyType === pt ? styles.chipActive : ''}`}
          onClick={() => toggle('propertyType', pt)}
        >
          {t(pt as StringKey, locale)}
        </button>
      ))}
    </div>
  );
}
