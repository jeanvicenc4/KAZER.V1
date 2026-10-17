/**
 * Plan store — the one piece of app state shared across screens.
 *
 * The paywall (chat), the Skills limit (skills) and Settings all need the same
 * plan answer, so it lives outside the React tree. Uses `useSyncExternalStore`
 * to stay concurrent-safe.
 */

import { useCallback, useSyncExternalStore } from 'react';
import type { Plan, PlanDefinition, Subscription } from '@kazer/core';

import { kazer } from '../services';
import type { FeatureKey } from '@kazer/core';

export interface PlanState {
  plan: Plan;
  definition: PlanDefinition | null;
  subscription: Subscription | null;
  ready: boolean;
}

let state: PlanState = {
  plan: 'pro',
  definition: null,
  subscription: null,
  ready: false,
};

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): PlanState {
  return state;
}

function setState(next: Partial<PlanState>): void {
  state = { ...state, ...next };
  emit();
}

/** Load plan + subscription once per app start. */
export async function refreshPlan(): Promise<void> {
  const [plan, subscription, plans] = await Promise.all([
    kazer.billing.getPlan(),
    kazer.billing.getSubscription(),
    kazer.billing.getPlans(),
  ]);

  const definition = plans.find((item) => item.id === plan) ?? null;
  setState({ plan, subscription, definition, ready: true });
}

/** Switch the demo plan (Settings › Demonstração). */
export async function setDemoPlan(plan: Plan): Promise<void> {
  const applied = await kazer.billing.setDemoPlan(plan);
  await refreshPlan();
  setState({ plan: applied });
}

/** Real checkout goes here. The demo activates the plan immediately. */
export async function subscribeToPlan(plan: Plan): Promise<void> {
  await kazer.billing.subscribe(plan, 'revenuecat');
  await refreshPlan();
}

export async function canUseFeature(feature: FeatureKey): Promise<boolean> {
  return kazer.billing.canUse(feature);
}

export function usePlanState(): PlanState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Plan gate. `longTasks` is what the paywall guards — mission execution and
 * artifact creation are MAX features.
 */
export function usePlan() {
  const snapshot = usePlanState();
  const { plan, definition } = snapshot;

  const canUse = useCallback(
    (feature: FeatureKey) => {
      void canUseFeature(feature);
      const order: Plan[] = ['free', 'pro', 'max'];
      const required: Partial<Record<FeatureKey, Plan>> = {
        longTasks: 'max',
        artifacts: 'max',
        agentMode: 'max',
        backgroundExecution: 'max',
        unlimitedSkills: 'max',
        advancedResearch: 'pro',
        premiumModels: 'pro',
        export: 'pro',
      };
      const minimum = required[feature];
      if (!minimum) return true;
      return order.indexOf(plan) >= order.indexOf(minimum);
    },
    [plan],
  );

  /** Mission mode is the paywall trigger on a non-MAX plan. */
  const canRunMission = canUse('longTasks');
  const canCreateArtifacts = canUse('artifacts');

  return {
    ...snapshot,
    plan,
    limits: definition?.limits ?? null,
    isMax: plan === 'max',
    canUse,
    canRunMission,
    canCreateArtifacts,
  };
}