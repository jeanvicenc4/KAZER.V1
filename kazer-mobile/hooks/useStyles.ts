/**
 * Theme-aware style helper.
 *
 * Returns a memoized style object built from the active theme, so tokens are
 * the only source of color/size values. NativeWind classNames handle layout;
 * this is for the parts that need real values (SVG, Reanimated, conditional
 * colors).
 */

import { useMemo } from 'react';

import { useThemeContext } from '../src/theme/ThemeProvider';
import type { Theme } from '../constants/theme';

export type StyleFactory<T> = (theme: Theme) => T;

export function useStyles<T>(factory: StyleFactory<T>): T {
  const { theme } = useThemeContext();
  return useMemo(() => factory(theme), [factory, theme]);
}