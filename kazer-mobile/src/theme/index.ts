/**
 * Theme barrel.
 *
 * Re-exports the provider, the resolved theme accessor and the `useTheme`
 * hook so screens import from one place. The theme values themselves live in
 * `constants/theme.ts` (mapped from `@kazer/core`).
 */

export { ThemeProvider, useThemeContext } from './ThemeProvider';
export type { ThemePreference, ThemeContextValue } from './ThemeProvider';

export { getTheme } from '../../constants/theme';
export type { Theme, ThemeName, ThemeColors } from '../../constants/theme';

export { useTheme } from '../../hooks/useTheme';
