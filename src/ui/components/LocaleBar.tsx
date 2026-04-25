import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Locale } from '@shared/locales';
import { LOCALES, t } from '@shared/locales';
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
        <span class={styles.localeGroupLabel}>{t('uiMarket', locale)}</span>
        <LocaleDropdown locale={locale} onChange={onLocaleChange} />
      </div>
      <div class={styles.localeGroup}>
        <span class={styles.localeGroupLabel}>{t('uiSurface', locale)}</span>
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

/**
 * Custom locale picker. Replaces the native `<select>` so we control
 * the chevron, flag rendering, and active checkmark — Figma's plugin
 * iframes restyle native selects inconsistently across platforms,
 * and a real dropdown is what every other menu in this plugin uses.
 */
function LocaleDropdown({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const current = LOCALES.find((l) => l.id === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div class={styles.localeDropdown} ref={wrapRef}>
      <button
        class={styles.localeTrigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span class={styles.localeFlag} aria-hidden="true">{current.flag}</span>
        <span class={styles.localeLabel}>{current.label}</span>
        <svg
          class={styles.localeChevron}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div class={styles.localeMenu} role="listbox">
          {LOCALES.map((l) => {
            const active = l.id === locale;
            return (
              <button
                key={l.id}
                class={`${styles.localeMenuItem} ${active ? styles.localeMenuItemActive : ''}`}
                onClick={() => {
                  onChange(l.id);
                  setOpen(false);
                }}
                role="option"
                aria-selected={active}
              >
                <span class={styles.localeMenuCheck}>{active ? '✓' : ''}</span>
                <span class={styles.localeFlag} aria-hidden="true">{l.flag}</span>
                <span class={styles.localeMenuLabel}>{l.label}</span>
                <span class={styles.localeMenuCode}>{l.code}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
