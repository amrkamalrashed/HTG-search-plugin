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
        {/*
          PoC brand mark — squircle home in the primary HomeToGo gradient.
          When the official wordmark SVG is available, drop it in place of
          this <svg> block; the `.logo` flex row is sized for ~24px tall
          art + the "hometogo" text lockup.
        */}
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="htgLogoGrad" x1="2" y1="2" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#6B42E8" />
              <stop offset="1" stop-color="#D149C5" />
            </linearGradient>
          </defs>
          <path
            d="M13 1.4 1.9 10.2a3 3 0 0 0-1.1 2.35V21.5A3.5 3.5 0 0 0 4.3 25h17.4a3.5 3.5 0 0 0 3.5-3.5v-8.95a3 3 0 0 0-1.1-2.35L13 1.4z"
            fill="url(#htgLogoGrad)"
          />
          <path
            d="M10 25v-6.2a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2V25"
            stroke="#ffffff"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
        <span class={styles.logoText}>
          home<span class={styles.logoAccent}>to</span>go
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
