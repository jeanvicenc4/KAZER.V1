/**
 * KAZER — in-memory mock adapters.
 * These simulate latency and streaming so the UI is fully navigable without a backend.
 * Replace with real implementations (Supabase + Vercel AI SDK) later.
 */

import type {
  Artifact,
  Conversation,
  Message,
  Plan,
  Profile,
  Skill,
  Source,
  Subscription,
  ToolRun,
} from '../types';
import type {
  ArtifactAdapter,
  AuthAdapter,
  BillingAdapter,
  ChatAdapter,
  ResearchAdapter,
  SendMessageInput,
  SkillsAdapter,
  StreamChunk,
} from './types';
import {
  demoArtifacts,
  demoConversations,
  demoMessages,
  demoProfile,
  demoSkills,
  demoSources,
  demoToolRuns,
  planDefinitions,
} from '../mocks/data';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const now = () => new Date().toISOString();

/* -------------------------------------------------------------------------- */
/* Chat                                                                        */
/* -------------------------------------------------------------------------- */

const cannedAnswer = `Boa pergunta. Vou tratar isso em três camadas: o que os dados dizem, o que é interpretação e o que vale fazer.

### O que os dados mostram

A tendência dos últimos 12 meses aponta para uma consolidação clara no segmento intermediário — as opções de custo baixo perderam espaço justamente porque a confiabilidade virou o principal atrito percebido pelos times.

### O que é interpretação

Aqui existe divergência entre as fontes: parte delas mede adoção e parte mede retenção. São números diferentes para o mesmo fenômeno, e é fácil citá-los como se fossem a mesma coisa.

### O que vale fazer

1. Começar pelo critério que realmente importa para o seu caso de uso.
2. Medir custo por tarefa, não por token.
3. Reavaliar em 90 dias — o segmento muda rápido.`;

const cannedFollowUps = [
  'Aprofunde o segundo ponto com exemplos',
  'Compare com a alternativa mais barata',
  'Monte uma planilha com esse comparativo',
  'Quais são os riscos dessa abordagem?',
];

export function createMockChatAdapter(): ChatAdapter {
  const conversations = [...demoConversations];
  const messages: Record<string, Message[]> = JSON.parse(
    JSON.stringify(demoMessages),
  );

  async function* streamAnswer(
    input: SendMessageInput,
  ): AsyncGenerator<StreamChunk> {
    const isResearch = input.mode === 'research';
    const isMission = input.mode === 'mission';

    // Step 1 — intent
    yield {
      type: 'tool',
      toolRun: {
        id: `tr_${Math.random().toString(36).slice(2, 9)}`,
        messageId: 'pending',
        name: 'classify_intent',
        label: 'Classificar intenção',
        status: 'done',
        durationMs: 280,
        output: `intent=${isResearch ? 'research' : isMission ? 'mission' : 'question'}`,
        detail: isResearch ? 'research' : isMission ? 'mission' : 'question',
      },
    };
    await sleep(260);

    if (isResearch || isMission) {
      // Step 2 — parallel searches
      yield {
        type: 'tool',
        toolRun: {
          id: `tr_${Math.random().toString(36).slice(2, 9)}`,
          messageId: 'pending',
          name: 'web_search',
          label: isMission ? '4 buscas em paralelo' : '3 buscas em paralelo',
          status: 'done',
          durationMs: 1640,
          output: '19 resultados brutos · 7 únicos',
          detail: '19 brutos → 7 únicos',
        },
      };
      await sleep(420);

      const readCount = isMission ? 9 : 7;
      yield {
        type: 'tool',
        toolRun: {
          id: `tr_${Math.random().toString(36).slice(2, 9)}`,
          messageId: 'pending',
          name: 'read_sources',
          label: `Lendo ${readCount} fontes`,
          status: 'done',
          durationMs: 4200,
          output: `${readCount} páginas lidas`,
          detail: `${readCount} fontes lidas`,
        },
      };
      await sleep(380);

      for (const source of demoSources.slice(0, 5)) {
        yield { type: 'source', source };
        await sleep(90);
      }
    }

    // Reasoning block
    if (isResearch || isMission) {
      yield {
        type: 'reasoning',
        text: 'Separo fato de inferência e checo se as fontes concordam entre si antes de escrever a síntese.',
      };
      await sleep(320);
    }

    // Step 3 — streamed tokens
    const body = isMission
      ? `## Missão entregue

O plano de execução foi quebrado em etapas verificáveis, executado e validado. O artefato final está anexado ao painel lateral.

### O que foi feito

1. Coleta dos insumos necessários com fontes rastreáveis.
2. Execução das etapas na ordem planejada.
3. Validação do resultado contra os critérios de aceite.
4. Entrega do artefato pronto para uso.`
      : cannedAnswer;

    const words = body.split(/(\s+)/);
    for (const word of words) {
      yield { type: 'token', text: word };
      await sleep(11);
    }

    // Citations
    if (isResearch) {
      for (let i = 0; i < 5; i++) {
        yield {
          type: 'citation',
          citation: { index: i + 1, sourceId: `src_0${i + 1}` },
        };
        await sleep(60);
      }
    }

    if (isMission) {
      yield {
        type: 'tool',
        toolRun: {
          id: `tr_${Math.random().toString(36).slice(2, 9)}`,
          messageId: 'pending',
          name: 'create_artifact',
          label: 'Criar artefato',
          status: 'done',
          durationMs: 1200,
          output: 'resultado.md · 9.204 bytes',
          detail: 'resultado.md',
        },
      };
      await sleep(300);
    }

    yield { type: 'done', followUps: cannedFollowUps };
  }

  return {
    async *send(input) {
      let conversationId = input.conversationId;
      if (!conversationId) {
        const created = await this.createConversation(
          input.content.slice(0, 48),
          input.mode,
        );
        conversationId = created.id;
        yield { type: 'token', text: '' };
      }

      const userMessage: Message = {
        id: `msg_${Math.random().toString(36).slice(2, 9)}`,
        conversationId,
        role: 'user',
        content: input.content,
        createdAt: now(),
        mode: input.mode,
        model: null,
      };
      messages[conversationId] = [...(messages[conversationId] ?? []), userMessage];

      const toolRuns: ToolRun[] = [];
      const sources: Source[] = [];
      const citations: { index: number; sourceId: string }[] = [];
      let reasoning = '';
      let text = '';

      for await (const chunk of streamAnswer(input)) {
        if (chunk.type === 'tool' && chunk.toolRun) {
          toolRuns.push(chunk.toolRun);
        } else if (chunk.type === 'source' && chunk.source) {
          sources.push(chunk.source);
        } else if (chunk.type === 'citation' && chunk.citation) {
          citations.push(chunk.citation);
        } else if (chunk.type === 'reasoning') {
          reasoning += chunk.text ?? '';
        } else if (chunk.type === 'token') {
          text += chunk.text ?? '';
        } else if (chunk.type === 'done') {
          const assistantMessage: Message = {
            id: `msg_${Math.random().toString(36).slice(2, 9)}`,
            conversationId,
            role: 'assistant',
            content: text,
            createdAt: now(),
            mode: input.mode,
            model: input.model,
            reasoning: reasoning || null,
            citations: citations.length ? citations : undefined,
            toolRuns: toolRuns.length ? toolRuns : undefined,
            followUps: chunk.followUps,
          };
          messages[conversationId] = [
            ...(messages[conversationId] ?? []),
            assistantMessage,
          ];
          yield chunk;
          return;
        }
        yield chunk;
      }
    },

    async *regenerate(messageId) {
      const convId = Object.keys(messages).find((key) =>
        messages[key].some((m) => m.id === messageId),
      );
      const source = convId
        ? messages[convId].find((m) => m.id === messageId)
        : undefined;
      if (!source) {
        yield { type: 'error', error: 'Mensagem não encontrada para regenerar.' };
        return;
      }
      const conv = conversations.find((c) => c.id === convId);
      yield* streamAnswer({
        conversationId: convId ?? null,
        content: 'regenerate',
        mode: source.mode,
        model: source.model ?? 'kazer-4',
      });
    },

    async listConversations() {
      return [...conversations].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
    },

    async getConversation(id) {
      return conversations.find((c) => c.id === id) ?? null;
    },

    async getMessages(conversationId) {
      return messages[conversationId] ?? [];
    },

    async createConversation(title = 'Nova missão', mode = 'chat') {
      const conversation: Conversation = {
        id: `conv_${Math.random().toString(36).slice(2, 9)}`,
        title,
        mode,
        model: 'kazer-4',
        pinned: false,
        archived: false,
        skillId: null,
        messageCount: 0,
        createdAt: now(),
        updatedAt: now(),
        preview: '',
        sourceCount: 0,
        artifactCount: 0,
      };
      conversations.unshift(conversation);
      messages[conversation.id] = [];
      return conversation;
    },

    async renameConversation(id, title) {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) throw new Error('Conversa não encontrada.');
      conv.title = title;
      conv.updatedAt = now();
      return conv;
    },

    async togglePin(id) {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) throw new Error('Conversa não encontrada.');
      conv.pinned = !conv.pinned;
      return conv;
    },

    async toggleArchive(id) {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) throw new Error('Conversa não encontrada.');
      conv.archived = !conv.archived;
      return conv;
    },

    async deleteConversation(id) {
      const index = conversations.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Conversa não encontrada.');
      conversations.splice(index, 1);
      delete messages[id];
    },

    async searchConversations(query) {
      const q = query.trim().toLowerCase();
      if (!q) return this.listConversations();
      return conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.preview.toLowerCase().includes(q),
      );
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Research                                                                     */
/* -------------------------------------------------------------------------- */

export function createMockResearchAdapter(): ResearchAdapter {
  return {
    async *run(question) {
      const chat = createMockChatAdapter();
      yield* chat.send({
        conversationId: null,
        content: question,
        mode: 'research',
        model: 'kazer-4-reasoning',
      });
    },

    async getResult(conversationId) {
      const conv = demoConversations.find((c) => c.id === conversationId);
      if (!conv) return null;
      const list = demoMessages[conversationId] ?? [];
      const assistant = list.find((m) => m.role === 'assistant');
      if (!assistant) return null;
      return {
        queries: [
          'preço llm brasil 2026',
          'custo token produção llm',
          'openai anthropic pricing brazil',
        ],
        sources: demoSources,
        answer: assistant.content,
        citations: assistant.citations ?? [],
        followUps: assistant.followUps ?? [],
        readCount: 12,
      };
    },

    async getSources(conversationId) {
      return demoSources.filter((s) => s.conversationId === conversationId);
    },

    async saveSource(sourceId) {
      const source = demoSources.find((s) => s.id === sourceId);
      if (!source) throw new Error('Fonte não encontrada.');
      source.saved = !source.saved;
      return source;
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Artifacts                                                                   */
/* -------------------------------------------------------------------------- */

export function createMockArtifactAdapter(): ArtifactAdapter {
  return {
    async list(conversationId) {
      if (conversationId) {
        return demoArtifacts.filter((a) => a.conversationId === conversationId);
      }
      return [...demoArtifacts];
    },

    async get(id) {
      return demoArtifacts.find((a) => a.id === id) ?? null;
    },

    async download(id) {
      const artifact = demoArtifacts.find((a) => a.id === id);
      if (!artifact) throw new Error('Artefato não encontrado.');
      const body = `# ${artifact.name}\n\n${artifact.preview}\n\n(Dados de demonstração do KAZER.)`;
      return {
        filename: artifact.name.split('/').pop() ?? artifact.name,
        mimeType: artifact.mimeType,
        blob: new Blob([body], { type: artifact.mimeType }),
      };
    },

    async versions(id) {
      const artifact = demoArtifacts.find((a) => a.id === id);
      if (!artifact) return [];
      return Array.from({ length: artifact.version }, (_, i) => ({
        id: `ver_${id}_${i + 1}`,
        artifactId: id,
        version: i + 1,
        createdAt: artifact.createdAt,
        sizeBytes: artifact.sizeBytes,
        note:
          i === artifact.version - 1
            ? 'Versão atual'
            : 'Revisão automática após nova execução da Skill.',
      })).reverse();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Skills                                                                      */
/* -------------------------------------------------------------------------- */

export function createMockSkillsAdapter(): SkillsAdapter {
  const skills = [...demoSkills];
  return {
    async list() {
      return skills;
    },
    async get(id) {
      return skills.find((s) => s.id === id) ?? null;
    },
    async toggle(id, active) {
      const skill = skills.find((s) => s.id === id);
      if (!skill) throw new Error('Skill não encontrada.');
      skill.active = active;
      return skill;
    },
    async load(slug) {
      return `# ${slug}\n\nConteúdo de demonstração. A Skill completa está em /skills/${slug}/SKILL.md.`;
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Billing                                                                     */
/* -------------------------------------------------------------------------- */

export function createMockBillingAdapter(
  initialPlan: Plan = 'pro',
): BillingAdapter {
  let plan: Plan = initialPlan;
  let subscription: Subscription = {
    userId: demoProfile.id,
    plan,
    status: 'active',
    currentPeriodEnd: '2026-11-17T00:00:00.000Z',
    provider: 'stripe',
  };

  const featureMap: Record<string, Plan> = {
    longTasks: 'max',
    artifacts: 'max',
    agentMode: 'max',
    backgroundExecution: 'max',
    advancedResearch: 'pro',
    premiumModels: 'pro',
    export: 'pro',
    unlimitedSkills: 'max',
  };

  const order: Plan[] = ['free', 'pro', 'max'];

  return {
    async getPlan() {
      return plan;
    },
    async getSubscription() {
      return subscription;
    },
    async getPlans() {
      return planDefinitions;
    },
    async canUse(feature) {
      const required = featureMap[feature];
      if (!required) return true;
      return order.indexOf(plan) >= order.indexOf(required);
    },
    async subscribe(nextPlan, provider) {
      plan = nextPlan;
      subscription = {
        ...subscription,
        plan: nextPlan,
        provider,
        status: 'active',
        currentPeriodEnd: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };
      return {};
    },
    async cancel() {
      plan = 'free';
      subscription = { ...subscription, plan: 'free', status: 'canceled' };
    },
    async setDemoPlan(nextPlan) {
      plan = nextPlan;
      subscription = { ...subscription, plan: nextPlan };
      return plan;
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                        */
/* -------------------------------------------------------------------------- */

export function createMockAuthAdapter(): AuthAdapter {
  const profile = { ...demoProfile };
  return {
    async getProfile() {
      return profile;
    },
    async signOut() {
      /* no-op in the demo */
    },
    async updateProfile(patch) {
      Object.assign(profile, patch);
      return profile;
    },
  };
}
