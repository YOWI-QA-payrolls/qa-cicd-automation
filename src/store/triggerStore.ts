'use client';
import { create } from 'zustand';
import type { RunStatus } from '@/types';

interface TriggerState {
  activeRunId: string | null;
  runStatus: RunStatus;
  triggeredAt: Date | null;
  scope: string | null;
  setRunStatus: (status: RunStatus) => void;
  setActiveRun: (runId: string, scope: string) => void;
  clearRun: () => void;
}

export const useTriggerStore = create<TriggerState>((set) => ({
  activeRunId: null,
  runStatus: 'idle',
  triggeredAt: null,
  scope: null,
  setRunStatus: (status) => set({ runStatus: status }),
  setActiveRun: (runId, scope) => set({ activeRunId: runId, scope, triggeredAt: new Date(), runStatus: 'queued' }),
  clearRun: () => set({ activeRunId: null, runStatus: 'idle', triggeredAt: null, scope: null }),
}));
