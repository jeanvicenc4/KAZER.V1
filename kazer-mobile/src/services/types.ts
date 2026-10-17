/**
 * Service layer.
 *
 * Screens and hooks never import `@kazer/core` adapters directly — they go
 * through `kazer` (see `src/services/index.ts`). Swapping the demo for a real
 * backend means implementing `KazerBackend` once and calling `setBackend()`;
 * no component changes.
 */

import type {
  ArtifactAdapter,
  AuthAdapter,
  BillingAdapter,
  ChatAdapter,
  ResearchAdapter,
  SkillsAdapter,
} from '@kazer/core';

export interface KazerBackend {
  chat: ChatAdapter;
  research: ResearchAdapter;
  artifacts: ArtifactAdapter;
  skills: SkillsAdapter;
  billing: BillingAdapter;
  auth: AuthAdapter;
}

/** Native entry points that need a real implementation before shipping. */
export const backendGaps = {
  /** Push notifications for background mission completion (MAX). */
  pushNotifications: 'stub',
  /** Real checkout: RevenueCat on device, Stripe on web. */
  billingCheckout: 'stub',
  /** File downloads need expo-file-system + expo-sharing. */
  artifactDownload: 'stub',
  /** OAuth / magic link — the demo accepts any email and password. */
  authentication: 'stub',
} as const;

export type BackendGap = keyof typeof backendGaps;