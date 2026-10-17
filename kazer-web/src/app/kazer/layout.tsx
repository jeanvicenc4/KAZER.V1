'use client';

import * as React from 'react';
import { WorkspaceProvider } from '@/components/workspace/workspace-context';

export default function KazerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
