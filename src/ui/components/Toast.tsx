import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import styles from '../styles.css';

interface Props {
  message: string;
  /** When provided, an Undo button is shown that fires this callback. */
  onUndo?: () => void;
  onDismiss: () => void;
  locale: Locale;
  /** Lifetime in ms. Default 5000. */
  duration?: number;
}

/**
 * Bottom-centred toast with an optional Undo affordance. Auto-dismisses
 * after `duration` ms (default 5 s). Each new message resets the timer.
 */
export function Toast({ message, onUndo, onDismiss, locale, duration = 5000 }: Props) {
  useEffect(() => {
    const handle = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(handle);
  }, [message, duration, onDismiss]);

  return (
    <div class={styles.toastWrap} role="status" aria-live="polite">
      <div class={styles.toast}>
        <span>{message}</span>
        {onUndo && (
          <button class={styles.toastUndo} onClick={onUndo}>
            {t('uiToastUndo', locale)}
          </button>
        )}
      </div>
    </div>
  );
}
