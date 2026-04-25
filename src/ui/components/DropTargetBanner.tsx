import { h } from 'preact';
import type { SelectionTargetInfo } from '@shared/messages';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import styles from '../styles.css';

interface Props {
  target: SelectionTargetInfo;
  replace: boolean;
  onReplaceChange: (next: boolean) => void;
  locale: Locale;
}

/**
 * Banner that appears at the top of the search level whenever the
 * user has selected a non-HTG frame on the canvas. Tells them where
 * the next drop will land and offers a Replace toggle:
 *
 *   - Replace OFF (default): a dropped card is appended as a child of
 *     the target frame, leaving any existing siblings in place.
 *   - Replace ON: the target's children are removed first, so the
 *     dropped card becomes the only child.
 *
 * The banner specifically shows whether the target has #fieldName
 * layers — the main-thread router will prefer populate over fill
 * when those exist, regardless of the Replace toggle (Replace only
 * gates the fill path).
 */
export function DropTargetBanner({ target, replace, onReplaceChange, locale }: Props) {
  return (
    <div class={styles.dropBanner}>
      <div class={styles.dropBannerText}>
        <span class={styles.dropBannerTitle}>
          {target.hasFieldNames
            ? t('uiDropBannerWithFields', locale, { name: target.name, n: 1 })
            : t('uiDropBanner', locale, { name: target.name })}
        </span>
        {!target.hasFieldNames && (
          <span class={styles.dropBannerSub}>
            {replace ? '↻' : '+'} {target.id.slice(0, 6)}
          </span>
        )}
      </div>
      {!target.hasFieldNames && (
        <label class={styles.dropBannerToggle}>
          <span>{t('uiDropBannerReplace', locale)}</span>
          <span
            class={`${styles.dropBannerSwitch} ${replace ? styles.dropBannerSwitchOn : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onReplaceChange(!replace);
            }}
            role="switch"
            aria-checked={replace}
          />
        </label>
      )}
    </div>
  );
}
