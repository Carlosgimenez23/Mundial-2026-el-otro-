'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { MatchStatus, ResultMap } from '@/lib/types';
import { matchStatus } from '@/lib/data';

interface ResultsState {
  results: ResultMap;
  overrides: Record<string, MatchStatus>;
  manual: string[];
  ready: boolean;
  refresh: () => Promise<void>;
  isManual: (id: string) => boolean;
  setManualResult: (
    id: string,
    home: number,
    away: number,
    status: MatchStatus,
    overrideApi: boolean,
  ) => Promise<void>;
  clearManual: (id: string) => Promise<void>;
  resyncAll: () => Promise<void>;
  effectiveStatus: (id: string, kickoff: string, nowMs: number) => MatchStatus;
}

interface ResultRow {
  matchId: string;
  home: number;
  away: number;
  status: MatchStatus;
  manual: boolean;
}

const ResultsContext = createContext<ResultsState | null>(null);

export function ResultsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<ResultMap>({});
  const [overrides, setOverrides] = useState<Record<string, MatchStatus>>({});
  const [manual, setManual] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/results');
      const data = await res.json();
      const rows: ResultRow[] = data.results ?? [];
      const r: ResultMap = {};
      const ov: Record<string, MatchStatus> = {};
      const man: string[] = [];
      for (const row of rows) {
        r[row.matchId] = { home: row.home, away: row.away };
        ov[row.matchId] = row.status;
        if (row.manual) man.push(row.matchId);
      }
      setResults(r);
      setOverrides(ov);
      setManual(man);
    } catch {
      /* keep existing */
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setReady(true));
    // Light polling so live results/leaderboard reflect API/admin updates.
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  const isManual = useCallback((id: string) => manual.includes(id), [manual]);

  const setManualResult = useCallback(
    async (id: string, home: number, away: number, status: MatchStatus, overrideApi: boolean) => {
      await fetch('/api/results', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: id, home, away, status, override: overrideApi }),
      });
      await refresh();
    },
    [refresh],
  );

  const clearManual = useCallback(
    async (id: string) => {
      await fetch('/api/results', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: id }),
      });
      await refresh();
    },
    [refresh],
  );

  const resyncAll = useCallback(async () => {
    await fetch('/api/results', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    await refresh();
  }, [refresh]);

  const effectiveStatus = useCallback(
    (id: string, kickoff: string, nowMs: number): MatchStatus => {
      if (overrides[id]) return overrides[id];
      if (results[id]) return 'finished';
      return matchStatus(kickoff, nowMs);
    },
    [overrides, results],
  );

  return (
    <ResultsContext.Provider
      value={{ results, overrides, manual, ready, refresh, isManual, setManualResult, clearManual, resyncAll, effectiveStatus }}
    >
      {children}
    </ResultsContext.Provider>
  );
}

export function useResults(): ResultsState {
  const ctx = useContext(ResultsContext);
  if (!ctx) throw new Error('useResults must be used within ResultsProvider');
  return ctx;
}
