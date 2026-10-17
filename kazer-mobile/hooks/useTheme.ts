/**
 * Theme hook — thin wrapper so components never reach into `src/theme`
 * directly, and so the theme object is the only styling entry point.
 */

import { useThemeContext } from '../src/theme/ThemeProvider';
import type { Theme, ThemeName } from '../constants/theme';

export function useTheme() {
  const context = useThemeContext();

  return {
    ...context,
    colors: context.theme.colors,
  };
}

export type { Theme, ThemeName };