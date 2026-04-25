import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import styles from '../styles.css';

export interface PaletteCommand {
  id: string;
  label: string;
  /** Optional right-aligned hint (e.g. "R", "⌘K"). */
  hint?: string;
  run: () => void;
}

interface Props {
  open: boolean;
  commands: PaletteCommand[];
  onClose: () => void;
  locale: Locale;
}

/**
 * Tiny command palette modeled on Linear / VSCode. Fuzzy substring
 * match: every space-separated token in the query has to appear (in
 * any order) in the command label. Up/Down/Enter to navigate.
 */
export function CommandPalette({ open, commands, onClose, locale }: Props) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    const tokens = q.split(/\s+/);
    return commands.filter((c) => {
      const hay = c.label.toLowerCase();
      return tokens.every((tok) => hay.includes(tok));
    });
  }, [commands, query]);

  useEffect(() => {
    if (active >= filtered.length) setActive(0);
  }, [filtered, active]);

  if (!open) return null;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) {
        cmd.run();
        onClose();
      }
    }
  };

  return (
    <div class={styles.paletteOverlay} onClick={onClose}>
      <div class={styles.palette} onClick={(e) => e.stopPropagation()}>
        <div class={styles.paletteInputWrap}>
          <span class={styles.searchIcon}>⌕</span>
          <input
            ref={inputRef}
            class={styles.paletteInput}
            placeholder={t('uiPalettePlaceholder', locale)}
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            onKeyDown={onKeyDown}
          />
          <span class={styles.paletteHint}>{t('uiPaletteHint', locale)}</span>
        </div>
        <div class={styles.paletteList}>
          {filtered.length === 0 ? (
            <div class={styles.paletteEmpty}>—</div>
          ) : (
            filtered.map((c, i) => (
              <button
                key={c.id}
                class={`${styles.paletteItem} ${i === active ? styles.paletteItemActive : ''}`}
                onClick={() => {
                  c.run();
                  onClose();
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span>{c.label}</span>
                {c.hint && <span class={styles.paletteItemHint}>{c.hint}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
