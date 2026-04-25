import { h } from 'preact';
import type { InsertMode, SelectionTarget } from '@shared/messages';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import styles from '../styles.css';

interface Props {
  target: SelectionTarget;
  replace: boolean;
  onReplaceChange: (next: boolean) => void;
  /** What will land if the user clicks Drop right now. Drives the
      banner's sub-line so they know exactly what's about to happen. */
  selectedCount: number;
  mode: InsertMode;
  locale: Locale;
}

/**
 * Banner that appears at the top of the search level whenever the
 * user has selected a non-HomeDrop frame on the canvas. Tells them
 * where the next drop will land, what will land, and offers a
 * Replace toggle:
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
export function DropTargetBanner({
  target,
  replace,
  onReplaceChange,
  selectedCount,
  mode,
  locale,
}: Props) {
  // Build the sub-line that describes what will land.
  const sub = (() => {
    if (selectedCount === 0) {
      return t('uiDropBannerSubNone', locale);
    }
    if (target.hasFieldNames) {
      return t('uiDropBannerSubPopulate', locale, { n: selectedCount });
    }
    if (mode === 'single' || selectedCount === 1) {
      return t('uiDropBannerSubSingle', locale);
    }
    return t(
      mode === 'list' ? 'uiDropBannerSubList' : 'uiDropBannerSubGrid',
      locale,
      { n: selectedCount },
    );
  })();

  return (
    <div class={styles.dropBanner}>
      <div class={styles.dropBannerText}>
        <span class={styles.dropBannerTitle}>
          {target.hasFieldNames
            ? t('uiDropBannerWithFields', locale, { name: target.name, n: 1 })
            : t('uiDropBanner', locale, { name: target.name })}
        </span>
        <span class={styles.dropBannerSub}>{sub}</span>
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
