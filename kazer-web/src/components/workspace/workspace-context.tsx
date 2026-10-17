'use client';

import * as React from 'react';
import {
  createMockChatAdapter,
  createMockResearchAdapter,
  demoConversations,
  demoSources,
  demoArtifacts,
  type Conversation,
  type Source,
  type Artifact,
  type Mode,
  type ModelId,
} from '@kazer/core';

/**
 * WorkspaceContext — the shared client state for the /kazer section.
 *
 * Holds conversations, sources and artifacts in memory. A real implementation
 * would hydrate this from Supabase and subscribe to Realtime changes, which
 * is exactly why every mutation goes through a single adapter call.
 */

interface WorkspaceContextValue {
  conversations: Conversation[];
  sources: Source[];
  artifacts: Artifact[];
  mode: Mode;
  model: ModelId;
  setMode: (mode: Mode) => void;
  setModel: (model: ModelId) => void;
  createConversation: (title?: string, mode?: Mode) => Promise<Conversation>;
  renameConversation: (id: string, title: string) => void;
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
  deleteConversation: (id: string) => void;
  toggleSaveSource: (source: Source) => void;
  chatAdapter: ReturnType<typeof createMockChatAdapter>;
  researchAdapter: ReturnType<typeof createMockResearchAdapter>;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [conversations, setConversations] = React.useState<Conversation[]>(
    () => demoConversations.filter((c) => !c.archived),
  );
  const [sources, setSources] = React.useState<Source[]>(demoSources);
  const [artifacts, setArtifacts] = React.useState<Artifact[]>(demoArtifacts);
  const [mode, setMode] = React.useState<Mode>('chat');
  const [model, setModel] = React.useState<ModelId>('kazer-4');

  const chatAdapter = React.useMemo(() => createMockChatAdapter(), []);
  const researchAdapter = React.useMemo(() => createMockResearchAdapter(), []);

  const createConversation = React.useCallback(
    async (title = 'Nova missão', conversationMode: Mode = 'chat') => {
      const created = await chatAdapter.createConversation(title, conversationMode);
      setConversations((prev) => [created, ...prev]);
      return created;
    },
    [chatAdapter],
  );

  const renameConversation = React.useCallback(
    (id: string, title: string) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c)),
      );
    },
    [],
  );

  const togglePin = React.useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    );
  }, []);

  const toggleArchive = React.useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)),
    );
  }, []);

  const deleteConversation = React.useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleSaveSource = React.useCallback((source: Source) => {
    setSources((prev) =>
      prev.map((s) => (s.id === source.id ? { ...s, saved: !s.saved } : s)),
    );
  }, []);

  const value = React.useMemo(
    () => ({
      conversations,
      sources,
      artifacts,
      mode,
      model,
      setMode,
      setModel,
      createConversation,
      renameConversation,
      togglePin,
      toggleArchive,
      deleteConversation,
      toggleSaveSource,
      chatAdapter,
      researchAdapter,
    }),
    [
      conversations,
      sources,
      artifacts,
      mode,
      model,
      createConversation,
      renameConversation,
      togglePin,
      toggleArchive,
      deleteConversation,
      toggleSaveSource,
      chatAdapter,
      researchAdapter,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = React.useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace precisa estar dentro de <WorkspaceProvider>.');
  }
  return context;
}
