/**
 * Platform side effects that the adapters cannot own: opening URLs, the native
 * share sheet, and haptics. Isolated here so screens stay declarative and the
 * stubs are obvious.
 */

import { Linking, Share } from 'react-native';
import * as Haptics from 'expo-haptics';

import { brand, formatBytes } from '@kazer/core';

/** Open a source URL in the system browser. */
export async function openUrl(url: string): Promise<boolean> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

/** Native share sheet. Falls back to a no-op result when it cannot open. */
export async function shareContent(title: string, message: string): Promise<boolean> {
  try {
    const result = await Share.share({ title, message }, { dialogTitle: title });
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
}

export function tapFeedback(): void {
  void Haptics.selectionAsync().catch(() => undefined);
}

export function successFeedback(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => undefined,
  );
}

export function warningFeedback(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
    () => undefined,
  );
}

/**
 * Download an artifact.
 *
 * The mock adapter hands back a Blob, which only the web runtime can persist.
 * On device the demo reports success without writing a file — wire
 * `expo-file-system` + `expo-sharing` here when the real backend lands.
 */
export async function downloadArtifactFile(params: {
  filename: string;
  body: string;
  mimeType: string;
}): Promise<{ ok: boolean; filename: string }> {
  void params.mimeType;
  return { ok: true, filename: params.filename };
}

export function artifactShareMessage(params: {
  name: string;
  sizeBytes: number;
  version: number;
}): string {
  return [
    `${brand.name} · ${params.name}`,
    `v${params.version} · ${formatBytes(params.sizeBytes)}`,
    'Gerado pelo KAZER — Answer Engine + Agent Workspace.',
  ].join('\n');
}