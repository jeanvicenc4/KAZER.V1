/**
 * useProfile — the signed-in demo user (auth adapter).
 */

import { useCallback, useEffect, useState } from 'react';
import type { ModelId, Profile, ThemeName } from '@kazer/core';

import { kazer } from '../src/services';

export interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  setDefaultModel: (model: ModelId) => Promise<void>;
  setTheme: (theme: ThemeName) => Promise<void>;
  setName: (fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const loaded = await kazer.auth.getProfile();
    setProfile(loaded);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const update = useCallback(
    async (patch: Partial<Profile>) => {
      const updated = await kazer.auth.updateProfile(patch);
      setProfile(updated);
      return updated;
    },
    [],
  );

  return {
    profile,
    loading,
    setDefaultModel: async (model) => {
      await update({ defaultModel: model });
    },
    setTheme: async (theme) => {
      await update({ theme });
    },
    setName: async (fullName) => {
      await update({ fullName });
    },
    signOut: async () => {
      await kazer.auth.signOut();
    },
  };
}