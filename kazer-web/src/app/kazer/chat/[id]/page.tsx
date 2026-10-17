'use client';

import * as React from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, FileText, MoreHorizontal, Pencil, Share2, Trash2 } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';
import { useWorkspace } from '@/components/workspace/workspace-context';
import { Composer } from '@/components/chat/composer';
import {
  AssistantMessage,
  FollowUpChips,
  UserMessage,
} from '@/components/chat/message';
import { useChat } from '@/hooks/use-chat';
import { models, type Message } from '@kazer/core';
import { cn } from '@/lib/utils';

function ChatView() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const workspace = useWorkspace();
  const conversationId = params?.id ?? null;

  const [activeCitation, setActiveCitation] = React.useState<number | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [renaming, setRenaming] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState('');
  const [initialPrompt] = React.useState(() => searchParams.get('q'));

  const conversation = workspace.conversations.find(
    (c) => c.id === conversationId,
  );

  const chat = useChat({
    adapter: workspace.chatAdapter,
    conversationId,
    mode: workspace.mode,
    model: workspace.model,
  });

  const conversationSources = React.useMemo(
    () => workspace.sources,
    [workspace.sources],
  );

  const conversationArtifacts = React.useMemo(
    () =>
      workspace.artifacts.filter(
        (a) => !a.conversationId || a.conversationId === conversationId,
      ),
    [workspace.artifacts, conversationId],
  );

  const toolRuns = React.useMemo(
    () => chat.messages.flatMap((m) => m.toolRuns ?? []),
    [chat.messages],
  );

  // Seed the conversation from the ?q= param (mission started from home).
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (seeded.current) return;
    if (initialPrompt && conversationId) {
      seeded.current = true;
      void chat.send(initialPrompt);
    }
    // `chat` is intentionally excluded: it is recreated on every render and
    // including it would re-trigger the seed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, conversationId]);

  // Preload the stored conversation from the adapter.
  const [loadedFor, setLoadedFor] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!conversationId || loadedFor === conversationId) return;
    setLoadedFor(conversationId);

    // A brand-new conversation seeded from ?q= must not be overwritten by the
    // adapter's stored (empty) thread.
    if (initialPrompt) return;

    workspace.chatAdapter.getMessages(conversationId).then((stored) => {
      if (stored.length) chat.hydrate(stored);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, loadedFor, workspace.chatAdapter, initialPrompt]);

  const submit = async (value: string) => {
    await chat.send(value, {
      mode: workspace.mode,
      model: workspace.model,
    });
  };

  const startRename = () => {
    setTitleDraft(conversation?.title ?? '');
    setRenaming(true);
    setMenuOpen(false);
  };

  const commitRename = () => {
    if (titleDraft.trim() && conversation) {
      workspace.renameConversation(conversation.id, titleDraft.trim());
    }
    setRenaming(false);
  };

  return (
    <WorkspaceShell
      conversations={workspace.conversations}
      sources={conversationSources}
      artifacts={conversationArtifacts}
      toolRuns={toolRuns}
      activeCitation={activeCitation}
      onCitationSelect={setActiveCitation}
      onNewMission={() => router.push('/kazer')}
      onSelectConversation={(c) => router.push(`/kazer/chat/${c.id}`)}
      onToggleSaveSource={workspace.toggleSaveSource}
      onRenameConversation={startRename}
      onPinConversation={(c) => workspace.togglePin(c.id)}
      onArchiveConversation={(c) => workspace.toggleArchive(c.id)}
      onDeleteConversation={(c) => {
        workspace.deleteConversation(c.id);
        router.push('/kazer');
      }}
      mode={workspace.mode}
    >
      {/* Conversation header actions */}
      <div className="flex items-center gap-1 border-b border-[var(--kazer-line)] bg-[var(--kazer-base)] px-4 py-2 lg:px-6">
        <button
          type="button"
          onClick={() => router.push('/kazer')}
          aria-label="Voltar para o início"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--kazer-text-3)] transition-colors hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
        >
          <ArrowLeft size={15} />
        </button>

        {renaming ? (
          <input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setRenaming(false);
            }}
            aria-label="Renomear conversa"
            autoFocus
            className="min-w-0 flex-1 rounded-md border border-[var(--kazer-line-gold)] bg-[var(--kazer-inset)] px-2 py-1 text-[14px] text-[var(--kazer-text)] focus:outline-none"
          />
        ) : (
          <h1 className="min-w-0 flex-1 truncate text-[14px] font-medium text-[var(--kazer-text)]">
            {conversation?.title ?? 'Nova missão'}
          </h1>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Ações da conversa"
            aria-expanded={menuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--kazer-text-3)] transition-colors hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
          >
            <MoreHorizontal size={15} />
          </button>

          <AnimatePresence>
            {menuOpen ? (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 top-9 z-50 w-[180px] overflow-hidden rounded-lg border border-[var(--kazer-line-strong)] bg-[var(--kazer-elevated)] p-1 shadow-[var(--shadow-lg)]"
                >
                  <MenuItem icon={Pencil} label="Renomear" onClick={startRename} />
                  <MenuItem
                    icon={FileText}
                    label="Exportar conversa"
                    onClick={() => setMenuOpen(false)}
                  />
                  <MenuItem
                    icon={Share2}
                    label="Compartilhar"
                    onClick={() => setMenuOpen(false)}
                  />
                  <MenuItem
                    icon={Trash2}
                    label="Excluir"
                    danger
                    onClick={() => {
                      if (conversation) workspace.deleteConversation(conversation.id);
                      setMenuOpen(false);
                      router.push('/kazer');
                    }}
                  />
                </motion.div>
              </>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Thread */}
      <div className="mx-auto w-full max-w-[720px] px-5 py-7">
        {!chat.messages.length ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="text-[15px] text-[var(--kazer-text-2)]">
              Nenhuma mensagem ainda. Faça a primeira pergunta.
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {chat.messages.map((message: Message) =>
              message.role === 'user' ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <div key={message.id} className="space-y-3">
                  <AssistantMessage
                    message={message}
                    sources={conversationSources}
                    activeCitation={activeCitation}
                    onCitationClick={setActiveCitation}
                    streaming={message.streaming}
                    onRegenerate={() => chat.regenerate(message.id)}
                  />
                  {message.followUps?.length && !message.streaming ? (
                    <FollowUpChips
                      suggestions={message.followUps}
                      onSelect={(value) => {
                        workspace.setMode('chat');
                        submit(value);
                      }}
                    />
                  ) : null}
                </div>
              ),
            )}
          </div>
        )}

        {chat.error ? (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-lg border border-[var(--kazer-red-wash)] bg-[var(--kazer-red-wash)] p-3.5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-[var(--kazer-red)]">
                A resposta foi interrompida
              </p>
              <p className="mt-1 text-[13px] leading-[18px] text-[var(--kazer-text-2)]">
                {chat.error}
              </p>
            </div>
            <button
              type="button"
              onClick={() => chat.regenerate(chat.messages[chat.messages.length - 1]?.id ?? '')}
              className="shrink-0 rounded-md border border-[var(--kazer-line-strong)] px-2.5 py-1.5 text-[13px] text-[var(--kazer-text-2)] transition-colors hover:bg-[var(--kazer-elevated)]"
            >
              Tentar de novo
            </button>
          </div>
        ) : null}
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 bg-gradient-to-t from-[var(--kazer-base)] via-[var(--kazer-base)] to-transparent px-5 pb-4 pt-2">
        <div className="mx-auto w-full max-w-[720px]">
          <Composer
            mode={workspace.mode}
            onModeChange={workspace.setMode}
            models={models}
            model={workspace.model}
            onModelChange={(id) => workspace.setModel(id as never)}
            onSubmit={submit}
            streaming={chat.streaming}
            onStop={chat.stop}
          />
        </div>
      </div>
    </WorkspaceShell>
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

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-[var(--kazer-base)]">
          <span className="kazer-breathe text-[13px] text-[var(--kazer-text-3)]">
            Carregando conversa…
          </span>
        </div>
      }
    >
      <ChatView />
    </Suspense>
  );
}
