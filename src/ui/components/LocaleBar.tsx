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
  return (
    <div class={styles.localeBar}>
      <div class={styles.localeGroup}>
        <span class={styles.localeGroupLabel}>Locale</span>
        <div class={styles.pillGroup}>
          {LOCALES.map((l) => (
            <button
              key={l.id}
              class={`${styles.pillBtn} ${locale === l.id ? styles.pillBtnActive : ''}`}
              onClick={() => onLocaleChange(l.id)}
              title={l.label}
            >
              <span class={styles.flag}>{l.flag}</span>
              <span class={styles.localeCode}>{l.id.toUpperCase()}</span>
            </button>
          ))}
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
