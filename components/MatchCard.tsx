'use client';

import { motion } from 'framer-motion';
import { Lock, Radio, Pencil, AlertCircle, CheckCircle2, Users } from 'lucide-react';
import type { Match, MatchStatus, Prediction, Result } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatKickoff, scorePrediction, kickoffBadge, POINTS_EXACT, TZ_LABEL } from '@/lib/data';

interface Props {
  match: Match;
  status: MatchStatus;
  result: Result | null;
  prediction: Prediction | undefined;
  nowMs: number;
  onOpen: (match: Match) => void;
}

export function MatchCard({ match, status, result, prediction, nowMs, onOpen }: Props) {
  const { date, time } = formatKickoff(match.kickoff);
  const locked = status !== 'upcoming';
  const pick = prediction ?? null;
  const hasPick = Boolean(pick);

  const earned = status === 'finished' && result ? scorePrediction(pick, result.home, result.away) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={() => onOpen(match)}
      className={cn(
        'flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(127,29,29,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(127,29,29,0.08)]',
        status === 'live' ? 'border-[#DC2626]' : 'border-[#EFE3DE]',
      )}
    >
      {/* meta strip */}
      <div className="flex items-center justify-between border-b border-[#F4ECE8] bg-[#FCF8F6] px-4 py-2">
        <span className="font-display text-xs font-semibold uppercase tracking-wider text-[#7F1D1D]">
          {match.group} · MD{match.matchday}
        </span>
        {status === 'live' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DC2626] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            <Radio className="h-3 w-3 animate-pulse" /> Live
          </span>
        ) : status === 'finished' ? (
          <span className="rounded-full bg-[#E7E2DC] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6B5D55]">
            Full time
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#92600A]">
            {kickoffBadge(match.kickoff, nowMs)} to go
          </span>
        )}
      </div>

      {/* teams + score */}
      <div className={cn('flex-1 px-4 py-4', status === 'finished' && 'bg-[#FAF8F6]')}>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            <span className="text-2xl leading-none" aria-hidden>
              {match.home.flag}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-lg font-semibold text-[#2A1512]">{match.home.name}</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[#A1897F]">{match.home.code}</p>
            </div>
          </div>

          <div className="shrink-0 px-1">
            {locked && result ? (
              <span
                className={cn(
                  'tnum font-display text-2xl font-bold',
                  status === 'finished' ? 'text-[#6B5D55]' : 'text-[#DC2626]',
                )}
              >
                {result.home} : {result.away}
              </span>
            ) : (
              <span className="font-display text-xl font-semibold text-[#D8C5BE]">vs</span>
            )}
          </div>

          <div className="flex flex-1 justify-end">
            <div className="flex flex-row-reverse items-center gap-2 overflow-hidden">
              <span className="text-2xl leading-none" aria-hidden>
                {match.away.flag}
              </span>
              <div className="min-w-0 text-right leading-tight">
                <p className="truncate font-display text-lg font-semibold text-[#2A1512]">{match.away.name}</p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-[#A1897F]">{match.away.code}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] font-medium uppercase tracking-wider text-[#A1897F]">
          {date} · {time} {TZ_LABEL} · {match.city}
        </p>
      </div>

      {/* footer: status + action */}
      <div className="border-t border-[#F4ECE8] bg-[#FCF8F6] px-4 py-3">
        {locked ? (
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B5D55]">
              <Lock className="h-3.5 w-3.5 text-[#A1897F]" />
              {hasPick ? (
                <>
                  Picked <span className="tnum font-bold text-[#2A1512]">{pick!.home}–{pick!.away}</span>
                </>
              ) : (
                'No pick'
              )}
            </span>
            <span className="flex items-center gap-2">
              {earned !== null && (
                <span
                  className={cn(
                    'tnum inline-flex items-center rounded-full px-2.5 py-0.5 font-display text-xs font-bold uppercase tracking-wide',
                    earned === POINTS_EXACT
                      ? 'bg-[#FBBF24] text-[#7F1D1D]'
                      : earned > 0
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : 'bg-[#FEE2E2] text-[#B91C1C]',
                  )}
                >
                  +{earned} pts
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#A1897F]">
                <Users className="h-3.5 w-3.5" /> Picks
              </span>
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            {hasPick ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
                <CheckCircle2 className="h-4 w-4" /> Picked{' '}
                <span className="tnum rounded bg-[#DCFCE7] px-1.5 py-0.5 font-bold">
                  {pick!.home}–{pick!.away}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C2410C]">
                <AlertCircle className="h-4 w-4" /> Pick required
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen(match);
              }}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#DC2626] px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#B91C1C]"
            >
              <Pencil className="h-3.5 w-3.5" /> {hasPick ? 'Edit' : 'Predict'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
