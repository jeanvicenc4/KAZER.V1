/**
 * useSkills — the 5 KAZER Skills, with toggles and plan limits.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { Skill } from '@kazer/core';

import { kazer } from '../src/services';
import { usePlan } from '../src/store/planStore';

export interface UseSkillsResult {
  skills: Skill[];
  active: Skill[];
  activeCount: number;
  /** Plan cap on simultaneously active Skills. */
  limit: number;
  loading: boolean;
  /** True when the plan blocks activating one more Skill. */
  atLimit: boolean;
  toggle: (id: string, next: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSkills(): UseSkillsResult {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const { limits } = usePlan();

  const limit = limits?.activeSkills ?? 1;

  const refresh = useCallback(async () => {
    const list = await kazer.skills.list();
    setSkills([...list].sort((a, b) => a.name.localeCompare(b.name)));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    if (loading) void refresh();
  }, [loading, refresh]);

  const active = useMemo(() => skills.filter((skill) => skill.active), [skills]);
  const atLimit = active.length >= limit && limits !== null;

  const toggle = useCallback(
    async (id: string, next: boolean) => {
      const skill = skills.find((item) => item.id === id);
      if (next && skill?.active === false && atLimit) {
        // Plan gate: the Skills screen shows the paywall instead of toggling.
        return;
      }
      await kazer.skills.toggle(id, next);
      await refresh();
    },
    [atLimit, refresh, skills],
  );

  return {
    skills,
    active,
    activeCount: active.length,
    limit,
    loading,
    atLimit,
    toggle,
    refresh,
  };
}