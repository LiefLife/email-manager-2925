import type { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  font: {
    family:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  colors: {
    text: {
      primary: '#0b1220',
      secondary: 'rgba(11, 18, 32, 0.68)',
      muted: 'rgba(11, 18, 32, 0.5)',
      inverse: 'rgba(255, 255, 255, 0.92)',
    },
    brand: {
      indigo: '#4f46e5',
      violet: '#8b5cf6',
      cyan: '#22d3ee',
      pink: '#fb7185',
    },
    border: {
      soft: 'rgba(255, 255, 255, 0.28)',
      strong: 'rgba(255, 255, 255, 0.4)',
    },
  },
  background: {
    app: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 45%, #fae8ff 100%)',
    appLight: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #ddd6fe 100%)',
    glowA: 'radial-gradient(60% 60% at 20% 20%, rgba(34, 211, 238, 0.35) 0%, rgba(34, 211, 238, 0) 70%)',
    glowB: 'radial-gradient(55% 55% at 85% 25%, rgba(139, 92, 246, 0.35) 0%, rgba(139, 92, 246, 0) 72%)',
    glowC: 'radial-gradient(70% 70% at 65% 85%, rgba(251, 113, 133, 0.25) 0%, rgba(251, 113, 133, 0) 70%)',
  },
  radius: {
    sm: '10px',
    md: '14px',
    lg: '18px',
    xl: '22px',
  },
  glass: {
    blur: '18px',
    saturation: '170%',
    background: 'rgba(255, 255, 255, 0.10)',
    backgroundHover: 'rgba(255, 255, 255, 0.14)',
    backgroundStrong: 'rgba(255, 255, 255, 0.16)',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    borderStrong: '1px solid rgba(255, 255, 255, 0.30)',
    highlight:
      'inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 rgba(255, 255, 255, 0.10)',
  },
  shadow: {
    soft: '0 10px 30px rgba(0, 0, 0, 0.18)',
    lift: '0 18px 55px rgba(0, 0, 0, 0.26)',
    glow: '0 0 0 1px rgba(139, 92, 246, 0.16)',
    neuOuter:
      '10px 10px 26px rgba(0, 0, 0, 0.18), -10px -10px 26px rgba(255, 255, 255, 0.06)',
    neuInner:
      'inset 6px 6px 14px rgba(0, 0, 0, 0.18), inset -6px -6px 14px rgba(255, 255, 255, 0.05)',
  },
  control: {
    focusRing: '0 0 0 3px rgba(34, 211, 238, 0.25)',
  },
};
