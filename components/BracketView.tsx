'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Lock, Pencil, AlertCircle, CheckCircle2, Trophy, ChevronRight, GitMerge } from 'lucide-react';
import type { MatchStatus, PredictionMap } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useNow } from '@/lib/useNow';
import { useResults } from '@/lib/results';
import { PredictionModal } from '@/components/PredictionModal';
import { formatKickoff, kickoffBadge, scorePrediction, POINTS_EXACT, TZ_LABEL } from '@/lib/data';
import {
  KNOCKOUT_MATCHES,
  ROUND_ORDER,
  ROUND_LABELS,
  resolveBracket,
  isGroupStageComplete,
  toModalMatch,
  type KnockoutRound,
  type ResolvedMatch,
} from '@/lib/knockout';

interface Props {
  predictions: PredictionMap;
  onPredict: (matchId: string, home: number, away: number) => void;
}

function SlotRow({
  team,
  ref_,
  isWinner,
  align = 'left',
}: {
  team: { name: string; flag: string; code: string } | null;
  ref_: string;
  isWinner: boolean;
  align?: 'left' | 'right';
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-2 py-1.5',
        isWinner ? 'bg-[#FFFBEB]' : '',
        align === 'right' && 'flex-row-reverse text-right',
      )}
    >
      <span className="text-lg leading-none" aria-hidden>
        {team ? team.flag : '⚽'}
      </span>
      <div className={cn('min-w-0 flex-1', align === 'right' && 'text-right')}>
        <p
          className={cn(
            'truncate font-display text-sm font-semibold',
            team ? 'text-[#2A1512]' : 'text-[#A1897F]',
            isWinner && 'text-[#7F1D1D]',
          )}
        >
          {team ? team.name : 'To be decided'}
        </p>
      </div>
      <span className="shrink-0 rounded bg-[#F1EBE7] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#9B8178]">
        {ref_}
      </span>
    </div>
  );
}

function KnockoutTile({
  resolved,
  status,
  prediction,
  nowMs,
  onOpenPredict,
}: {
  resolved: ResolvedMatch;
  status: MatchStatus;
  prediction: { home: number; away: number } | undefined;
  nowMs: number;
  onOpenPredict: (r: ResolvedMatch) => void;
}) {
  const km = resolved.match;
  const { date, time } = formatKickoff(km.kickoff);
  const locked = status !== 'upcoming';
  const bothResolved = Boolean(resolved.home.team && resolved.away.team);
  const score = resolved.score;
  const earned = status === 'finished' && score ? scorePrediction(prediction, score.home, score.away) : null;

  const homeWin = Boolean(resolved.winner && resolved.home.team && resolved.winner.code === resolved.home.team.code);
  const awayWin = Boolean(resolved.winner && resolved.away.team && resolved.winner.code === resolved.away.team.code);

  return (
    <div
      onClick={bothResolved ? () => onOpenPredict(resolved) : undefined}
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-xl border bg-white',
        status === 'live' ? 'border-[#DC2626]' : 'border-[#EFE3DE]',
        bothResolved && 'cursor-pointer',
      )}
    >
      <div className="flex items-center justify-between border-b border-[#F4ECE8] bg-[#FCF8F6] px-3 py-1.5">
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-[#7F1D1D]">
          Match {km.n}
        </span>
        {status === 'live' ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#DC2626] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            <Radio className="h-2.5 w-2.5 animate-pulse" /> Live
          </span>
        ) : status === 'finished' ? (
          <span className="rounded-full bg-[#E7E2DC] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#6B5D55]">
            Finished
          </span>
        ) : (
          <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#92600A]">
            {kickoffBadge(km.kickoff, nowMs)}
          </span>
        )}
      </div>

      <div className="space-y-1 px-2 py-2">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SlotRow team={resolved.home.team} ref_={resolved.home.ref} isWinner={homeWin} />
          </div>
          {locked && score && (
            <span className={cn('tnum w-5 text-center font-display text-base font-bold', homeWin ? 'text-[#7F1D1D]' : 'text-[#6B5D55]')}>
              {score.home}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SlotRow team={resolved.away.team} ref_={resolved.away.ref} isWinner={awayWin} />
          </div>
          {locked && score && (
            <span className={cn('tnum w-5 text-center font-display text-base font-bold', awayWin ? 'text-[#7F1D1D]' : 'text-[#6B5D55]')}>
              {score.away}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[#F4ECE8] bg-[#FCF8F6] px-3 py-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#A1897F]">
          {date} · {time} {TZ_LABEL}
        </span>

        {locked ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6B5D55]">
            {prediction ? (
              <>
                <Lock className="h-3 w-3 text-[#A1897F]" />
                <span className="tnum">{prediction.home}–{prediction.away}</span>
                {earned !== null && (
                  <span
                    className={cn(
                      'tnum rounded-full px-1.5 py-0.5 font-bold',
                      earned === POINTS_EXACT
                        ? 'bg-[#FBBF24] text-[#7F1D1D]'
                        : earned > 0
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : 'bg-[#FEE2E2] text-[#B91C1C]',
                    )}
                  >
                    +{earned}
                  </span>
                )}
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 text-[#A1897F]" /> No pick
              </>
            )}
          </span>
        ) : bothResolved ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPredict(resolved);
            }}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-[#DC2626] px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#B91C1C]"
          >
            {prediction ? (
              <>
                <CheckCircle2 className="h-3 w-3" /> {prediction.home}–{prediction.away}
              </>
            ) : (
              <>
                <Pencil className="h-3 w-3" /> Predict
              </>
            )}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#C2410C]">
            <AlertCircle className="h-3 w-3" /> Awaiting teams
          </span>
        )}
      </div>
    </div>
  );
}

export function BracketView({ predictions, onPredict }: Props) {
  const { now } = useNow();
  const { results, effectiveStatus } = useResults();
  const [modal, setModal] = useState<ResolvedMatch | null>(null);

  const bracket = useMemo(() => resolveBracket(results), [results]);
  const groupComplete = useMemo(() => isGroupStageComplete(results), [results]);

  const byRound = (round: KnockoutRound) =>
    KNOCKOUT_MATCHES.filter((m) => m.round === round).map((m) => bracket[m.n]);

  const modalMatch = modal ? toModalMatch(modal) : null;

  // Columns: R32, R16, QF, SF, then a final column with Final + Third place.
  const columns: { round: KnockoutRound; rounds?: KnockoutRound[] }[] = [
    { round: 'R32' },
    { round: 'R16' },
    { round: 'QF' },
    { round: 'SF' },
    { round: 'F', rounds: ['F', '3P'] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-[#2A1512]">Knockout Bracket</h1>
        <p className="mt-1 max-w-2xl text-[#6B5D55]">
          The official 2026 path — Round of 32 to the Final. Slots fill automatically from the final group standings,
          and winners advance as each tie finishes. Predict any tie once its teams are set.
        </p>
      </div>

      {!groupComplete && (
        <div className="flex items-start gap-2 rounded-xl border border-[#FEE9C7] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92600A]">
          <GitMerge className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            The bracket populates automatically when the group stage ends (winners, runners-up and the 8 best
            third-placed teams). Until then, ties show their qualification slots (e.g. <strong>1A</strong>,{' '}
            <strong>2B</strong>, <strong>3rd A/B/C/D/F</strong>).
          </span>
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4">
          {columns.map((col) => (
            <div key={col.round} className="w-[16rem] shrink-0 space-y-3">
              {(col.rounds ?? [col.round]).map((r) => (
                <div key={r} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-bold uppercase tracking-wide text-[#7F1D1D]">
                      {ROUND_LABELS[r]}
                    </h2>
                    {r === 'F' && <Trophy className="h-4 w-4 text-[#FBBF24]" />}
                    <span className="text-xs text-[#A1897F]">
                      ({KNOCKOUT_MATCHES.filter((m) => m.round === r).length})
                    </span>
                  </div>
                  {byRound(r).map((resolved) => (
                    <motion.div
                      key={resolved.match.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={cn(r === 'F' && 'rounded-xl ring-2 ring-[#FBBF24]')}
                    >
                      <KnockoutTile
                        resolved={resolved}
                        status={effectiveStatus(resolved.match.id, resolved.match.kickoff, now)}
                        prediction={predictions[resolved.match.id]}
                        nowMs={now}
                        onOpenPredict={setModal}
                      />
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-[#A1897F]">
        <ChevronRight className="h-3.5 w-3.5" /> Scroll horizontally to follow the path to the Final. Knockout
        predictions use the same +5 / +2 scoring and count toward the leaderboard.
      </p>

      <PredictionModal
        match={modalMatch}
        current={modalMatch ? predictions[modalMatch.id] : undefined}
        status={modal ? effectiveStatus(modal.match.id, modal.match.kickoff, now) : 'upcoming'}
        result={modal ? modal.score : null}
        onClose={() => setModal(null)}
        onSave={onPredict}
      />
    </div>
  );
}
