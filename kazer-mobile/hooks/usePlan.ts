/**
 * usePlan — plan, limits and the paywall gate.
 * State lives in `src/store/planStore.ts` so every screen agrees on the plan.
 */

export { usePlan, usePlanState, refreshPlan, setDemoPlan, subscribeToPlan } from '../src/store/planStore';
export type { PlanState } from '../src/store/planStore';