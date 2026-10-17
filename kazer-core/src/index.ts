/**
 * KAZER Core — shared package.
 * Used by kazer-web and kazer-mobile: design tokens, domain types, mock data
 * and adapter interfaces. Swap the mock adapters for real implementations
 * (Supabase, Vercel AI SDK, Stripe, RevenueCat) without touching the UI.
 */

export * from './tokens';
export * from './types';
export * from './adapters/types';
export * from './adapters/mock';
export * from './mocks/data';
export * from './utils';
