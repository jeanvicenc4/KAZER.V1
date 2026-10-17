/**
 * KAZER mobile — design tokens.
 *
 * The canonical values live in `@kazer/core` (mirrored from
 * skills/kazer-design-system/references/tokens.md) and are re-exported here so
 * components never import from two places.
 *
 * React Native cannot parse `oklch()`, so `hexPalettes` below carries the exact
 * sRGB conversion of every OKLCH token, per theme. The same hex values are
 * mirrored in `global.css` as CSS variables for NativeWind classNames; the JS
 * copy is what feeds SVG gradients, shadows and animated styles.
 */

import {
  accents,
  brand,
  fonts,
  layout,
  lightPalette,
  lines,
  metal,
  motion,
  radii,
  space,
  surfaces,
  text,
  typography,
  type ThemeName,
} from '@kazer/core';

export type { ThemeName };

export {
  brand,
  fonts,
  layout,
  metal,
  motion,
  radii,
  space,
  typography,
};

/** Raw OKLCH surfaces — reference only, not renderable on RN. */
export {
  surfaces as oklchSurfaces,
  lines as oklchLines,
  text as oklchText,
  accents as oklchAccents,
  lightPalette as oklchLightPalette,
};

/**
 * `oklch(L C H)` → hex, one entry per token. Keep in sync with global.css.
 */
export interface OklchMapping {
  readonly token: string;
  readonly oklch: string;
  readonly dark: string;
  readonly light: string;
}

export const oklchToHex: readonly OklchMapping[] = [
  // Surfaces
  { token: 'void', oklch: 'oklch(0.115 0.010 285)', dark: '#050508', light: '#f3f2ef' },
  { token: 'base', oklch: 'oklch(0.145 0.012 285)', dark: '#09090f', light: '#fbfaf8' },
  { token: 'surface', oklch: 'oklch(0.185 0.014 283)', dark: '#121219', light: '#ffffff' },
  { token: 'elevated', oklch: 'oklch(0.225 0.016 280)', dark: '#1a1b23', light: '#f8f7f4' },
  { token: 'overlay', oklch: 'oklch(0.265 0.018 278)', dark: '#23242e', light: '#edebe7' },
  { token: 'inset', oklch: 'oklch(0.165 0.013 284)', dark: '#0e0e14', light: '#f1f0ed' },

  // Borders (alpha composited over the matching surface)
  { token: 'line', oklch: 'oklch(1 0 0 / 8%)', dark: 'rgba(255,255,255,0.08)', light: 'rgba(21,21,29,0.1)' },
  { token: 'line-strong', oklch: 'oklch(1 0 0 / 14%)', dark: 'rgba(255,255,255,0.14)', light: 'rgba(21,21,29,0.18)' },
  { token: 'line-active', oklch: 'oklch(1 0 0 / 22%)', dark: 'rgba(255,255,255,0.22)', light: 'rgba(21,21,29,0.3)' },
  { token: 'line-gold', oklch: 'oklch(0.82 0.135 82 / 38%)', dark: 'rgba(240,187,82,0.38)', light: 'rgba(165,109,28,0.38)' },

  // Text
  { token: 'text', oklch: 'oklch(0.96 0.008 85)', dark: '#f4f1ec', light: '#191924' },
  { token: 'text-2', oklch: 'oklch(0.72 0.012 280)', dark: '#a3a4ac', light: '#4b4c57' },
  { token: 'text-3', oklch: 'oklch(0.55 0.014 285)', dark: '#70717a', light: '#70707a' },
  { token: 'text-inverse', oklch: 'oklch(0.14 0.012 285)', dark: '#09080e', light: '#ffffff' },

  // Accents — gold is the brand, violet is reasoning, cyan is live action.
  { token: 'gold', oklch: 'oklch(0.82 0.135 82)', dark: '#f0bb52', light: '#a56d1c' },
  { token: 'gold-soft', oklch: 'oklch(0.72 0.110 80)', dark: '#c99d4e', light: '#86581d' },
  { token: 'gold-dim', oklch: 'oklch(0.55 0.075 75)', dark: '#8b6b3d', light: '#764600' },
  { token: 'gold-text', oklch: 'oklch(0.86 0.140 88)', dark: '#f7cb58', light: '#8c5500' },
  { token: 'gold-wash', oklch: 'oklch(0.82 0.135 82 / 12%)', dark: 'rgba(240,187,82,0.12)', light: 'rgba(165,109,28,0.1)' },
  { token: 'gold-border', oklch: 'oklch(0.82 0.135 82 / 30%)', dark: 'rgba(240,187,82,0.3)', light: 'rgba(165,109,28,0.3)' },
  { token: 'violet', oklch: 'oklch(0.62 0.190 295)', dark: '#9167ea', light: '#693cb8' },
  { token: 'violet-soft', oklch: 'oklch(0.70 0.150 292)', dark: '#a18bf3', light: '#7a5ccb' },
  { token: 'violet-wash', oklch: 'oklch(0.62 0.190 295 / 14%)', dark: 'rgba(145,103,234,0.14)', light: 'rgba(105,60,184,0.1)' },
  { token: 'violet-border', oklch: 'oklch(0.62 0.190 295 / 32%)', dark: 'rgba(145,103,234,0.32)', light: 'rgba(105,60,184,0.3)' },
  { token: 'cyan', oklch: 'oklch(0.78 0.130 205)', dark: '#1acfdf', light: '#007b88' },
  { token: 'cyan-wash', oklch: 'oklch(0.78 0.130 205 / 13%)', dark: 'rgba(26,207,223,0.13)', light: 'rgba(0,123,136,0.1)' },
  { token: 'cyan-border', oklch: 'oklch(0.78 0.130 205 / 30%)', dark: 'rgba(26,207,223,0.3)', light: 'rgba(0,123,136,0.3)' },
  { token: 'green', oklch: 'oklch(0.75 0.140 155)', dark: '#59c886', light: '#005928' },
  { token: 'green-wash', oklch: 'oklch(0.75 0.140 155 / 13%)', dark: 'rgba(89,200,134,0.13)', light: 'rgba(0,89,40,0.1)' },
  { token: 'red', oklch: 'oklch(0.65 0.190 25)', dark: '#ed5350', light: '#be222a' },
  { token: 'red-wash', oklch: 'oklch(0.65 0.190 25 / 14%)', dark: 'rgba(237,83,80,0.14)', light: 'rgba(190,34,42,0.1)' },
  { token: 'red-border', oklch: 'oklch(0.65 0.190 25 / 30%)', dark: 'rgba(237,83,80,0.3)', light: 'rgba(190,34,42,0.3)' },
  { token: 'amber', oklch: 'oklch(0.80 0.150 75)', dark: '#f5ae39', light: '#a75c00' },
  { token: 'amber-wash', oklch: 'oklch(0.80 0.150 75 / 13%)', dark: 'rgba(245,174,57,0.13)', light: 'rgba(167,92,0,0.1)' },
];

export type KazerColorToken = (typeof oklchToHex)[number]['token'];

/** Metallic gradient stops — restricted to the logo, ring and paywall crown. */
export const metalStops = {
  0: '#fed25f',
  32: '#e2ae43',
  58: '#ad7b37',
  100: '#f2cd64',
} as const;

/** tokens.md §8 */
export const zIndex = {
  base: 0,
  elevated: 10,
  sticky: 100,
  drawer: 200,
  sheet: 300,
  modal: 400,
  toast: 500,
  streamToast: 600,
} as const;

/** screens.md — bottom sheet with three detents (25% / 60% / 92%). */
export const sheetDetents = [0.25, 0.6, 0.92] as const;
export type SheetDetent = (typeof sheetDetents)[number];

/** tokens.md §10 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/** Minimum touch target on mobile (components.md §11 / screens.md mobile rules). */
export const touchTarget = layout.touchTarget;

/** Motion durations in ms, mirrored from tokens.md §7. */
export const durations = {
  fast: motion.fast,
  base: motion.base,
  slow: motion.slow,
  slower: motion.slower,
  cascadeStep: motion.cascadeStep,
} as const;

/** Easing curves. Reanimated wants cubic-bezier arrays. */
export const easing = {
  fast: [0.4, 0, 0.2, 1],
  base: [0.2, 0, 0, 1],
  out: [0.16, 1, 0.3, 1],
} as const;

/** Composer's textarea grows up to 140px on mobile (components.md §2). */
export const composerMaxHeight = 140;

/** Screen is never wider than the reading column. */
export const readingColumn = layout.readingColumn;