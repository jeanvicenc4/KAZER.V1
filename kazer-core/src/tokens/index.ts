/**
 * KAZER — Shared design tokens.
 * Single source of truth mirrored from skills/kazer-design-system/references/tokens.md.
 * Web reads the CSS variables; mobile reads this object.
 */

export type ThemeName = 'dark' | 'light';

export const brand = {
  name: 'KAZER',
  tagline: 'Pergunte. O KAZER executa.',
  positioning: 'Inteligência artificial de pesquisa, execução e criação.',
} as const;

/** OKLCH surfaces — very dark blue-violet. */
export const surfaces = {
  void: 'oklch(0.115 0.010 285)',
  base: 'oklch(0.145 0.012 285)',
  surface: 'oklch(0.185 0.014 283)',
  elevated: 'oklch(0.225 0.016 280)',
  overlay: 'oklch(0.265 0.018 278)',
  inset: 'oklch(0.165 0.013 284)',
} as const;

export const lines = {
  line: 'oklch(1 0 0 / 8%)',
  lineStrong: 'oklch(1 0 0 / 14%)',
  lineActive: 'oklch(1 0 0 / 22%)',
  lineGold: 'oklch(0.82 0.135 82 / 38%)',
} as const;

export const text = {
  primary: 'oklch(0.96 0.008 85)',
  secondary: 'oklch(0.72 0.012 280)',
  tertiary: 'oklch(0.55 0.014 285)',
  inverse: 'oklch(0.14 0.012 285)',
} as const;

export const accents = {
  gold: 'oklch(0.82 0.135 82)',
  goldSoft: 'oklch(0.72 0.110 80)',
  goldDim: 'oklch(0.55 0.075 75)',
  goldWash: 'oklch(0.82 0.135 82 / 12%)',
  goldText: 'oklch(0.86 0.140 88)',
  violet: 'oklch(0.62 0.190 295)',
  violetSoft: 'oklch(0.70 0.150 292)',
  violetWash: 'oklch(0.62 0.190 295 / 14%)',
  cyan: 'oklch(0.78 0.130 205)',
  cyanWash: 'oklch(0.78 0.130 205 / 13%)',
  green: 'oklch(0.75 0.140 155)',
  greenWash: 'oklch(0.75 0.140 155 / 13%)',
  red: 'oklch(0.65 0.190 25)',
  redWash: 'oklch(0.65 0.190 25 / 14%)',
  amber: 'oklch(0.80 0.150 75)',
} as const;

/** Metallic gradient — restricted to logo, primary ring and paywall crown. */
export const metal =
  'linear-gradient(145deg, oklch(0.88 0.140 88) 0%, oklch(0.78 0.135 82) 32%, oklch(0.62 0.105 72) 58%, oklch(0.86 0.130 90) 100%)';

export const lightPalette = {
  void: 'oklch(0.960 0.004 85)',
  base: 'oklch(0.985 0.003 85)',
  surface: 'oklch(1 0 0)',
  elevated: 'oklch(0.975 0.004 85)',
  overlay: 'oklch(0.94 0.005 85)',
  inset: 'oklch(0.955 0.004 85)',
  text: 'oklch(0.22 0.020 285)',
  text2: 'oklch(0.42 0.018 283)',
  text3: 'oklch(0.55 0.015 285)',
  gold: 'oklch(0.58 0.115 70)',
  goldSoft: 'oklch(0.50 0.095 68)',
  violet: 'oklch(0.48 0.185 295)',
  cyan: 'oklch(0.52 0.115 205)',
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

export const typography = {
  display: { size: 64, lineHeight: 68, weight: '500', tracking: '-0.03em' },
  h1: { size: 40, lineHeight: 46, weight: '500', tracking: '-0.02em' },
  h2: { size: 28, lineHeight: 34, weight: '500', tracking: '-0.015em' },
  h3: { size: 20, lineHeight: 26, weight: '550', tracking: '-0.01em' },
  bodyLg: { size: 17, lineHeight: 26, weight: '400', tracking: '-0.005em' },
  body: { size: 15, lineHeight: 24, weight: '400', tracking: '0' },
  bodySm: { size: 14, lineHeight: 20, weight: '400', tracking: '0' },
  caption: { size: 13, lineHeight: 18, weight: '450', tracking: '0.01em' },
  micro: { size: 12, lineHeight: 16, weight: '500', tracking: '0.02em' },
  code: { size: 13, lineHeight: 20, weight: '400', tracking: '0' },
  codeSm: { size: 12, lineHeight: 18, weight: '400', tracking: '0' },
} as const;

export const motion = {
  fast: 120,
  base: 200,
  slow: 320,
  slower: 480,
  cascadeStep: 40,
  cascadeMax: 6,
} as const;

export const layout = {
  sidebarWidth: 264,
  sourcesPanelWidth: 340,
  readingColumn: 720,
  shellMaxWidth: 1440,
  composerTop: 96,
  sheetMax: '72vh',
  touchTarget: 44,
} as const;

export const fonts = {
  sans: 'Geist, "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
  mono: '"Geist Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
} as const;
