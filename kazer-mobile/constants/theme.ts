/**
 * KAZER mobile — theme bridge.
 *
 * Maps `@kazer/core` tokens (OKLCH, authored for the web) onto concrete React
 * Native style values, per theme. NativeWind classNames read the same palette
 * through the CSS variables in `global.css`; this module is what feeds
 * StyleSheet.create, SVG gradients and animated styles.
 */

import {
  durations,
  easing,
  layout,
  metalStops,
  oklchToHex,
  radii,
  space,
  typography,
  type KazerColorToken,
  type ThemeName,
} from './tokens';

export type { ThemeName };

export interface ThemeColors {
  /** Page background behind modals. */
  void: string;
  /** App background. */
  base: string;
  /** Cards, drawers, sheets. */
  surface: string;
  /** Popovers, hovered rows. */
  elevated: string;
  /** Drag handles, high badges. */
  overlay: string;
  /** Inputs and code blocks. */
  inset: string;

  line: string;
  lineStrong: string;
  lineActive: string;
  lineGold: string;

  text: string;
  text2: string;
  text3: string;
  textInverse: string;

  /** Brand — primary CTA, logo, Mission Trace. */
  gold: string;
  goldSoft: string;
  goldDim: string;
  /** Gold that stays ≥ 4.5:1 on text. */
  goldText: string;
  goldWash: string;
  goldBorder: string;

  /** Reasoning / agent mode, active Skill. */
  violet: string;
  violetSoft: string;
  violetWash: string;
  violetBorder: string;

  /** Live action — streaming, running, progress. */
  cyan: string;
  cyanWash: string;
  cyanBorder: string;

  green: string;
  greenWash: string;
  red: string;
  redWash: string;
  redBorder: string;
  amber: string;
  amberWash: string;
}

export interface Theme {
  name: ThemeName;
  colors: ThemeColors;
  /** Raw OKLCH value for each token, kept for documentation/tooling. */
  oklch: Record<KazerColorToken, string>;
  radii: typeof radii;
  space: typeof space;
  /** Type scale in RN-ready values. */
  type: {
    display: TextToken;
    h1: TextToken;
    h2: TextToken;
    h3: TextToken;
    bodyLg: TextToken;
    body: TextToken;
    bodySm: TextToken;
    caption: TextToken;
    micro: TextToken;
    code: TextToken;
    codeSm: TextToken;
    eyebrow: TextToken;
  };
  motion: { durations: typeof durations; easing: typeof easing };
  /** StyleSheet-able shadows (tokens.md §6) — floating elements only. */
  shadows: {
    sm: object;
    md: object;
    lg: object;
    gold: object;
    overlay: object;
  };
  metal: readonly string[];
  layout: typeof layout;
}

export interface TextToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: string;
  letterSpacing: number;
}

function token(spec: {
  size: number;
  lineHeight: number;
  weight: string;
  tracking: string;
}): TextToken {
  return {
    fontSize: spec.size,
    lineHeight: spec.lineHeight,
    fontWeight: spec.weight,
    letterSpacing: Number.parseFloat(spec.tracking),
  };
}

function buildColors(name: ThemeName): ThemeColors {
  const pick = (tokenName: KazerColorToken): string => {
    const entry = oklchToHex.find((item) => item.token === tokenName);
    if (!entry) {
      throw new Error(`[kazer-theme] unknown token: ${tokenName}`);
    }
    return entry[name];
  };

  return {
    void: pick('void'),
    base: pick('base'),
    surface: pick('surface'),
    elevated: pick('elevated'),
    overlay: pick('overlay'),
    inset: pick('inset'),

    line: pick('line'),
    lineStrong: pick('line-strong'),
    lineActive: pick('line-active'),
    lineGold: pick('line-gold'),

    text: pick('text'),
    text2: pick('text-2'),
    text3: pick('text-3'),
    textInverse: pick('text-inverse'),

    gold: pick('gold'),
    goldSoft: pick('gold-soft'),
    goldDim: pick('gold-dim'),
    goldText: pick('gold-text'),
    goldWash: pick('gold-wash'),
    goldBorder: pick('gold-border'),

    violet: pick('violet'),
    violetSoft: pick('violet-soft'),
    violetWash: pick('violet-wash'),
    violetBorder: pick('violet-border'),

    cyan: pick('cyan'),
    cyanWash: pick('cyan-wash'),
    cyanBorder: pick('cyan-border'),

    green: pick('green'),
    greenWash: pick('green-wash'),
    red: pick('red'),
    redWash: pick('red-wash'),
    redBorder: pick('red-border'),
    amber: pick('amber'),
    amberWash: pick('amber-wash'),
  };
}

function buildShadows(name: ThemeName) {
  const ink = name === 'dark' ? '#000000' : '#1b1b25';
  const gold = buildColors(name).gold;

  return {
    sm: {
      shadowColor: ink,
      shadowOpacity: name === 'dark' ? 0.3 : 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    md: {
      shadowColor: ink,
      shadowOpacity: name === 'dark' ? 0.45 : 0.16,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    lg: {
      shadowColor: ink,
      shadowOpacity: name === 'dark' ? 0.6 : 0.22,
      shadowRadius: 48,
      shadowOffset: { width: 0, height: 16 },
      elevation: 12,
    },
    /** tokens.md §6 — shadow-gold, for the paywall and primary surfaces. */
    gold: {
      shadowColor: gold,
      shadowOpacity: name === 'dark' ? 0.22 : 0.28,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    /** Modal / sheet backdrop dim. */
    overlay: {
      shadowColor: ink,
      shadowOpacity: 0.5,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 24,
    },
  };
}

function buildTheme(name: ThemeName): Theme {
  return {
    name,
    colors: buildColors(name),
    oklch: Object.fromEntries(
      oklchToHex.map((item) => [item.token, item.oklch]),
    ) as Record<KazerColorToken, string>,
    radii,
    space,
    type: {
      display: token(typography.display),
      h1: token(typography.h1),
      h2: token(typography.h2),
      h3: token(typography.h3),
      bodyLg: token(typography.bodyLg),
      body: token(typography.body),
      bodySm: token(typography.bodySm),
      caption: token(typography.caption),
      micro: token(typography.micro),
      code: token(typography.code),
      codeSm: token(typography.codeSm),
      /** Eyebrow label — real section labels only. */
      eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0.08 },
    },
    motion: { durations, easing },
    shadows: buildShadows(name),
    metal: [metalStops[0], metalStops[32], metalStops[58], metalStops[100]],
    layout,
  };
}

/** Dark is the KAZER default. */
export const darkTheme = buildTheme('dark');
export const lightTheme = buildTheme('light');

export const themes: Record<ThemeName, Theme> = {
  dark: darkTheme,
  light: lightTheme,
};

export function getTheme(name: ThemeName): Theme {
  return name === 'light' ? lightTheme : darkTheme;
}

/**
 * Text styles built from the type scale, so screens never hand-roll
 * fontSize/lineHeight pairs.
 */
export function textStyles(theme: Theme) {
  return {
    display: { ...theme.type.display },
    h1: { ...theme.type.h1 },
    h2: { ...theme.type.h2 },
    h3: { ...theme.type.h3 },
    bodyLg: { ...theme.type.bodyLg },
    body: { ...theme.type.body },
    bodySm: { ...theme.type.bodySm },
    caption: { ...theme.type.caption },
    micro: { ...theme.type.micro },
    code: { ...theme.type.code, fontFamily: 'monospace' },
    codeSm: { ...theme.type.codeSm, fontFamily: 'monospace' },
    eyebrow: {
      ...theme.type.eyebrow,
      color: theme.colors.text3,
      textTransform: 'uppercase' as const,
    },
  };
}

export type TextStyleTokens = ReturnType<typeof textStyles>;