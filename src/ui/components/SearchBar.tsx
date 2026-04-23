import { h } from 'preact';
import styles from '../styles.css';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div class={styles.searchRow}>
      <div class={styles.searchBox}>
        <span class={styles.searchIcon}>⌕</span>
        <input
          class={styles.searchInput}
          type="text"
          placeholder="Where to? City or country"
          value={value}
          onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        />
      </div>
    </div>
  );
}
