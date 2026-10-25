import { createContext, useContext } from 'react';

// ── THEME SYSTEM ──────────────────────────────────────────────────────────
// Every color in the app comes from these tokens. Text tokens meet WCAG AA
// (4.5:1) against `bg` and `surface` in their mode.

// Official EPA AQI category colors (airnow.gov). Used for the dial ring and
// swatches only — never as text — and always paired with the category label.
const AQI_COLORS = {
  good: '#00E400', moderate: '#FFFF00', sensitive: '#FF7E00',
  unhealthy: '#FF0000', veryUnhealthy: '#8F3F97', hazardous: '#7E0023',
};

export const THEMES = {
  light: {
    bg: '#F7F5F2', surface: '#FFFFFF', surfaceAlt: '#F2EFEB',
    text: '#1A1715', textMid: '#4A4540', textLight: '#6B655F',
    border: 'rgba(0,0,0,0.12)', borderLight: 'rgba(0,0,0,0.06)',
    header: '#1A1715', headerText: '#FFFFFF', headerSub: 'rgba(255,255,255,0.72)', headerChip: 'rgba(255,255,255,0.14)',
    tabBar: '#FFFFFF',
    card: '#FFFFFF', progressBg: 'rgba(255,255,255,0.18)',
    darkCard: '#1A1715', darkCardText: '#FFFFFF',
    darkCardSub: 'rgba(255,255,255,0.72)', darkCardMuted: 'rgba(255,255,255,0.45)', darkCardFill: 'rgba(255,255,255,0.06)',
    accent: '#E8450A', onAccent: '#FFFFFF',
    // Semantic status colors (text/icon color + tinted surface)
    success: '#2E7D5E', successBg: '#E8F5EE',
    warning: '#9A6100', warningBg: '#FFF6E0',
    danger: '#C0392B',  dangerBg: '#FDECEA',
    extreme: '#7B0000', extremeBg: '#F9E3E3',
    info: '#1C6EA4',    infoBg: '#EBF4FB',
    accentText: '#C2410C', accentBg: '#FEF0E7',
    aqi: AQI_COLORS,
  },
  dark: {
    bg: '#0F0F0F', surface: '#1C1C1E', surfaceAlt: '#2C2C2E',
    text: '#F2F2F7', textMid: '#C7C7CC', textLight: '#9A9AA0',
    border: 'rgba(255,255,255,0.14)', borderLight: 'rgba(255,255,255,0.07)',
    header: '#000000', headerText: '#F2F2F7', headerSub: 'rgba(255,255,255,0.72)', headerChip: 'rgba(255,255,255,0.14)',
    tabBar: '#1C1C1E',
    card: '#1C1C1E', progressBg: 'rgba(255,255,255,0.18)',
    darkCard: '#2C2C2E', darkCardText: '#F2F2F7',
    darkCardSub: 'rgba(255,255,255,0.72)', darkCardMuted: 'rgba(255,255,255,0.45)', darkCardFill: 'rgba(255,255,255,0.06)',
    accent: '#E8450A', onAccent: '#FFFFFF',
    success: '#4FAE84', successBg: 'rgba(46,125,94,0.2)',
    warning: '#E0A030', warningBg: 'rgba(192,122,0,0.2)',
    danger: '#FF6B5E',  dangerBg: 'rgba(192,57,43,0.22)',
    extreme: '#FF8A80', extremeBg: 'rgba(123,0,0,0.35)',
    info: '#5AABDE',    infoBg: 'rgba(28,110,164,0.2)',
    accentText: '#FF7A50', accentBg: 'rgba(232,69,10,0.16)',
    aqi: AQI_COLORS,
  },
};

// Brand accent — identical in both modes (kept for existing imports).
export const ACCENT = THEMES.light.accent;

// Estimated fire-risk level → semantic tone.
export const RISK_TONE = { Extreme:'extreme', High:'danger', Moderate:'warning', Low:'success', Minimal:'info' };

// Context holds the active mode string: 'light' | 'dark'
export const ThemeCtx = createContext('light');

export const useThemeMode = () => useContext(ThemeCtx);          // 'light' | 'dark'
export const useIsDark = () => useContext(ThemeCtx) === 'dark';  // boolean
export const useTheme = () => THEMES[useContext(ThemeCtx)];      // resolved palette object
