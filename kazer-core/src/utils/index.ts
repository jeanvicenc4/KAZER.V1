/**
 * KAZER — shared utilities.
 */

import type { Conversation } from '../types';

export type HistoryGroup = 'Hoje' | 'Ontem' | 'Últimos 7 dias' | 'Anteriores';

export function groupConversations(
  conversations: Conversation[],
  now: Date = new Date(),
): { group: HistoryGroup; items: Conversation[] }[] {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const day = 86_400_000;

  const groups: { group: HistoryGroup; items: Conversation[] }[] = [
    { group: 'Hoje', items: [] },
    { group: 'Ontem', items: [] },
    { group: 'Últimos 7 dias', items: [] },
    { group: 'Anteriores', items: [] },
  ];

  for (const conversation of conversations) {
    const updated = new Date(conversation.updatedAt).getTime();
    const diff = startOfToday - updated;

    if (diff < day) groups[0].items.push(conversation);
    else if (diff < day * 2) groups[1].items.push(conversation);
    else if (diff < day * 7) groups[2].items.push(conversation);
    else groups[3].items.push(conversation);
  }

  return groups.filter((g) => g.items.length > 0);
}

export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

export function formatPriceBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export function cx(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(' ');
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function domainInitials(domain: string): string {
  return domain.replace(/^www\./, '').charAt(0).toUpperCase();
}
