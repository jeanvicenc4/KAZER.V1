/**
 * useConversations — history list, grouped by date, plus mutations.
 *
 * The drawer (Hoje / Ontem / Últimos 7 dias / Anteriores) and the Home screen
 * both read from here, so a pin or a delete is reflected everywhere at once.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { groupConversations } from '@kazer/core';
import type { Conversation, HistoryGroup } from '@kazer/core';

import { kazer } from '../src/services';

export interface ConversationGroup {
  group: HistoryGroup;
  items: Conversation[];
}

export interface UseConversationsResult {
  conversations: Conversation[];
  /** Active conversations, pinned first (drawer). */
  visible: Conversation[];
  groups: ConversationGroup[];
  recent: Conversation[];
  query: string;
  setQuery: (query: string) => void;
  loading: boolean;
  refresh: () => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation>;
}

export function useConversations(limit?: number): UseConversationsResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = query.trim()
      ? await kazer.chat.searchConversations(query)
      : await kazer.chat.listConversations();
    setConversations(list);
    setLoading(false);
  }, [query]);

  // Reload when the screen regains focus, so new chats appear in the drawer.
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  // Keep the first mount fast for callers that render outside a navigator.
  useEffect(() => {
    if (loading) void refresh();
  }, [loading, refresh]);

  const visible = useMemo(
    () => conversations.filter((conversation) => !conversation.archived),
    [conversations],
  );

  const groups = useMemo<ConversationGroup[]>(
    () => groupConversations(visible),
    [visible],
  );

  const recent = useMemo(() => {
    const sorted = [...visible].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
    return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
  }, [visible, limit]);

  const togglePin = useCallback(async (id: string) => {
    await kazer.chat.togglePin(id);
    await refresh();
  }, [refresh]);

  const toggleArchive = useCallback(async (id: string) => {
    await kazer.chat.toggleArchive(id);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await kazer.chat.deleteConversation(id);
    await refresh();
  }, [refresh]);

  const createConversation = useCallback(
    async (title?: string) => kazer.chat.createConversation(title),
    [],
  );

  return {
    conversations,
    visible,
    groups,
    recent,
    query,
    setQuery,
    loading,
    refresh,
    togglePin,
    toggleArchive,
    remove,
    createConversation,
  };
}