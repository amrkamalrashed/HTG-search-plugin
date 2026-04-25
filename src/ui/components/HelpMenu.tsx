import { h, Fragment } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import styles from '../styles.css';

interface Props {
  locale: Locale;
}

export function HelpMenu({ locale }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div class={styles.helpMenu} ref={wrapRef}>
      <button
        class={styles.iconBtn}
        onClick={() => setOpen((v) => !v)}
        title={t('uiHelpTooltip', locale)}
        aria-label={t('uiHelpTooltip', locale)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-.8.6-1.5 1-1.5 2" />
          <path d="M12 17h.01" />
        </svg>
      </button>
      {open && (
        <div class={styles.helpDropdown} role="menu">
          <div class={styles.helpHeading}>{t('uiHelpQuickGuide', locale)}</div>
          <ul class={styles.helpList}>
            <HelpItem
              title={t('uiHelpDropTitle', locale)}
              body={t('uiHelpDropBody', locale)}
            />
            <HelpItem
              title={t('uiHelpDragTitle', locale)}
              body={t('uiHelpDragBody', locale)}
            />
            <HelpItem
              title={t('uiHelpPopulateTitle', locale)}
              body={t('uiHelpPopulateBody', locale)}
            />
            <HelpItem
              title={t('uiHelpPaletteTitle', locale)}
              body={t('uiHelpPaletteBody', locale)}
              hint="⌘K"
            />
            <HelpItem
              title={t('uiHelpMultiTitle', locale)}
              body={t('uiHelpMultiBody', locale)}
            />
          </ul>
        </div>
      )}
    </div>
  );
}

function HelpItem({ title, body, hint }: { title: string; body: string; hint?: string }) {
  return (
    <li class={styles.helpItem}>
      <Fragment>
        <div class={styles.helpItemRow}>
          <span class={styles.helpItemTitle}>{title}</span>
          {hint && <span class={styles.helpItemHint}>{hint}</span>}
        </div>
        <div class={styles.helpItemBody}>{body}</div>
      </Fragment>
    </li>
  );
}
