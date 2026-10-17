'use client';

import * as React from 'react';

/**
 * ThemeProvider — dark by default, light available, persisted.
 * Also respects `prefers-color-scheme` when the user picks "system".
 */

export type ThemePreference = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: 'dark' | 'light';
  setPreference: (value: ThemePreference) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'kazer-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = React.useState<ThemePreference>('dark');
  const [systemTheme, setSystemTheme] = React.useState<'dark' | 'light'>('dark');

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      setPreferenceState(stored);
    }

    const media = window.matchMedia('(prefers-color-scheme: light)');
    setSystemTheme(media.matches ? 'light' : 'dark');

    const onChange = (e: MediaQueryListEvent) =>
      setSystemTheme(e.matches ? 'light' : 'dark');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const resolved: 'dark' | 'light' =
    preference === 'system' ? systemTheme : preference;

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  }, [resolved]);

  const setPreference = React.useCallback((value: ThemePreference) => {
    setPreferenceState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const value = React.useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme precisa estar dentro de <ThemeProvider>.');
  }
  return context;
}
