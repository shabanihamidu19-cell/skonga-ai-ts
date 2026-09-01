import type { ThemeMode } from '../types';
import { STORAGE_KEYS } from '../config';
import { loadJson, saveJson } from '../utils/storage';

const THEME_KEY = STORAGE_KEYS.THEME;

export function getStoredTheme(): ThemeMode {
  return loadJson<ThemeMode>(THEME_KEY, 'dark');
}

export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  let resolved: 'dark' | 'light' = 'dark';

  if (mode === 'auto') {
    resolved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } else {
    resolved = mode;
  }

  root.setAttribute('data-theme', resolved);
  saveJson(THEME_KEY, mode);
}

export function initTheme(): void {
  applyTheme(getStoredTheme());

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (getStoredTheme() === 'auto') applyTheme('auto');
  });
}
