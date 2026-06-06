'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, CalendarClock, CheckCircle2, Search, SearchX } from 'lucide-react';
import type { Match, MatchStatus, PredictionMap } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useNow } from '@/lib/useNow';
import { useResults } from '@/lib/results';
import { MatchCard } from '@/components/MatchCard';
import { Countdown } from '@/components/Countdown';
import { PredictionModal } from '@/components/PredictionModal';
import { GROUP_LETTERS, ALL_TEAMS, getNextKickoff, POINTS_EXACT, POINTS_RESULT } from '@/lib/data';

interface Props {
  matches: Match[];
  predictions: PredictionMap;
  onPredict: (matchId: string, home: number, away: number) => void;
}

const STATUS_TABS: { id: MatchStatus; label: string }[] = [
  { id: 'live', label: 'Live' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'finished', label: 'Finished' },
];

export function MatchesView({ matches, predictions, onPredict }: Props) {
  const { now } = useNow();
  const { results, effectiveStatus } = useResults();
  const [status, setStatus] = useState<MatchStatus>('upcoming');
  const [group, setGroup] = useState<string>('all');
  const [country, setCountry] = useState<string>('all');
  const [modalMatch, setModalMatch] = useState<Match | null>(null);

  // Status of every match, recomputed as the clock ticks or results change.
  const statusById = useMemo(() => {
    const map: Record<string, MatchStatus> = {};
    for (const m of matches) map[m.id] = effectiveStatus(m.id, m.kickoff, now);
    return map;
  }, [matches, now, effectiveStatus]);

  const counts = useMemo(() => {
    const c = { live: 0, upcoming: 0, finished: 0 };
    for (const m of matches) c[statusById[m.id]]++;
    return c;
  }, [matches, statusById]);

  const nextKickoff = useMemo(() => getNextKickoff(now), [now]);

  const openMatches = counts.upcoming;
  const picksReady = matches.filter((m) => statusById[m.id] === 'upcoming' && predictions[m.id]).length;

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (statusById[m.id] !== status) return false;
      if (group !== 'all' && m.groupLetter !== group) return false;
      if (country !== 'all' && m.home.code !== country && m.away.code !== country) return false;
      return true;
    });
  }, [matches, statusById, status, group, country]);

  return (
    <div className="space-y-7">
      {/* hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7F1D1D] via-[#B91C1C] to-[#DC2626] px-6 py-8 text-white shadow-[0_12px_40px_rgba(127,29,29,0.3)] sm:px-10 sm:py-10"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#FBBF24] opacity-20 blur-2xl" aria-hidden />
        <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-[#FBBF24]">
          Group Match Finder
        </p>
        <h1 className="mt-1 max-w-2xl font-display text-4xl font-bold uppercase leading-none sm:text-5xl">
          Lock in your scores before kickoff
        </h1>
        <p className="mt-3 max-w-lg text-base text-white/80">
          Browse every 2026 World Cup fixture in Spain time, filter by group or nation, and call the score. Exact
          result = {POINTS_EXACT} pts · right outcome = {POINTS_RESULT} pts.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 font-display text-sm font-medium uppercase tracking-wider backdrop-blur-sm">
            <CalendarClock className="h-4 w-4 text-[#FBBF24]" /> {openMatches} matches open
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FBBF24] px-4 py-2 font-display text-sm font-semibold uppercase tracking-wider text-[#7F1D1D]">
            <CheckCircle2 className="h-4 w-4" /> {picksReady} prediction{picksReady === 1 ? '' : 's'} ready
          </span>
        </div>
      </motion.div>

      {/* live countdown */}
      {nextKickoff && <Countdown match={nextKickoff} />}

      {/* status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => {
          const active = status === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setStatus(t.id)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 font-display text-base font-semibold uppercase tracking-wide transition-colors',
                active
                  ? t.id === 'live'
                    ? 'bg-[#DC2626] text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)]'
                    : 'bg-[#7F1D1D] text-white shadow-[0_4px_14px_rgba(127,29,29,0.3)]'
                  : 'border border-[#EFE3DE] bg-white text-[#6B5D55] hover:bg-[#FCF8F6]',
              )}
            >
              {t.id === 'live' && <Radio className={cn('h-3.5 w-3.5', active && 'animate-pulse')} />}
              {t.label}
              <span
                className={cn(
                  'tnum rounded-full px-2 py-0.5 text-xs font-bold',
                  active ? 'bg-white/20 text-white' : 'bg-[#F1EBE7] text-[#9B8178]',
                )}
              >
                {counts[t.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* group + country filters */}
      <div className="space-y-4 rounded-2xl border border-[#EFE3DE] bg-white p-4">
        <div>
          <p className="mb-2 font-display text-xs font-semibold uppercase tracking-widest text-[#9B8178]">
            Filter by group
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setGroup('all')}
              className={cn(
                'h-9 min-w-[3rem] cursor-pointer rounded-lg px-3 font-display text-sm font-bold uppercase tracking-wide transition-colors',
                group === 'all'
                  ? 'bg-[#DC2626] text-white'
                  : 'border border-[#EFE3DE] bg-[#FCF8F6] text-[#6B5D55] hover:bg-[#FEF2F2]',
              )}
            >
              All
            </button>
            {GROUP_LETTERS.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={cn(
                  'h-9 w-9 cursor-pointer rounded-lg font-display text-base font-bold uppercase transition-colors',
                  group === g
                    ? 'bg-[#DC2626] text-white'
                    : 'border border-[#EFE3DE] bg-[#FCF8F6] text-[#6B5D55] hover:bg-[#FEF2F2]',
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-[#9B8178] sm:w-28">
            Filter by team
          </p>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1897F]" />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-lg border border-[#EFE3DE] bg-[#FCF8F6] py-2.5 pl-9 pr-8 font-body text-sm text-[#2A1512] outline-none transition-colors focus:border-[#DC2626] focus:bg-white"
            >
              <option value="all">All nations</option>
              {ALL_TEAMS.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>
          {(group !== 'all' || country !== 'all') && (
            <button
              onClick={() => {
                setGroup('all');
                setCountry('all');
              }}
              className="cursor-pointer rounded-lg border border-[#EFE3DE] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#6B5D55] transition-colors hover:bg-[#FCF8F6]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B5D55]">
          Showing <span className="font-semibold text-[#2A1512]">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'match' : 'matches'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2D3CD] bg-white py-16 text-center">
          <SearchX className="mb-3 h-10 w-10 text-[#D8C5BE]" />
          <p className="font-display text-xl font-semibold text-[#2A1512]">No matches found</p>
          <p className="mt-1 text-sm text-[#6B5D55]">
            {status === 'live'
              ? 'No matches are being played right now.'
              : status === 'finished'
                ? 'No matches have finished yet.'
                : 'Try a different group, nation, or status filter.'}
          </p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                status={statusById[m.id]}
                result={results[m.id] ?? null}
                prediction={predictions[m.id]}
                nowMs={now}
                onOpen={setModalMatch}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <PredictionModal
        match={modalMatch}
        current={modalMatch ? predictions[modalMatch.id] : undefined}
        status={modalMatch ? statusById[modalMatch.id] : 'upcoming'}
        result={modalMatch ? results[modalMatch.id] ?? null : null}
        onClose={() => setModalMatch(null)}
        onSave={onPredict}
      />
    </div>
  );
}
