import type { DefaultTheme } from 'styled-components';
import { typography, spacing, radii, shadows, transitions } from '../design-system/tokens';

export const lightTheme: DefaultTheme = {
  mode: 'light',
  colors: {
    primary: '#1a73e8',        // Google Blue
    primaryHover: '#1557b0',   // Google Blue Darker
    secondary: '#ea4335',      // Google Red Accent
    background: '#f8f9fa',     // Google Soft Light Neutral
    surface: '#ffffff',        // Pure White Flat Container
    surfaceGlass: '#ffffff',   // Flat Surface (Zero blur)
    text: '#202124',           // Google Dark Text
    textSecondary: '#5f6368',  // Google Secondary Text
    border: '#dadce0',         // Google Standard Divider Border
    borderGlass: '#dadce0',    // Flat Border
    accent: '#137333',         // Google Green
    danger: '#d93025',         // Google Red
    warning: '#fbbc04',        // Google Yellow
    success: '#137333',        // Google Green
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
    primary: '#8ab4f8',        // Google Dark Blue
    primaryHover: '#aecbfa',
    secondary: '#f28b82',
    background: '#202124',     // Google Dark Mode Background
    surface: '#292a2d',        // Google Dark Mode Surface
    surfaceGlass: '#292a2d',
    text: '#e8eaed',
    textSecondary: '#9aa0a6',
    border: '#3c4043',
    borderGlass: '#3c4043',
    accent: '#81c995',
    danger: '#f28b82',
    warning: '#fde293',
    success: '#81c995',
  },
};
