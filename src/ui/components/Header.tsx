import { h } from 'preact';
import type { InsertMode } from '@shared/messages';
import styles from '../styles.css';

interface Props {
  mode: InsertMode;
  onModeChange: (mode: InsertMode) => void;
}

const MODES: Array<{ id: InsertMode; label: string }> = [
  { id: 'single', label: 'Single' },
  { id: 'list', label: 'List' },
  { id: 'grid', label: 'Grid' },
];

export function Header({ mode, onModeChange }: Props) {
  return (
    <div class={styles.header}>
      <div class={styles.logo}>
        <span class={styles.logoMark}>H</span>
        <span>HomeToGo</span>
      </div>
      <div class={styles.modeToggle} role="tablist">
        {MODES.map((m) => (
          <button
            key={m.id}
            class={`${styles.modeOption} ${mode === m.id ? styles.modeOptionActive : ''}`}
            onClick={() => onModeChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
