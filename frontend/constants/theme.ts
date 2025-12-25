export const COLORS = {
  background: '#000000',
  surface: '#1a1a1a',
  surfaceLight: '#2a2a2a',
  accent: '#6C63FF',
  accentDark: '#5449CC',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#606060',
  success: '#4CAF50',
  warning: '#FF9800',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 48,
    fontWeight: '700' as const,
    letterSpacing: -1,
  },
  h2: {
    fontSize: 36,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
};