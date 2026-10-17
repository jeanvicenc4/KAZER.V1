'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Archive,
  CreditCard,
  FileText,
  MoreHorizontal,
  Pencil,
  Pin,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { cn, groupConversations } from '@/lib/utils';
import { KazerLockup } from '@/components/brand/kazer-mark';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@kazer/core';

/**
 * WorkspaceSidebar — history, grouped and searchable.
 * Grouping: Hoje · Ontem · Últimos 7 dias · Anteriores
 */

export interface SidebarProps {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  onNewMission: () => void;
  onRename?: (conversation: Conversation) => void;
  onPin?: (conversation: Conversation) => void;
  onArchive?: (conversation: Conversation) => void;
  onDelete?: (conversation: Conversation) => void;
  onSearch?: (query: string) => void;
  searchValue?: string;
  className?: string;
}

export function WorkspaceSidebar({
  conversations,
  onSelect,
  onNewMission,
  onRename,
  onPin,
  onArchive,
  onDelete,
  onSearch,
  searchValue = '',
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const [query, setQuery] = React.useState(searchValue);
  const [menuFor, setMenuFor] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q),
    );
  }, [conversations, query]);

  const groups = React.useMemo(
    () => groupConversations(filtered),
    [filtered],
  );

  const pinned = filtered.filter((c) => c.pinned);
  const rest = filtered.filter((c) => !c.pinned);

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-[var(--kazer-line)] bg-[var(--kazer-surface)]',
        className,
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/kazer"
          className="rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
          aria-label="KAZER — ir para o início"
        >
          <KazerLockup size={22} />
        </Link>
      </div>

      {/* New mission */}
      <div className="px-3 pb-2">
        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={onNewMission}
        >
          <Plus size={14} strokeWidth={2.5} />
          Nova missão
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--kazer-text-3)]"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="Buscar no histórico"
            aria-label="Buscar no histórico"
            className={cn(
              'h-8 w-full rounded-md border border-[var(--kazer-line)] bg-[var(--kazer-inset)] pl-8 pr-8 text-[13px] text-[var(--kazer-text)]',
              'placeholder:text-[var(--kazer-text-3)]',
              'focus:border-[var(--kazer-line-gold)] focus:outline-none',
            )}
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-[4px] border border-[var(--kazer-line)] px-1 font-mono text-[10px] text-[var(--kazer-text-3)]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* History */}
      <nav
        aria-label="Histórico de conversas"
        className="kazer-scroll flex-1 overflow-y-auto px-2 pb-4"
      >
        {pinned.length ? (
          <SidebarGroup label="Fixadas" count={pinned.length}>
            {pinned.map((conversation) => (
              <SidebarItem
                key={conversation.id}
                conversation={conversation}
                active={pathname === `/kazer/chat/${conversation.id}`}
                menuOpen={menuFor === conversation.id}
                onSelect={() => onSelect(conversation)}
                onMenuToggle={() =>
                  setMenuFor((v) => (v === conversation.id ? null : conversation.id))
                }
                onRename={onRename}
                onPin={onPin}
                onArchive={onArchive}
                onDelete={onDelete}
              />
            ))}
          </SidebarGroup>
        ) : null}

        {groups.map((group) => (
          <SidebarGroup key={group.group} label={group.group} count={group.items.length}>
            {group.items
              .filter((c) => !c.pinned)
              .map((conversation) => (
                <SidebarItem
                  key={conversation.id}
                  conversation={conversation}
                  active={pathname === `/kazer/chat/${conversation.id}`}
                  menuOpen={menuFor === conversation.id}
                  onSelect={() => onSelect(conversation)}
                  onMenuToggle={() =>
                    setMenuFor((v) => (v === conversation.id ? null : conversation.id))
                  }
                  onRename={onRename}
                  onPin={onPin}
                  onArchive={onArchive}
                  onDelete={onDelete}
                />
              ))}
          </SidebarGroup>
        ))}

        {!filtered.length ? (
          <div className="px-3 py-8 text-center">
            <p className="text-[13px] text-[var(--kazer-text-3)]">
              {query ? 'Nada encontrado para essa busca.' : 'Nenhuma conversa ainda.'}
            </p>
          </div>
        ) : null}
      </nav>

      {/* Footer nav */}
      <div className="border-t border-[var(--kazer-line)] p-2">
        <FooterLink href="/kazer/agents" icon={Sparkles} label="Skills" />
        <FooterLink href="/kazer/artifacts" icon={FileText} label="Artefatos" />
        <FooterLink href="/kazer/pricing" icon={CreditCard} label="Planos" />
      </div>
    </div>
  );
}

function SidebarGroup({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 px-2.5 pb-1.5 pt-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--kazer-text-3)]">
          {label}
        </span>
        <span className="font-mono text-[10px] text-[var(--kazer-text-3)] opacity-60">
          {count}
        </span>
      </div>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function SidebarItem({
  conversation,
  active,
  menuOpen,
  onSelect,
  onMenuToggle,
  onRename,
  onPin,
  onArchive,
  onDelete,
}: {
  conversation: Conversation;
  active: boolean;
  menuOpen: boolean;
  onSelect: () => void;
  onMenuToggle: () => void;
  onRename?: (c: Conversation) => void;
  onPin?: (c: Conversation) => void;
  onArchive?: (c: Conversation) => void;
  onDelete?: (c: Conversation) => void;
}) {
  return (
    <li className="relative">
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group flex w-full items-center gap-2 rounded-md py-2 pl-2.5 pr-8 text-left transition-colors duration-150',
          'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--kazer-gold)]',
          active
            ? 'bg-[var(--kazer-gold-wash)] text-[var(--kazer-text)]'
            : 'text-[var(--kazer-text-2)] hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text)]',
        )}
      >
        {conversation.pinned ? (
          <Pin size={11} className="shrink-0 text-[var(--kazer-gold)]" aria-label="Fixada" />
        ) : null}
        <span className="min-w-0 flex-1 truncate text-[13px] leading-[18px]">
          {conversation.title}
        </span>
      </button>

      <button
        type="button"
        onClick={onMenuToggle}
        aria-label={`Ações para ${conversation.title}`}
        aria-expanded={menuOpen}
        className={cn(
          'absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[6px] text-[var(--kazer-text-3)] transition-all',
          'hover:bg-[var(--kazer-overlay)] hover:text-[var(--kazer-text-2)]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
          menuOpen || 'opacity-0 group-hover:opacity-100',
        )}
      >
        <MoreHorizontal size={14} />
      </button>

      {menuOpen ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={onMenuToggle}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.14 }}
            className="absolute right-1 top-8 z-50 w-[176px] overflow-hidden rounded-lg border border-[var(--kazer-line-strong)] bg-[var(--kazer-elevated)] p-1 shadow-[var(--shadow-lg)]"
          >
            <MenuItem
              icon={Pencil}
              label="Renomear"
              onClick={() => {
                onRename?.(conversation);
                onMenuToggle();
              }}
            />
            <MenuItem
              icon={Pin}
              label={conversation.pinned ? 'Desafixar' : 'Fixar'}
              onClick={() => {
                onPin?.(conversation);
                onMenuToggle();
              }}
            />
            <MenuItem
              icon={Archive}
              label={conversation.archived ? 'Desarquivar' : 'Arquivar'}
              onClick={() => {
                onArchive?.(conversation);
                onMenuToggle();
              }}
            />
            <MenuItem
              icon={Trash2}
              label="Excluir"
              danger
              onClick={() => {
                onDelete?.(conversation);
                onMenuToggle();
              }}
            />
          </motion.div>
        </>
      ) : null}
    </li>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[13px] transition-colors',
        danger
          ? 'text-[var(--kazer-red)] hover:bg-[var(--kazer-red-wash)]'
          : 'text-[var(--kazer-text-2)] hover:bg-[var(--kazer-overlay)] hover:text-[var(--kazer-text)]',
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

function FooterLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
        active
          ? 'bg-[var(--kazer-elevated)] text-[var(--kazer-text)]'
          : 'text-[var(--kazer-text-2)] hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text)]',
      )}
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}
