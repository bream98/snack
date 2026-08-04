import 'styled-components';
import { colors, typography, spacing, radii, shadows, transitions } from '../design-system/tokens';

declare module 'styled-components' {
  export interface DefaultTheme {
    mode: 'light' | 'dark';
    colors: {
      primary: string;
      primaryHover: string;
      secondary: string;
      background: string;
      surface: string;
      surfaceGlass: string;
      text: string;
      textSecondary: string;
      border: string;
      borderGlass: string;
      accent: string;
      danger: string;
      warning: string;
      success: string;
    };
    typography: typeof typography;
    spacing: typeof spacing;
    radii: typeof radii;
    shadows: typeof shadows;
    transitions: typeof transitions;
  }
}
