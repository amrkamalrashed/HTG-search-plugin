import { h, Fragment } from 'preact';
import type { Offer } from '@shared/types';
import type { SectionKind } from '@shared/messages';
import type { Locale } from '@shared/locales';
import { t } from '@shared/locales';
import { DetailView } from './DetailView';
import styles from '../styles.css';

interface Props {
  offer: Offer;
  selectedSections: Set<SectionKind>;
  toggleSection: (kind: SectionKind) => void;
  selectAllSections: () => void;
  clearAllSections: () => void;
  onBack: () => void;
  onSectionDragStart: (kind: SectionKind, e: DragEvent) => void;
  onCardDragStart: (e: DragEvent) => void;
  onInsertSections: () => void;
  locale: Locale;
}

/**
 * Level-2 layout: detail view of one property + a footer that drops
 * the picked sections. Shared plugin chrome (Header, LocaleBar,
 * ResizeHandle, overlays) is rendered by App.tsx around this.
 */
export function LevelDetail({
  offer,
  selectedSections,
  toggleSection,
  selectAllSections,
  clearAllSections,
  onBack,
  onSectionDragStart,
  onCardDragStart,
  onInsertSections,
  locale,
}: Props) {
  const count = selectedSections.size;
  return (
    <Fragment>
      <DetailView
        offer={offer}
        selected={selectedSections}
        onToggle={toggleSection}
        onBack={onBack}
        onSelectAll={selectAllSections}
        onClear={clearAllSections}
        onSectionDragStart={onSectionDragStart}
        onCardDragStart={onCardDragStart}
        locale={locale}
      />
      <div class={styles.footer}>
        <div class={`${styles.footerInfo} ${count > 0 ? styles.footerInfoActive : ''}`}>
          {count === 0
            ? t('uiPickSectionsToInsert', locale)
            : count === 1
              ? t('uiNSection', locale, { n: 1 })
              : t('uiNSections', locale, { n: count })}
        </div>
        <button
          class={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onInsertSections}
          disabled={count === 0}
        >
          {count === 0
            ? t('uiSelectSections', locale)
            : count === 1
              ? t('uiInsertSection', locale)
              : t('uiInsertNSections', locale, { n: count })}
        </button>
      </div>
    </Fragment>
  );
}
