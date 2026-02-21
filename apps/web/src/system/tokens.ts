export const colors = {
  background: '#0A0A0F',
  surface: '#1A1A2E',
  surfaceLight: '#2D2D44',
  
  cyan: '#00F0FF',
  violet: '#8B5CF6',
  
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textTertiary: '#6B6B7F',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
};

export const typography = {
  fontFamily: {
    ui: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
};

export const transitions = {
  fast: { duration: 0.15, ease: 'easeInOut' },
  base: { duration: 0.3, ease: 'easeOut' },
  slow: { duration: 0.5, ease: 'easeOut' },
};

export const spring = {
  micro: { stiffness: 400, damping: 25 },
  default: { stiffness: 300, damping: 30 },
  smooth: { stiffness: 200, damping: 35 },
};
