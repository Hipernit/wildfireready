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
    // Semantic status colors (text/icon color + tinted surface)
    success: '#2E7D5E', successBg: '#E8F5EE',
    warning: '#C07A00', warningBg: '#FFF8E6',
    danger: '#C0392B',  dangerBg: '#FDECEA',
    info: '#1C6EA4',    infoBg: '#EBF4FB',
    accentText: '#E8450A', accentBg: '#FEF0E7', onAccent: '#FFFFFF',
  },
  dark: {
    bg: '#0F0F0F', surface: '#1C1C1E', surfaceAlt: '#2C2C2E',
    text: '#F2F2F7', textMid: '#AEAEB2', textLight: '#636366',
    border: 'rgba(255,255,255,0.1)', borderLight: 'rgba(255,255,255,0.06)',
    header: '#000000', tabBar: '#1C1C1E',
    card: '#1C1C1E', progressBg: 'rgba(255,255,255,0.15)',
    darkCard: '#2C2C2E', darkCardText: '#F2F2F7',
    darkCardSub: 'rgba(255,255,255,0.6)', darkCardMuted: 'rgba(255,255,255,0.35)',
    success: '#4FAE84', successBg: 'rgba(46,125,94,0.18)',
    warning: '#E0A030', warningBg: 'rgba(192,122,0,0.18)',
    danger: '#FF6B5E',  dangerBg: 'rgba(192,57,43,0.18)',
    info: '#5AABDE',    infoBg: 'rgba(28,110,164,0.15)',
    accentText: '#FF7A50', accentBg: 'rgba(232,69,10,0.15)', onAccent: '#FFFFFF',
  },
};

// Brand accent — used in both modes
export const ACCENT = '#E8450A';

// Context holds the active mode string: 'light' | 'dark'
export const ThemeCtx = createContext('light');

export const useThemeMode = () => useContext(ThemeCtx);          // 'light' | 'dark'
export const useIsDark = () => useContext(ThemeCtx) === 'dark';  // boolean
export const useTheme = () => THEMES[useContext(ThemeCtx)];      // resolved palette object
