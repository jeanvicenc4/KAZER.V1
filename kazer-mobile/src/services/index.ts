/**
 * KAZER services — the single place the app talks to data.
 *
 * Today every adapter is the in-memory mock from `@kazer/core`, so the whole
 * app is navigable with no backend. To go live, implement `KazerBackend`
 * (Supabase + Vercel AI SDK + RevenueCat) and hand it to `setBackend()`.
 */

import {
  createMockArtifactAdapter,
  createMockAuthAdapter,
  createMockBillingAdapter,
  createMockChatAdapter,
  createMockResearchAdapter,
  createMockSkillsAdapter,
  demoProfile,
} from '@kazer/core';

import type { KazerBackend } from './types';

export * from './types';

function createDemoBackend(): KazerBackend {
  return {
    chat: createMockChatAdapter(),
    research: createMockResearchAdapter(),
    artifacts: createMockArtifactAdapter(),
    skills: createMockSkillsAdapter(),
    // The demo profile is a Pro user: mission mode correctly hits the paywall.
    billing: createMockBillingAdapter(demoProfile.plan),
    auth: createMockAuthAdapter(),
  };
}

let backend: KazerBackend = createDemoBackend();

/** Current backend. Prefer this over importing adapters directly. */
export function getBackend(): KazerBackend {
  return backend;
}

/** Replace the demo with a real backend at app start. */
export function setBackend(next: KazerBackend): void {
  backend = next;
}

/** Restore the demo backend (used by the Settings screen). */
export function resetBackend(): KazerBackend {
  backend = createDemoBackend();
  return backend;
}

export const kazer = {
  get chat() {
    return backend.chat;
  },
  get research() {
    return backend.research;
  },
  get artifacts() {
    return backend.artifacts;
  },
  get skills() {
    return backend.skills;
  },
  get billing() {
    return backend.billing;
  },
  get auth() {
    return backend.auth;
  },
};