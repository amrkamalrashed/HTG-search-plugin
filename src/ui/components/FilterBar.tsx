import { h } from 'preact';
import styles from '../styles.css';
import type { PropertyType } from '@shared/types';

export interface Filters {
  propertyType?: PropertyType;
  minRating?: number;
  priceMax?: number;
  minGuests?: number;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const PROPERTY_TYPES: PropertyType[] = ['apartment', 'villa', 'house', 'chalet', 'cabin', 'cottage', 'studio', 'penthouse'];

export function FilterBar({ filters, onChange }: Props) {
  const toggle = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value });

  const clearAll = () => onChange({});
  const hasAny = Object.values(filters).some((v) => v !== undefined);

  return (
    <div class={styles.filterBar}>
      <button
        class={`${styles.chip} ${!hasAny ? styles.chipActive : ''}`}
        onClick={clearAll}
      >
        All
      </button>
      <button
        class={`${styles.chip} ${filters.priceMax === 150 ? styles.chipActive : ''}`}
        onClick={() => toggle('priceMax', 150)}
      >
        Under €150
      </button>
      <button
        class={`${styles.chip} ${filters.priceMax === 300 ? styles.chipActive : ''}`}
        onClick={() => toggle('priceMax', 300)}
      >
        Under €300
      </button>
      <button
        class={`${styles.chip} ${filters.minRating === 4.5 ? styles.chipActive : ''}`}
        onClick={() => toggle('minRating', 4.5)}
      >
        ★ 4.5+
      </button>
      <button
        class={`${styles.chip} ${filters.minGuests === 4 ? styles.chipActive : ''}`}
        onClick={() => toggle('minGuests', 4)}
      >
        4+ guests
      </button>
      <button
        class={`${styles.chip} ${filters.minGuests === 8 ? styles.chipActive : ''}`}
        onClick={() => toggle('minGuests', 8)}
      >
        8+ guests
      </button>
      {PROPERTY_TYPES.map((t) => (
        <button
          key={t}
          class={`${styles.chip} ${filters.propertyType === t ? styles.chipActive : ''}`}
          onClick={() => toggle('propertyType', t)}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}
