/**
 * Theme provider.
 *
 * Owns the theme mode (dark by default, light supported, system-aware) and
 * keeps two things in sync:
 *  1. the JS theme object from `constants/theme.ts` (StyleSheet, SVG, Reanimated);
 *  2. NativeWind's color scheme, so `bg-kazer-base` / `text-kazer-text-2`
 *     resolve to the right CSS variable in `global.css`.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useColorScheme } from 'nativewind';

import { getTheme, type Theme, type ThemeName } from '../../constants/theme';

export type ThemePreference = ThemeName | 'system';

export interface ThemeContextValue {
  /** Resolved theme (never 'system'). */
  theme: Theme;
  /** What the user picked. */
  preference: ThemePreference;
  /** Resolved name — what is actually painted. */
  name: ThemeName;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  /** Persistence is out of scope for the demo; defaults to dark. */
  defaultPreference?: ThemePreference;
}

export function ThemeProvider({
  children,
  defaultPreference = 'dark',
}: ThemeProviderProps): React.JSX.Element {
  const systemScheme = useSystemColorScheme();
  const { setColorScheme } = useColorScheme();

  const [preference, setPreference] = useState<ThemePreference>(defaultPreference);

  const name: ThemeName =
    preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;

  // Push the resolved scheme into NativeWind so CSS variables flip with it.
  useEffect(() => {
    setColorScheme(name);
  }, [name, setColorScheme]);

  const toggle = useCallback(() => {
    setPreference((current) => {
      const resolved: ThemeName =
        current === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : current;
      return resolved === 'dark' ? 'light' : 'dark';
    });
  }, [systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: getTheme(name),
      preference,
      name,
      setPreference,
      toggle,
    }),
    [name, preference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('[kazer] useThemeContext must be used inside <ThemeProvider>.');
  }
  return context;
}

export type { Theme, ThemeName };