'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Save, RotateCcw, AlertTriangle, Search, Check, X } from 'lucide-react';
import type { MatchStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useResults } from '@/lib/results';
import { MATCHES } from '@/lib/data';
import { KNOCKOUT_MATCHES, ROUND_ORDER, ROUND_LABELS, resolveBracket } from '@/lib/knockout';

interface RowDescriptor {
  id: string;
  label: string;
  home: { name: string; flag: string; ref: string };
  away: { name: string; flag: string; ref: string };
}

const STATUS_OPTIONS: MatchStatus[] = ['upcoming', 'live', 'finished'];

function AdminRow({
  row,
  currentHome,
  currentAway,
  currentStatus,
  manual,
  onRequestSave,
  onRequestResync,
}: {
  row: RowDescriptor;
  currentHome: number;
  currentAway: number;
  currentStatus: MatchStatus;
  manual: boolean;
  onRequestSave: (id: string, label: string, home: number, away: number, status: MatchStatus, override: boolean) => void;
  onRequestResync: (id: string, label: string) => void;
}) {
  const [home, setHome] = useState(currentHome);
  const [away, setAway] = useState(currentAway);
  const [status, setStatus] = useState<MatchStatus>(currentStatus);
  const [override, setOverride] = useState(true);

  // Reseed when the underlying stored values change (e.g. after a re-sync).
  useEffect(() => {
    setHome(currentHome);
    setAway(currentAway);
    setStatus(currentStatus);
  }, [currentHome, currentAway, currentStatus]);

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3 rounded-xl border bg-white p-3 sm:grid-cols-[1fr_auto] sm:items-center',
        manual ? 'border-[#FBBF24] bg-[#FFFBEB]' : 'border-[#EFE3DE]',
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-[#9B8178]">
            {row.label}
          </span>
          {manual && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FBBF24] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#7F1D1D]">
              Manual override
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 font-display text-base font-semibold text-[#2A1512]">
          <span aria-hidden>{row.home.flag}</span>
          <span className="truncate">{row.home.name}</span>
          <span className="text-[#D8C5BE]">vs</span>
          <span aria-hidden>{row.away.flag}</span>
          <span className="truncate">{row.away.name}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            value={home}
            onChange={(e) => setHome(Math.max(0, Number(e.target.value)))}
            className="tnum w-14 rounded-lg border border-[#EBD9D4] bg-[#FCF8F6] px-2 py-1.5 text-center font-display text-lg font-bold text-[#2A1512] outline-none focus:border-[#DC2626] focus:bg-white"
          />
          <span className="font-display text-lg font-bold text-[#D8C5BE]">–</span>
          <input
            type="number"
            min={0}
            value={away}
            onChange={(e) => setAway(Math.max(0, Number(e.target.value)))}
            className="tnum w-14 rounded-lg border border-[#EBD9D4] bg-[#FCF8F6] px-2 py-1.5 text-center font-display text-lg font-bold text-[#2A1512] outline-none focus:border-[#DC2626] focus:bg-white"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MatchStatus)}
          className="cursor-pointer rounded-lg border border-[#EBD9D4] bg-[#FCF8F6] px-2 py-2 font-body text-xs font-medium uppercase tracking-wide text-[#2A1512] outline-none focus:border-[#DC2626] focus:bg-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-[#6B5D55]">
          <input
            type="checkbox"
            checked={override}
            onChange={(e) => setOverride(e.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer accent-[#DC2626]"
          />
          Override API
        </label>

        <button
          onClick={() => onRequestSave(row.id, row.label, home, away, status, override)}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#DC2626] px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#B91C1C]"
        >
          <Save className="h-3.5 w-3.5" /> Save
        </button>

        {manual && (
          <button
            onClick={() => onRequestResync(row.id, row.label)}
            title="Re-sync this match with the API"
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#EBD9D4] bg-white px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide text-[#6B5D55] transition-colors hover:bg-[#F1EBE7]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Re-sync
          </button>
        )}
      </div>
    </div>
  );
}

type Pending =
  | { type: 'save'; id: string; label: string; home: number; away: number; status: MatchStatus; override: boolean }
  | { type: 'resyncOne'; id: string; label: string }
  | { type: 'resyncAll' }
  | null;

export function AdminPanel() {
  const { results, overrides, manual, isManual, setManualResult, clearManual, resyncAll } = useResults();
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState<Pending>(null);

  const bracket = useMemo(() => resolveBracket(results), [results]);

  const groupRows: RowDescriptor[] = MATCHES.map((m) => ({
    id: m.id,
    label: `${m.group} · MD${m.matchday} · M${m.matchNumber}`,
    home: { name: m.home.name, flag: m.home.flag, ref: m.home.code },
    away: { name: m.away.name, flag: m.away.flag, ref: m.away.code },
  }));

  const knockoutRows: RowDescriptor[] = ROUND_ORDER.flatMap((round) =>
    KNOCKOUT_MATCHES.filter((m) => m.round === round).map((m) => {
      const r = bracket[m.n];
      return {
        id: m.id,
        label: `${ROUND_LABELS[round]} · M${m.n}`,
        home: {
          name: r.home.team?.name ?? r.home.ref,
          flag: r.home.team?.flag ?? '⚽',
          ref: r.home.ref,
        },
        away: {
          name: r.away.team?.name ?? r.away.ref,
          flag: r.away.team?.flag ?? '⚽',
          ref: r.away.ref,
        },
      };
    }),
  );

  const q = query.trim().toLowerCase();
  const matchQ = (r: RowDescriptor) =>
    !q ||
    r.label.toLowerCase().includes(q) ||
    r.home.name.toLowerCase().includes(q) ||
    r.away.name.toLowerCase().includes(q);

  const filteredGroup = groupRows.filter(matchQ);
  const filteredKnockout = knockoutRows.filter(matchQ);

  const seedFor = (id: string): { home: number; away: number; status: MatchStatus } => {
    const r = results[id];
    return {
      home: r?.home ?? 0,
      away: r?.away ?? 0,
      status: overrides[id] ?? (r ? 'finished' : 'upcoming'),
    };
  };

  const confirmPending = () => {
    if (!pending) return;
    if (pending.type === 'save') {
      setManualResult(pending.id, pending.home, pending.away, pending.status, pending.override);
    } else if (pending.type === 'resyncOne') {
      clearManual(pending.id);
    } else if (pending.type === 'resyncAll') {
      resyncAll();
    }
    setPending(null);
  };

  const renderRow = (r: RowDescriptor) => {
    const seed = seedFor(r.id);
    return (
      <AdminRow
        key={`${r.id}-${isManual(r.id) ? 'm' : 'a'}`}
        row={r}
        currentHome={seed.home}
        currentAway={seed.away}
        currentStatus={seed.status}
        manual={isManual(r.id)}
        onRequestSave={(id, label, home, away, status, override) =>
          setPending({ type: 'save', id, label, home, away, status, override })
        }
        onRequestResync={(id, label) => setPending({ type: 'resyncOne', id, label })}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* admin banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#1A2332] bg-[#102A43] px-5 py-4 text-white">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBBF24] text-[#102A43]">
          <ShieldAlert className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-display text-2xl font-bold uppercase tracking-wide">Admin Mode — Manual Override Active</p>
          <p className="text-sm text-white/70">
            Editing a result instantly recalculates every player&apos;s score, the bracket and the leaderboard.
          </p>
        </div>
      </div>

      {/* toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#EFE3DE] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1897F]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by team, group or match…"
            className="w-full rounded-lg border border-[#EFE3DE] bg-[#FCF8F6] py-2.5 pl-9 pr-3 font-body text-sm text-[#2A1512] outline-none focus:border-[#DC2626] focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#6B5D55]">
            <span className="font-display text-lg font-bold text-[#7F1D1D]">{manual.length}</span> manual edit
            {manual.length === 1 ? '' : 's'}
          </span>
          <button
            onClick={() => setPending({ type: 'resyncAll' })}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#DC2626] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
          >
            <RotateCcw className="h-4 w-4" /> Re-sync all with API
          </button>
        </div>
      </div>

      {/* group stage */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-[#2A1512]">
          Group Stage <span className="text-base text-[#A1897F]">({filteredGroup.length})</span>
        </h2>
        <div className="space-y-2">{filteredGroup.map(renderRow)}</div>
      </section>

      {/* knockout */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-[#2A1512]">
          Knockout Stage <span className="text-base text-[#A1897F]">({filteredKnockout.length})</span>
        </h2>
        <div className="space-y-2">{filteredKnockout.map(renderRow)}</div>
      </section>

      {/* confirmation modal */}
      <AnimatePresence>
        {pending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#102A43]/50 p-4 backdrop-blur-sm"
            onClick={() => setPending(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#DC2626]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-[#2A1512]">
                  {pending.type === 'resyncAll'
                    ? 'Re-sync everything?'
                    : pending.type === 'resyncOne'
                      ? 'Re-sync this match?'
                      : 'Overwrite this result?'}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-[#6B5D55]">
                {pending.type === 'save' && (
                  <>
                    Set <span className="font-semibold text-[#2A1512]">{pending.label}</span> to{' '}
                    <span className="tnum font-bold text-[#7F1D1D]">
                      {pending.home}–{pending.away}
                    </span>{' '}
                    ({pending.status}). This recalculates all users&apos; scores and the bracket immediately.
                  </>
                )}
                {pending.type === 'resyncOne' && (
                  <>
                    Remove the manual override on{' '}
                    <span className="font-semibold text-[#2A1512]">{pending.label}</span> and restore automatic API
                    data.
                  </>
                )}
                {pending.type === 'resyncAll' && (
                  <>This clears <strong>all</strong> manual overrides and edited results, restoring automatic API updates.</>
                )}
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setPending(null)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#EBD9D4] bg-white py-3 font-display text-base font-semibold uppercase tracking-wide text-[#6B5D55] transition-colors hover:bg-[#FCF8F6]"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button
                  onClick={confirmPending}
                  className="flex flex-[1.4] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#DC2626] py-3 font-display text-base font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#B91C1C]"
                >
                  <Check className="h-4 w-4" /> Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
