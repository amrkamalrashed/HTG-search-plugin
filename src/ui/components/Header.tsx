import { h } from 'preact';
import type { InsertMode } from '@shared/messages';
import styles from '../styles.css';

interface Props {
  mode: InsertMode;
  onModeChange: (mode: InsertMode) => void;
  onRefresh: () => void;
}

const MODES: Array<{ id: InsertMode; label: string }> = [
  { id: 'single', label: 'Single' },
  { id: 'list', label: 'List' },
  { id: 'grid', label: 'Grid' },
];

export function Header({ mode, onModeChange, onRefresh }: Props) {
  return (
    <div class={styles.header}>
      <div class={styles.logo}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="htgLogoGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#6B42E8" />
              <stop offset="1" stop-color="#D149C5" />
            </linearGradient>
          </defs>
          <path
            d="M12 2.5 2.5 10v11a1.5 1.5 0 0 0 1.5 1.5h4.5v-7h7v7H20a1.5 1.5 0 0 0 1.5-1.5V10L12 2.5z"
            fill="url(#htgLogoGrad)"
          />
        </svg>
        <span class={styles.logoText}>
          Home<span class={styles.logoAccent}>to</span>Go
        </span>
      </div>
      <div class={styles.headerRight}>
        <button
          class={styles.refreshBtn}
          onClick={onRefresh}
          title="Refresh selected cards (re-render against current data)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
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
    </div>
  );
}
