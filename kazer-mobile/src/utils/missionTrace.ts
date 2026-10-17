/**
 * Mission Trace model.
 *
 * The rail is the KAZER signature (components.md §1). It is derived from the
 * tool runs that stream in, so a live run lights up step by step and a
 * finished message shows exactly what was executed.
 */

import { formatDuration } from '@kazer/core';
import type { MissionStep, Mode, ToolRun } from '@kazer/core';

type StepKind = MissionStep['kind'];

/** Canonical order: intenção → buscas paralelas → fontes lidas → síntese → artefato. */
const CANONICAL: { kind: StepKind; label: string }[] = [
  { kind: 'intent', label: 'Intenção entendida' },
  { kind: 'search', label: 'Buscas em paralelo' },
  { kind: 'read', label: 'Fontes lidas' },
  { kind: 'synthesis', label: 'Síntese' },
  { kind: 'artifact', label: 'Artefato criado' },
];

const TOOL_TO_STEP: Record<string, StepKind> = {
  classify_intent: 'intent',
  generate_queries: 'search',
  web_search: 'search',
  net_fetch: 'search',
  read_sources: 'read',
  synthesize: 'synthesis',
  code_interpreter: 'synthesis',
  run_tests: 'synthesis',
  create_artifact: 'artifact',
  write_file: 'artifact',
};

export interface MissionTraceInput {
  mode: Mode;
  toolRuns: ToolRun[] | undefined;
  /** True while tokens are still arriving. */
  streaming: boolean;
  hasSources: boolean;
  hasArtifact: boolean;
}

export function buildMissionSteps(input: MissionTraceInput): MissionStep[] {
  const runs = input.toolRuns ?? [];
  const completed = new Set<StepKind>();

  for (const run of runs) {
    if (run.status === 'done' || run.status === 'running') {
      const kind = TOOL_TO_STEP[run.name];
      if (kind) completed.add(kind);
    }
  }

  // A mission implies searches and reads even before the tool rows land.
  if (input.mode === 'research' || input.mode === 'mission') {
    if (completed.has('intent')) completed.add('search');
    if (completed.has('search')) completed.add('read');
  }
  if (input.streaming) completed.add('synthesis');
  if (input.hasArtifact) completed.add('artifact');

  const visible: StepKind[] =
    input.mode === 'chat'
      ? ['intent', 'synthesis', 'artifact']
      : CANONICAL.map((step) => step.kind);

  const activeKind = input.streaming
    ? visible.find((kind) => !completed.has(kind)) ?? null
    : null;

  return visible
    .filter((kind) => {
      if (kind === 'artifact') {
        return input.mode === 'mission' || input.hasArtifact;
      }
      if (kind === 'search' || kind === 'read') {
        return input.mode !== 'chat' || completed.has(kind);
      }
      return true;
    })
    .map((kind, position) => {
      const canonical = CANONICAL.find((step) => step.kind === kind);
      const run = runs.find((item) => TOOL_TO_STEP[item.name] === kind);

      const status: MissionStep['status'] = completed.has(kind)
        ? 'done'
        : kind === activeKind
          ? 'active'
          : 'pending';

      // The step right after the active one stays pending, not active.
      const isNext = activeKind !== null && position > 0;
      const resolvedStatus =
        status === 'active' || isNext ? status : completed.has(kind) ? 'done' : 'pending';

      return {
        id: kind,
        kind,
        label: run?.label ?? canonical?.label ?? kind,
        detail: buildDetail(run, kind, resolvedStatus),
        status: resolvedStatus,
      };
    });
}

function buildDetail(
  run: ToolRun | undefined,
  kind: StepKind,
  status: MissionStep['status'],
): string | null {
  if (run?.output) {
    return status === 'done'
      ? `${formatDuration(run.durationMs)} · ${run.output}`
      : run.output;
  }
  if (status === 'pending') return null;
  if (kind === 'intent') return 'analisando o pedido';
  if (kind === 'search') return 'preparando consultas';
  if (kind === 'read') return 'abrindo fontes';
  if (kind === 'synthesis') return 'escrevendo a resposta';
  return 'preparando entrega';
}