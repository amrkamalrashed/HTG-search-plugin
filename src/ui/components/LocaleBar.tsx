import { h } from 'preact';
import type { Locale } from '@shared/locales';
import { LOCALES } from '@shared/locales';
import type { Platform } from '@shared/platforms';
import { PLATFORMS } from '@shared/platforms';
import styles from '../styles.css';

interface Props {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  platform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

export function LocaleBar({ locale, onLocaleChange, platform, onPlatformChange }: Props) {
  const current = LOCALES.find((l) => l.id === locale) ?? LOCALES[0];
  return (
    <div class={styles.localeBar}>
      <div class={styles.localeGroup}>
        <span class={styles.localeGroupLabel}>Market</span>
        <div class={styles.marketSelectWrap}>
          <span class={styles.marketSelectFlag}>{current.flag}</span>
          <select
            class={styles.marketSelect}
            value={locale}
            onChange={(e) => onLocaleChange((e.target as HTMLSelectElement).value as Locale)}
          >
            {LOCALES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.flag}  {l.label} ({l.id.toUpperCase()})
              </option>
            ))}
          </select>
          <span class={styles.marketSelectChevron}>▾</span>
        </div>
      </div>
      <div class={styles.localeGroup}>
        <span class={styles.localeGroupLabel}>Surface</span>
        <div class={styles.pillGroup}>
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              class={`${styles.pillBtn} ${platform === p.id ? styles.pillBtnActive : ''}`}
              onClick={() => onPlatformChange(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
