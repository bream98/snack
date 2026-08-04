import type { DefaultTheme } from 'styled-components';
import { colors, typography, spacing, radii, shadows, transitions } from '../design-system/tokens';

export const lightTheme: DefaultTheme = {
  mode: 'light',
  colors: {
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    secondary: colors.secondary[500],
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceGlass: '#ffffff',
    text: colors.neutral[900],
    textSecondary: colors.neutral[500],
    border: '#e2e8f0',
    borderGlass: '#e2e8f0',
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
    surfaceGlass: colors.neutral[900],
    text: colors.neutral[50],
    textSecondary: colors.neutral[400],
    border: colors.neutral[800],
    borderGlass: colors.neutral[800],
  },
};
