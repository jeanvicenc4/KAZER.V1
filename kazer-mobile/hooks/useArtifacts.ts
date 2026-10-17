/**
 * useArtifacts — the artifact library behind the 2-column grid.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Artifact, ArtifactType, ArtifactVersion } from '@kazer/core';

import { kazer } from '../src/services';

export interface UseArtifactsResult {
  artifacts: Artifact[];
  filtered: Artifact[];
  type: ArtifactType | 'all';
  setType: (type: ArtifactType | 'all') => void;
  types: ArtifactType[];
  counts: Record<string, number>;
  loading: boolean;
  byId: (id: string) => Artifact | undefined;
  versions: (id: string) => Promise<ArtifactVersion[]>;
  refresh: () => Promise<void>;
}

export function useArtifacts(conversationId?: string | null): UseArtifactsResult {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [type, setType] = useState<ArtifactType | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await kazer.artifacts.list(conversationId ?? null);
    setArtifacts([...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const types = useMemo(() => {
    const unique = new Set<ArtifactType>(artifacts.map((artifact) => artifact.type));
    return [...unique];
  }, [artifacts]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: artifacts.length };
    for (const artifact of artifacts) {
      result[artifact.type] = (result[artifact.type] ?? 0) + 1;
    }
    return result;
  }, [artifacts]);

  const filtered = useMemo(
    () => (type === 'all' ? artifacts : artifacts.filter((item) => item.type === type)),
    [artifacts, type],
  );

  const byId = useCallback(
    (id: string) => artifacts.find((artifact) => artifact.id === id),
    [artifacts],
  );

  const versions = useCallback(
    (id: string) => kazer.artifacts.versions(id),
    [],
  );

  return {
    artifacts,
    filtered,
    type,
    setType,
    types,
    counts,
    loading,
    byId,
    versions,
    refresh,
  };
}