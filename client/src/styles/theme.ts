import type { DefaultTheme } from 'styled-components';
import { colors, typography, spacing, radii, shadows, transitions } from '../design-system/tokens';

export const lightTheme: DefaultTheme = {
  mode: 'light',
  colors: {
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    secondary: colors.secondary[500],
    /* App-Wide Synchronized Vibrant Anti-Glare Theme */
    background: '#e2e8f0',
    surface: '#ffffff',
    surfaceGlass: 'rgba(255, 255, 255, 0.92)',
    text: '#0f172a',
    textSecondary: '#475569',
    border: '#cbd5e1',
    borderGlass: '#cbd5e1',
    accent: colors.success,
    danger: colors.danger,
    warning: colors.warning,
    success: colors.success,
  },
  typography,
  spacing,
  radii,
  shadows,
  transitions,
};

export const darkTheme: DefaultTheme = {
  ...lightTheme,
  mode: 'dark',
  colors: {
    ...lightTheme.colors,
    primary: colors.primary[500],
    primaryHover: colors.primary[400],
    background: colors.neutral[950],
    surface: colors.neutral[900],
    surfaceGlass: 'rgba(15, 23, 42, 0.92)',
    text: colors.neutral[50],
    textSecondary: colors.neutral[400],
    border: colors.neutral[800],
    borderGlass: colors.neutral[800],
  },
};
