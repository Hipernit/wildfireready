import { createContext, useContext } from 'react';

// ── THEME SYSTEM ──────────────────────────────────────────────────────────
export const THEMES = {
  light: {
    bg: '#F7F5F2', surface: '#FFFFFF', surfaceAlt: '#FAFAFA',
    text: '#1A1715', textMid: '#4A4540', textLight: '#9B948E',
    border: 'rgba(0,0,0,0.08)', borderLight: 'rgba(0,0,0,0.05)',
    header: '#1A1715', tabBar: '#FFFFFF',
    card: '#FFFFFF', progressBg: 'rgba(255,255,255,0.15)',
    darkCard: '#1A1715', darkCardText: '#FFFFFF',
    darkCardSub: 'rgba(255,255,255,0.6)', darkCardMuted: 'rgba(255,255,255,0.4)',
  },
  dark: {
    bg: '#0F0F0F', surface: '#1C1C1E', surfaceAlt: '#2C2C2E',
    text: '#F2F2F7', textMid: '#AEAEB2', textLight: '#636366',
    border: 'rgba(255,255,255,0.1)', borderLight: 'rgba(255,255,255,0.06)',
    header: '#000000', tabBar: '#1C1C1E',
    card: '#1C1C1E', progressBg: 'rgba(255,255,255,0.15)',
    darkCard: '#2C2C2E', darkCardText: '#F2F2F7',
    darkCardSub: 'rgba(255,255,255,0.6)', darkCardMuted: 'rgba(255,255,255,0.35)',
  },
};

// Brand accent — used in both modes
export const ACCENT = '#E8450A';

// Context holds the active mode string: 'light' | 'dark'
export const ThemeCtx = createContext('light');

export const useThemeMode = () => useContext(ThemeCtx);          // 'light' | 'dark'
export const useIsDark = () => useContext(ThemeCtx) === 'dark';  // boolean
export const useTheme = () => THEMES[useContext(ThemeCtx)];      // resolved palette object
