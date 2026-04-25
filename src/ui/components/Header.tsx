import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { InsertMode, Theme, UiPreset } from '@shared/messages';
import type { Locale, StringKey } from '@shared/locales';
import { t } from '@shared/locales';
import { PresetsMenu } from './PresetsMenu';
import styles from '../styles.css';

interface Props {
  mode: InsertMode;
  onModeChange: (mode: InsertMode) => void;
  onRefresh: () => void;
  onFindAll: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  presets: UiPreset[];
  onApplyPreset: (p: UiPreset) => void;
  onSavePreset: () => void;
  onDeletePreset: (id: string) => void;
  locale: Locale;
}

const MODES: Array<{ id: InsertMode; labelKey: StringKey }> = [
  { id: 'single', labelKey: 'uiModeSingle' },
  { id: 'list', labelKey: 'uiModeList' },
  { id: 'grid', labelKey: 'uiModeGrid' },
];

const THEMES: Array<{ id: Theme; labelKey: StringKey; icon: string }> = [
  { id: 'auto', labelKey: 'uiThemeAuto', icon: '◐' },
  { id: 'light', labelKey: 'uiThemeLight', icon: '☀' },
  { id: 'dark', labelKey: 'uiThemeDark', icon: '☾' },
];

export function Header({
  mode,
  onModeChange,
  onRefresh,
  onFindAll,
  theme,
  onThemeChange,
  presets,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  locale,
}: Props) {
  const [themeOpen, setThemeOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!themeOpen) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [themeOpen]);

  const currentTheme = THEMES.find((th) => th.id === theme) ?? THEMES[0];

  return (
    <div class={styles.header}>
      <div class={styles.logo}>
        <HomeToGoMark />
      </div>
      <div class={styles.headerRight}>
        <button
          class={styles.iconBtn}
          onClick={onFindAll}
          title={t('uiFindAllTooltip', locale)}
          aria-label={t('uiFindAll', locale)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
            <path d="M11 8v6" />
            <path d="M8 11h6" />
          </svg>
        </button>
        <div class={styles.themeMenu} ref={wrapRef}>
          <button
            class={styles.iconBtn}
            onClick={() => setThemeOpen((v) => !v)}
            title={`${t('uiThemeTooltip', locale)} · ${t(currentTheme.labelKey, locale)}`}
            aria-label={t('uiThemeTooltip', locale)}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>{currentTheme.icon}</span>
          </button>
          {themeOpen && (
            <div class={styles.themeDropdown} role="menu">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  class={`${styles.themeDropdownItem} ${theme === th.id ? styles.themeDropdownItemActive : ''}`}
                  onClick={() => {
                    onThemeChange(th.id);
                    setThemeOpen(false);
                  }}
                  role="menuitem"
                >
                  <span style={{ width: '14px', textAlign: 'center' }}>{th.icon}</span>
                  <span>{t(th.labelKey, locale)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <PresetsMenu
          presets={presets}
          onApply={onApplyPreset}
          onSave={onSavePreset}
          onDelete={onDeletePreset}
          locale={locale}
        />
        <button
          class={styles.iconBtn}
          onClick={onRefresh}
          title={t('uiRefresh', locale)}
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
              {t(m.labelKey, locale)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Official HomeToGo wordmark. Source: assets/hometogo-logo.svg.
function HomeToGoMark() {
  return (
    <svg
      width="56"
      height="30"
      viewBox="0 0 104 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="HomeToGo"
    >
      <path d="M87.4004 46.1C87.4004 44.7 88.5004 43.6 89.9004 43.6H100.8C102.2 43.6 103.3 44.7 103.3 46.1C103.3 47.5 102.2 48.6 100.8 48.6H89.8004C88.5004 48.5 87.4004 47.4 87.4004 46.1Z" fill="#612ACE" />
      <path d="M87.4004 46.1C87.4004 44.7 88.5004 43.6 89.9004 43.6H100.8C102.2 43.6 103.3 44.7 103.3 46.1C103.3 47.5 102.2 48.6 100.8 48.6H89.8004C88.5004 48.5 87.4004 47.4 87.4004 46.1Z" fill="url(#htgDot0)" fill-opacity="0.9" />
      <path d="M87.4004 46.1C87.4004 44.7 88.5004 43.6 89.9004 43.6H100.8C102.2 43.6 103.3 44.7 103.3 46.1C103.3 47.5 102.2 48.6 100.8 48.6H89.8004C88.5004 48.5 87.4004 47.4 87.4004 46.1Z" fill="url(#htgDot1)" fill-opacity="0.56" />
      <path d="M0.3 26.1C0.1 26.1 0 26 0 25.8V1.5C0 1.4 0.1 1.2 0.2 1.2L4.6 0C4.8 0 5 0.1 5 0.3V10.5C6.2 9 7.8 8.3 9.8 8.3C11.7 8.3 13.2 8.9 14.5 10.2C15.8 11.5 16.4 13 16.4 14.9V25.7C16.4 25.9 16.3 26 16.1 26H11.8C11.6 26 11.5 25.9 11.5 25.7V16.3C11.5 15.3 11.2 14.6 10.5 13.9C9.9 13.3 9.1 12.9 8.2 12.9C7.3 12.9 6.5 13.2 5.8 13.9C5.3 14.6 5 15.3 5 16.3V25.7C5 25.9 4.9 26 4.7 26H0.3V26.1Z" fill="currentColor" />
      <path d="M20.8002 23.9C19.1002 22.1 18.2002 20 18.2002 17.4C18.2002 14.8 19.1002 12.7 20.8002 10.9C22.5002 9.09999 24.7002 8.29999 27.4002 8.29999C30.0002 8.29999 32.2002 9.19999 34.0002 10.9C35.8002 12.6 36.6002 14.8 36.6002 17.4C36.6002 19.9 35.7002 22.1 34.0002 23.9C32.2002 25.6 30.0002 26.5 27.4002 26.5C24.8002 26.5 22.6002 25.6 20.8002 23.9ZM27.4002 21.6C28.5002 21.6 29.5002 21.2 30.2002 20.4C31.0002 19.6 31.4002 18.6 31.4002 17.4C31.4002 16.2 31.0002 15.3 30.2002 14.5C29.4002 13.7 28.5002 13.3 27.4002 13.3C26.3002 13.3 25.3002 13.7 24.5002 14.5C23.7002 15.3 23.3002 16.3 23.3002 17.5C23.3002 18.7 23.7002 19.6 24.5002 20.5C25.3002 21.2 26.3002 21.6 27.4002 21.6Z" fill="currentColor" />
      <path d="M43.4 25.7C43.4 25.9 43.3 26 43.1 26H38.8C38.6 26 38.5 25.9 38.5 25.7V9.09999C38.5 8.89999 38.6 8.79999 38.8 8.79999H43C43.2 8.79999 43.3 8.89999 43.3 9.09999V10.3C44.4 8.99999 45.9 8.29999 47.8 8.29999C50.1 8.29999 51.8 9.19999 53 11C54.1 9.19999 55.8 8.29999 58.2 8.29999C60.1 8.29999 61.6 8.89999 62.9 10.2C64.2 11.4 64.8 12.9 64.8 14.8V25.8C64.8 26 64.7 26.1 64.5 26.1H60.2C60 26.1 59.9 26 59.9 25.8V16.2C59.9 15.3 59.6 14.6 59.1 14C58.5 13.3 57.9 13 57 13C56.2 13 55.5 13.3 54.9 13.9C54.3 14.5 54.1 15.2 54.1 16.1V25.7C54.1 25.9 54 26 53.8 26H49.5C49.3 26 49.2 25.9 49.2 25.7V16.1C49.2 15.2 48.9 14.5 48.4 13.9C47.8 13.3 47.2 13 46.3 13C45.5 13 44.8 13.3 44.2 13.9C43.6 14.5 43.4 15.2 43.4 16.1V25.7Z" fill="currentColor" />
      <path d="M84.7002 19.2H71.9002C72.2002 20.1 72.7002 20.8 73.5002 21.4C74.3002 22 75.1002 22.2 76.1002 22.2C77.4002 22.2 78.5002 21.7 79.4002 20.8C79.5002 20.7 79.6002 20.7 79.7002 20.7L83.9002 21.8C84.1002 21.9 84.2002 22.1 84.1002 22.3C83.3002 23.6 82.3002 24.4 81.0002 25.2C79.6002 26 77.9002 26.4 76.1002 26.4C73.4002 26.4 71.2002 25.5 69.4002 23.8C67.6002 22.1 66.7002 19.9 66.7002 17.3C66.7002 14.7 67.6002 12.6 69.3002 10.8C71.0002 9.00001 73.2002 8.20001 75.8002 8.20001C78.4002 8.20001 80.5002 9.10001 82.3002 10.8C84.0002 12.5 84.9002 14.7 84.9002 17.3C84.9002 18 84.8002 18.6 84.7002 19.2ZM71.9002 15.5H79.8002C79.5002 14.6 79.0002 13.9 78.2002 13.4C77.5002 12.9 76.6002 12.6 75.7002 12.6C74.8002 12.6 74.0002 12.9 73.3002 13.4C72.7002 13.9 72.2002 14.6 71.9002 15.5Z" fill="currentColor" />
      <path d="M11.5996 28C11.5996 27.8 11.6996 27.7 11.8996 27.7H16.1996C16.3996 27.7 16.4996 27.8 16.4996 28V31H20.0996C20.2996 31 20.3996 31.1 20.3996 31.3V35C20.3996 35.2 20.2996 35.3 20.0996 35.3H16.4996V41.8C16.4996 42.3 16.6996 42.8 16.9996 43.1C17.3996 43.4 17.7996 43.6 18.3996 43.6H20.0996C20.2996 43.6 20.3996 43.7 20.3996 43.9V47.9C20.3996 48.1 20.2996 48.2 20.0996 48.2H17.5996C15.8996 48.2 14.4996 47.7 13.2996 46.6C12.1996 45.5 11.5996 44.2 11.5996 42.7V28Z" fill="currentColor" />
      <path d="M24.1 46.1C22.4 44.4 21.5 42.2 21.5 39.6C21.5 37 22.4 34.9 24.1 33.2C25.8 31.5 28 30.6 30.7 30.6C33.3 30.6 35.5 31.5 37.2 33.2C39 34.9 39.8 37.1 39.8 39.6C39.8 42.1 38.9 44.3 37.2 46.1C35.4 47.8 33.3 48.7 30.7 48.7C28 48.6 25.8 47.8 24.1 46.1ZM30.7 43.7C31.8 43.7 32.8 43.3 33.5 42.5C34.3 41.7 34.7 40.7 34.7 39.6C34.7 38.5 34.3 37.5 33.5 36.7C32.8 35.9 31.8 35.5 30.7 35.5C29.6 35.5 28.6 35.9 27.8 36.7C27 37.5 26.6 38.5 26.6 39.6C26.6 40.7 27 41.7 27.8 42.5C28.6 43.3 29.5 43.7 30.7 43.7Z" fill="currentColor" />
      <path d="M47 39.6C47 37 47.8 34.9 49.3 33.2C50.8 31.5 52.8 30.6 55.1 30.6C56.9 30.6 58.5 31.1 59.9 32.2V31.4C59.9 31.2 60 31.1 60.2 31.1H64.5C64.7 31.1 64.8 31.2 64.8 31.4V47.8C64.8 50.1 64 52.1 62.3 53.6C60.6 55.2 58.6 56 56.1 56C54.1 56 52.3 55.5 50.8 54.5C49.3 53.5 48.3 52.4 47.8 51C47.7 50.8 47.8 50.6 48 50.6L52.3 49.5C52.5 49.5 52.6 49.5 52.7 49.7C53 50.2 53.4 50.6 54 50.9C54.6 51.3 55.3 51.4 56.1 51.4C57.2 51.4 58.1 51.1 58.8 50.4C59.6 49.7 59.9 48.9 59.9 47.9V47C58.5 48.1 56.9 48.6 55.1 48.6C52.8 48.6 50.8 47.7 49.3 46C47.8 44.3 47 42.2 47 39.6ZM56 35.5C54.9 35.5 54 35.9 53.3 36.7C52.6 37.5 52.2 38.5 52.2 39.7C52.2 40.8 52.6 41.8 53.3 42.6C54.1 43.4 55 43.8 56 43.8C57.1 43.8 58 43.4 58.7 42.6C59.5 41.8 59.8 40.9 59.8 39.7C59.8 38.5 59.4 37.5 58.7 36.7C58 35.9 57.1 35.5 56 35.5Z" fill="currentColor" />
      <path d="M69.3002 46C67.6002 44.3 66.7002 42.1 66.7002 39.6C66.7002 37.1 67.6002 34.9 69.3002 33.2C71.0002 31.5 73.2002 30.6 75.9002 30.6C78.5002 30.6 80.7002 31.5 82.5002 33.2C84.3002 34.9 85.2002 37 85.2002 39.6C85.2002 42.1 84.3002 44.3 82.5002 46C80.7002 47.7 78.5002 48.6 75.9002 48.6C73.2002 48.6 71.0002 47.7 69.3002 46ZM75.9002 43.7C77.0002 43.7 78.0002 43.3 78.7002 42.5C79.5002 41.7 79.9002 40.7 79.9002 39.6C79.9002 38.5 79.5002 37.5 78.7002 36.7C77.9002 35.9 77.0002 35.5 75.9002 35.5C74.8002 35.5 73.8002 35.9 73.0002 36.7C72.2002 37.5 71.8002 38.5 71.8002 39.6C71.8002 40.7 72.2002 41.7 73.0002 42.5C73.8002 43.3 74.7002 43.7 75.9002 43.7Z" fill="currentColor" />
      <defs>
        <radialGradient id="htgDot0" cx="0" cy="0" r="1" gradientTransform="matrix(-0.145063 -6.04544 -12.3875 0.297221 97.7573 49.6315)" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFD458" />
          <stop offset="0.986" stop-color="#FFD458" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="htgDot1" cx="0" cy="0" r="1" gradientTransform="matrix(-0.230487 -4.07176 -9.90485 0.560648 100.181 49.7878)" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFB4AE" />
          <stop offset="1" stop-color="#FFB4AE" stop-opacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
