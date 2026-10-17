/**
 * KAZER — adapter interfaces.
 * The UI talks to these. Swap `mock` implementations for real Supabase /
 * Vercel AI SDK / Stripe implementations later without touching components.
 */

import type {
  Artifact,
  Conversation,
  Message,
  Mode,
  ModelId,
  Plan,
  PlanDefinition,
  Profile,
  Skill,
  Source,
  Subscription,
  ToolRun,
} from '../types';

export interface StreamChunk {
  type: 'token' | 'reasoning' | 'tool' | 'source' | 'citation' | 'done' | 'error';
  text?: string;
  toolRun?: ToolRun;
  source?: Source;
  citation?: { index: number; sourceId: string };
  followUps?: string[];
  error?: string;
}

export interface SendMessageInput {
  conversationId: string | null;
  content: string;
  mode: Mode;
  model: ModelId;
  skillId?: string | null;
}

export interface ChatAdapter {
  send(input: SendMessageInput): AsyncIterable<StreamChunk>;
  regenerate(messageId: string): AsyncIterable<StreamChunk>;
  listConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | null>;
  getMessages(conversationId: string): Promise<Message[]>;
  createConversation(title?: string, mode?: Mode): Promise<Conversation>;
  renameConversation(id: string, title: string): Promise<Conversation>;
  togglePin(id: string): Promise<Conversation>;
  toggleArchive(id: string): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  searchConversations(query: string): Promise<Conversation[]>;
}

export interface ResearchResult {
  queries: string[];
  sources: Source[];
  answer: string;
  citations: { index: number; sourceId: string }[];
  followUps: string[];
  readCount: number;
}

export interface ResearchAdapter {
  run(question: string, mode: Mode): AsyncIterable<StreamChunk>;
  getResult(conversationId: string): Promise<ResearchResult | null>;
  getSources(conversationId: string): Promise<Source[]>;
  saveSource(sourceId: string): Promise<Source>;
}

export interface ArtifactAdapter {
  list(conversationId?: string | null): Promise<Artifact[]>;
  get(id: string): Promise<Artifact | null>;
  download(id: string): Promise<{ filename: string; mimeType: string; blob: Blob }>;
  versions(id: string): Promise<import('../types').ArtifactVersion[]>;
}

export interface BillingAdapter {
  getPlan(): Promise<Plan>;
  getSubscription(): Promise<Subscription | null>;
  getPlans(): Promise<PlanDefinition[]>;
  canUse(feature: FeatureKey): Promise<boolean>;
  subscribe(plan: Plan, provider: 'stripe' | 'revenuecat'): Promise<{ checkoutUrl?: string }>;
  cancel(): Promise<void>;
  /** Demo-only toggle used by the pricing page to preview the MAX experience. */
  setDemoPlan(plan: Plan): Promise<Plan>;
}

export type FeatureKey =
  | 'longTasks'
  | 'artifacts'
  | 'agentMode'
  | 'backgroundExecution'
  | 'advancedResearch'
  | 'premiumModels'
  | 'export'
  | 'unlimitedSkills';

export interface SkillsAdapter {
  list(): Promise<Skill[]>;
  get(id: string): Promise<Skill | null>;
  toggle(id: string, active: boolean): Promise<Skill>;
  load(slug: string): Promise<string>;
}

export interface AuthAdapter {
  getProfile(): Promise<Profile | null>;
  signOut(): Promise<void>;
  updateProfile(patch: Partial<Profile>): Promise<Profile>;
}
