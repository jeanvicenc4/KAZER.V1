'use client';

import * as React from 'react';
import {
  createMockBillingAdapter,
  createMockSkillsAdapter,
  createMockArtifactAdapter,
  createMockAuthAdapter,
  type BillingAdapter,
  type SkillsAdapter,
  type ArtifactAdapter,
  type AuthAdapter,
} from '@kazer/core';
import type { Plan, Profile, Skill, Artifact } from '@kazer/core';

/**
 * Shared demo-state hooks.
 * Each holds an adapter instance so a real implementation can be injected
 * later. State lives in a module-level store so several components on the
 * same page observe the same plan / skill toggles.
 */

/* -------------------------------------------------------------------------- */
/* Plan + billing                                                              */
/* -------------------------------------------------------------------------- */

type BillingListener = () => void;

const billingAdapter: BillingAdapter = createMockBillingAdapter('pro');
const billingListeners = new Set<BillingListener>();

export function usePlan() {
  const [plan, setPlan] = React.useState<Plan>('pro');
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    billingAdapter.getPlan().then((p) => {
      if (!alive) return;
      setPlan(p);
      setReady(true);
    });

    const listener: BillingListener = () => {
      billingAdapter.getPlan().then((p) => alive && setPlan(p));
    };
    billingListeners.add(listener);
    return () => {
      alive = false;
      billingListeners.delete(listener);
    };
  }, []);

  const setDemoPlan = React.useCallback(async (next: Plan) => {
    await billingAdapter.setDemoPlan(next);
    billingListeners.forEach((listener) => listener());
  }, []);

  const canUse = React.useCallback(
    (feature: Parameters<BillingAdapter['canUse']>[0]) =>
      billingAdapter.canUse(feature),
    [],
  );

  const subscribe = React.useCallback(async (next: Plan) => {
    await billingAdapter.subscribe(next, 'stripe');
    billingListeners.forEach((listener) => listener());
  }, []);

  return { plan, ready, setDemoPlan, canUse, subscribe, adapter: billingAdapter };
}

/* -------------------------------------------------------------------------- */
/* Skills                                                                      */
/* -------------------------------------------------------------------------- */

const skillsAdapter: SkillsAdapter = createMockSkillsAdapter();
const skillsListeners = new Set<BillingListener>();
let skillsCache: Skill[] = [];

export function useSkills() {
  const [skills, setSkills] = React.useState<Skill[]>(skillsCache);
  const [loading, setLoading] = React.useState(skillsCache.length === 0);

  React.useEffect(() => {
    let alive = true;
    skillsAdapter.list().then((list) => {
      if (!alive) return;
      skillsCache = list;
      setSkills(list);
      setLoading(false);
    });

    const listener: BillingListener = () => {
      skillsAdapter.list().then((list) => {
        skillsCache = list;
        setSkills([...list]);
      });
    };
    skillsListeners.add(listener);
    return () => {
      alive = false;
      skillsListeners.delete(listener);
    };
  }, []);

  const toggle = React.useCallback(async (id: string, active: boolean) => {
    await skillsAdapter.toggle(id, active);
    skillsListeners.forEach((listener) => listener());
  }, []);

  return { skills, loading, toggle, adapter: skillsAdapter };
}

/* -------------------------------------------------------------------------- */
/* Artifacts                                                                   */
/* -------------------------------------------------------------------------- */

const artifactAdapter: ArtifactAdapter = createMockArtifactAdapter();

export function useArtifacts(conversationId?: string | null) {
  const [artifacts, setArtifacts] = React.useState<Artifact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    artifactAdapter
      .list(conversationId ?? null)
      .then((list) => {
        if (!alive) return;
        setArtifacts(list);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setError(
          err instanceof Error ? err.message : 'Falha ao carregar artefatos.',
        );
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [conversationId]);

  const download = React.useCallback(async (artifact: Artifact) => {
    const { filename, blob } = await artifactAdapter.download(artifact.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return { artifacts, loading, error, download, adapter: artifactAdapter };
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                     */
/* -------------------------------------------------------------------------- */

const authAdapter: AuthAdapter = createMockAuthAdapter();

export function useProfile() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    authAdapter.getProfile().then((p) => {
      if (!alive) return;
      setProfile(p);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const update = React.useCallback(async (patch: Partial<Profile>) => {
    const next = await authAdapter.updateProfile(patch);
    setProfile(next);
    return next;
  }, []);

  return { profile, loading, update, adapter: authAdapter };
}
