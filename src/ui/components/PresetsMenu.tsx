import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import type { UiPreset } from '@shared/messages';
import styles from '../styles.css';

interface Props {
  presets: UiPreset[];
  onApply: (p: UiPreset) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  locale: Locale;
}

/**
 * Header dropdown that lists every saved preset and offers a "Save
 * current settings…" action. Closes on outside-click or Escape.
 *
 * The same preset machinery is also reachable via the ⌘K command
 * palette; this menu is for users who'd rather not memorise the
 * shortcut.
 */
export function PresetsMenu({ presets, onApply, onSave, onDelete, locale }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

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
    <div class={styles.presetsMenu} ref={wrapRef}>
      <button
        class={styles.iconBtn}
        onClick={() => setOpen((v) => !v)}
        title={t('uiPresetsTooltip', locale)}
        aria-label={t('uiPresetsTooltip', locale)}
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>
      {open && (
        <div class={styles.presetsDropdown} role="menu">
          {presets.length === 0 ? (
            <div class={styles.presetsEmpty}>{t('uiPresetsEmpty', locale)}</div>
          ) : (
            presets.map((p) => (
              <div key={p.id} class={styles.presetsRow}>
                <button
                  class={styles.presetsRowApply}
                  onClick={() => {
                    onApply(p);
                    setOpen(false);
                  }}
                  role="menuitem"
                >
                  <span class={styles.presetsRowLabel}>{p.label}</span>
                  <span class={styles.presetsRowMeta}>
                    {p.mode} · {p.platform} · {p.locale.toUpperCase()}
                  </span>
                </button>
                <button
                  class={styles.presetsRowDelete}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(p.id);
                  }}
                  title={t('uiPresetDelete', locale)}
                  aria-label={t('uiPresetDelete', locale)}
                >
                  ×
                </button>
              </div>
            ))
          )}
          <button
            class={styles.presetsSaveBtn}
            onClick={() => {
              onSave();
              setOpen(false);
            }}
          >
            + {t('uiPresetsSaveCurrent', locale)}
          </button>
        </div>
      )}
    </div>
  );
}
