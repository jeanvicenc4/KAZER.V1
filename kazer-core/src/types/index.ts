/**
 * KAZER — shared domain types.
 * Used by kazer-web and kazer-mobile. Mirrors the Supabase schema.
 */

export type Plan = 'free' | 'pro' | 'max';

export type Mode = 'chat' | 'research' | 'mission';

export type ModelId =
  | 'kazer-4'
  | 'kazer-4-reasoning'
  | 'kazer-4-fast'
  | 'kazer-pro'
  | 'local-llama';

export interface ModelOption {
  id: ModelId;
  name: string;
  short: string;
  description: string;
  provider: 'kazer' | 'openai' | 'anthropic' | 'google' | 'ollama';
  reasoning: boolean;
  fast: boolean;
  minPlan: Plan;
  contextWindow: number;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  locale: 'pt-BR' | 'en-US' | 'es-ES';
  theme: 'dark' | 'light' | 'system';
  defaultModel: ModelId;
  defaultSkill: string | null;
  plan: Plan;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  mode: Mode;
  model: ModelId;
  pinned: boolean;
  archived: boolean;
  skillId: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  preview: string;
  sourceCount: number;
  artifactCount: number;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  mode: Mode;
  model: ModelId | null;
  reasoning?: string | null;
  citations?: CitationRef[];
  toolRuns?: ToolRun[];
  artifactIds?: string[];
  followUps?: string[];
  streaming?: boolean;
  interrupted?: boolean;
}

export interface CitationRef {
  index: number;
  sourceId: string;
}

export interface Source {
  id: string;
  conversationId: string | null;
  index: number;
  title: string;
  domain: string;
  url: string;
  favicon: string;
  snippet: string;
  publishedAt: string | null;
  saved: boolean;
  cited: boolean;
  readCount: number;
  relevance: number;
}

export type ToolRunStatus =
  | 'pending'
  | 'running'
  | 'done'
  | 'error'
  | 'cancelled'
  | 'timeout'
  | 'unavailable'
  | 'denied';

/** Real process metadata. Mock/demo tool runs must not populate these fields. */
export interface TerminalExecutionDetails {
  command: string;
  workingDirectory: string;
  missionId: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface ToolRun {
  id: string;
  messageId: string;
  name: string;
  label: string;
  status: ToolRunStatus;
  durationMs: number | null;
  output: string | null;
  detail?: string | null;
  /** Present only when a server-side isolated executor confirms the run. */
  terminal?: TerminalExecutionDetails;
}

export type TerminalExecutorState =
  | 'waiting'
  | 'running'
  | 'completed'
  | 'interrupted'
  | 'error'
  | 'timeout'
  | 'denied'
  | 'unavailable';

/** Shared contract for real isolated-executor records; contains no credentials. */
export interface TerminalExecution {
  id: string;
  conversationId: string;
  missionId: string;
  state: TerminalExecutorState;
  command: string;
  workingDirectory: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  canCancel: boolean;
  error: string | null;
}

export interface TerminalExecutorLimits {
  timeoutMs: number;
  maxOutputBytes: number;
  maxConcurrentProcesses: number;
}

/**
 * A server-only executor must honor the passed resource limits, keep command
 * execution out of the Next.js host, and reject unsupported operations.
 */
export interface TerminalExecutor {
  execute(input: {
    executionId: string;
    conversationId: string;
    missionId: string;
    workspaceId: string;
    workingDirectory: string;
    command: string;
    timeoutMs: number;
    maxOutputBytes: number;
  }, signal?: AbortSignal): Promise<TerminalExecution>;
  cancel(input: {
    executionId: string;
    workspaceId: string;
  }): Promise<boolean>;
}

export interface TerminalPermissionContext {
  authenticatedUserId: string;
  workspaceId: string;
  conversationId: string;
  skillPermissions: SkillPermission[];
  authorizedByServer: true;
}

/**
 * Check a context assembled by the server from the authenticated session and
 * server-loaded Skill permissions. This helper is not client authentication.
 */
export function canInvokeTerminal(
  context: TerminalPermissionContext | null | undefined,
): context is TerminalPermissionContext {
  return Boolean(
    context?.authorizedByServer === true &&
      context.authenticatedUserId &&
      context.workspaceId &&
      context.conversationId &&
      context.skillPermissions.includes('shell.exec'),
  );
}

/**
 * Lexical path boundary check only. The isolated filesystem must also prevent
 * symlink escapes; this must never be used to sandbox a host process.
 */
export function isWorkspacePath(candidate: string, root: string): boolean {
  const normalize = (path: string) => {
    const parts: string[] = [];
    for (const part of path.replaceAll('\\', '/').split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') {
        if (!parts.length) return null;
        parts.pop();
      } else {
        parts.push(part);
      }
    }
    return parts.join('/');
  };

  const normalizedRoot = normalize(root);
  const normalizedCandidate = normalize(candidate);
  return Boolean(
    normalizedRoot &&
      normalizedCandidate &&
      (normalizedCandidate === normalizedRoot ||
        normalizedCandidate.startsWith(`${normalizedRoot}/`)),
  );
}

export const TERMINAL_EXECUTION_TOOL = 'terminal.exec';
export const TERMINAL_EXECUTION_LIMITS: TerminalExecutorLimits = {
  timeoutMs: 30_000,
  maxOutputBytes: 64 * 1024,
  maxConcurrentProcesses: 1,
};

export type ArtifactType =
  | 'document'
  | 'spreadsheet'
  | 'code'
  | 'landing'
  | 'report'
  | 'image'
  | 'pdf'
  | 'docx'
  | 'csv'
  | 'xlsx';

export interface Artifact {
  id: string;
  conversationId: string | null;
  name: string;
  type: ArtifactType;
  version: number;
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  preview: string;
  locked: boolean;
  skillId: string | null;
}

export interface ArtifactVersion {
  id: string;
  artifactId: string;
  version: number;
  createdAt: string;
  sizeBytes: number;
  note: string;
}

export type SkillPermission =
  | 'web.read'
  | 'files.write'
  | 'shell.exec'
  | 'code.run'
  | 'net.fetch';

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
  icon: string;
  accent: 'gold' | 'violet' | 'cyan';
  permissions: SkillPermission[];
  active: boolean;
  runs: number;
  avgDurationMs: number;
  bodyPath: string;
}

export interface UsageLog {
  id: string;
  userId: string;
  conversationId: string | null;
  kind: 'message' | 'research' | 'tool_run' | 'artifact';
  units: number;
  day: string;
  plan: Plan;
}

export interface Subscription {
  userId: string;
  plan: Plan;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodEnd: string;
  provider: 'stripe' | 'revenuecat' | 'manual';
}

export interface PlanLimit {
  dailyMessages: number;
  dailyResearch: number;
  activeSkills: number;
  maxSources: number;
  parallelSearches: number;
  longTasks: boolean;
  artifacts: boolean;
  agentMode: boolean;
  backgroundExecution: boolean;
  historyDays: number;
  storageMb: number;
}

export interface PlanDefinition {
  id: Plan;
  name: string;
  priceBRL: number;
  priceLabel: string;
  tagline: string;
  highlights: string[];
  limits: PlanLimit;
  cta: string;
  featured: boolean;
}

export interface Device {
  id: string;
  userId: string;
  platform: 'web' | 'ios' | 'android';
  name: string;
  lastSeenAt: string;
}

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android';
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  createdAt: string;
}

export interface MissionStep {
  id: string;
  label: string;
  detail: string | null;
  status: 'pending' | 'active' | 'done';
  kind: 'intent' | 'search' | 'read' | 'synthesis' | 'artifact';
}

export interface SearchQuery {
  id: string;
  conversationId: string;
  query: string;
  results: number;
  ranAt: string;
}
