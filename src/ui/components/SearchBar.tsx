import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import styles from '../styles.css';

interface Props {
  value: string;
  onChange: (value: string) => void;
  locale: Locale;
}

export function SearchBar({ value, onChange, locale }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Autofocus on mount so the search input is ready for typing as soon
  // as the plugin opens. Keeps focus on the input when the value is
  // cleared via the × button too.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div class={styles.searchRow}>
      <div class={styles.searchBox}>
        <span class={styles.searchIcon} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <input
          ref={inputRef}
          class={styles.searchInput}
          type="text"
          placeholder={t('uiSearchPlaceholder', locale)}
          value={value}
          onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        />
        {value && (
          <button
            class={styles.searchClearBtn}
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            title={t('uiSearchClear', locale)}
            aria-label={t('uiSearchClear', locale)}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
