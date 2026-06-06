'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Check, Radio, Lock } from 'lucide-react';
import type { Match, MatchStatus, Prediction, Result } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatKickoff, TZ_LABEL, scorePrediction, POINTS_EXACT } from '@/lib/data';
import { UserPredictionsPanel } from '@/components/UserPredictionsPanel';

interface Props {
  match: Match | null;
  current: Prediction | undefined;
  status: MatchStatus;
  result: Result | null;
  onClose: () => void;
  onSave: (matchId: string, home: number, away: number) => void;
}

function Stepper({
  flag,
  name,
  value,
  onChange,
}: {
  flag: string;
  name: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3">
      <span className="text-4xl leading-none" aria-hidden>
        {flag}
      </span>
      <span className="text-center font-display text-lg font-semibold text-[#2A1512]">{name}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`decrease ${name}`}
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#EBD9D4] bg-white text-[#7F1D1D] transition-colors hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-5 w-5" strokeWidth={3} />
        </button>
        <span className="tnum w-10 text-center font-display text-5xl font-bold text-[#7F1D1D]">{value}</span>
        <button
          type="button"
          aria-label={`increase ${name}`}
          disabled={value >= 20}
          onClick={() => onChange(value + 1)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#EBD9D4] bg-white text-[#7F1D1D] transition-colors hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-5 w-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

export function PredictionModal({ match, current, status, result, onClose, onSave }: Props) {
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [savedVersion, setSavedVersion] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (match) {
      setHome(current?.home ?? 0);
      setAway(current?.away ?? 0);
      setJustSaved(false);
    }
  }, [match, current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const editable = status === 'upcoming';
  const earned = match && status === 'finished' && result ? scorePrediction(current, result.home, result.away) : null;

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#2A1512]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-[#F4ECE8] bg-[#FCF8F6] px-5 py-4">
              <div>
                <p className="flex items-center gap-2 font-display text-sm font-medium uppercase tracking-wider text-[#9B8178]">
                  {match.group}
                  {match.matchday > 0 ? ` · MD ${match.matchday}` : ''}
                  {status === 'live' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#DC2626] px-2 py-0.5 text-[9px] font-bold text-white">
                      <Radio className="h-2.5 w-2.5 animate-pulse" /> LIVE
                    </span>
                  )}
                </p>
                <p className="text-xs text-[#A1897F]">
                  {formatKickoff(match.kickoff).date}, {formatKickoff(match.kickoff).time} {TZ_LABEL}
                </p>
              </div>
              <button
                aria-label="close"
                onClick={onClose}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#9B8178] transition-colors hover:bg-[#F1EBE7]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {editable ? (
                <div className="px-5 py-6">
                  <p className="mb-5 text-center font-display text-xl font-bold uppercase tracking-wide text-[#2A1512]">
                    Your prediction
                  </p>
                  <div className="flex items-start gap-3">
                    <Stepper flag={match.home.flag} name={match.home.name} value={home} onChange={setHome} />
                    <span className="self-center pt-12 font-display text-3xl font-bold text-[#D8C5BE]">–</span>
                    <Stepper flag={match.away.flag} name={match.away.name} value={away} onChange={setAway} />
                  </div>
                </div>
              ) : (
                <div className="px-5 py-6">
                  {/* read-only result / locked state */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-4xl leading-none" aria-hidden>{match.home.flag}</span>
                      <span className="text-center font-display text-base font-semibold text-[#2A1512]">
                        {match.home.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      {result ? (
                        <span className="tnum font-display text-4xl font-bold text-[#7F1D1D]">
                          {result.home} : {result.away}
                        </span>
                      ) : (
                        <span className="font-display text-3xl font-semibold text-[#D8C5BE]">vs</span>
                      )}
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#A1897F]">
                        <Lock className="h-3 w-3" /> {status === 'live' ? 'In play' : 'Final'}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-4xl leading-none" aria-hidden>{match.away.flag}</span>
                      <span className="text-center font-display text-base font-semibold text-[#2A1512]">
                        {match.away.name}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#6B5D55]">
                    {current ? (
                      <>
                        Your pick:{' '}
                        <span className="tnum font-display text-base font-bold text-[#2A1512]">
                          {current.home} – {current.away}
                        </span>
                        {earned !== null && (
                          <span
                            className={cn(
                              'tnum rounded-full px-2 py-0.5 font-display text-xs font-bold',
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
                      </>
                    ) : (
                      <span className="italic">You didn&apos;t predict this match.</span>
                    )}
                  </div>
                </div>
              )}

              {/* user predictions panel — remounts on save to refresh */}
              <UserPredictionsPanel key={savedVersion} matchId={match.id} status={status} result={result} />
            </div>

            {/* footer */}
            {editable ? (
              <div className="flex gap-3 border-t border-[#F4ECE8] bg-[#FCF8F6] px-5 py-4">
                <button
                  onClick={onClose}
                  className="flex-1 cursor-pointer rounded-xl border border-[#EBD9D4] bg-white py-3 font-display text-lg font-semibold uppercase tracking-wide text-[#6B5D55] transition-colors hover:bg-[#F1EBE7]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onSave(match.id, home, away);
                    setSavedVersion((v) => v + 1);
                    setJustSaved(true);
                  }}
                  className={cn(
                    'flex flex-[2] cursor-pointer items-center justify-center gap-2 rounded-xl py-3 font-display text-lg font-semibold uppercase tracking-wide text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-colors',
                    justSaved ? 'bg-[#16A34A]' : 'bg-[#DC2626] hover:bg-[#B91C1C]',
                  )}
                >
                  <Check className="h-5 w-5" /> {justSaved ? 'Saved' : `Save ${home} – ${away}`}
                </button>
              </div>
            ) : (
              <div className="border-t border-[#F4ECE8] bg-[#FCF8F6] px-5 py-4">
                <button
                  onClick={onClose}
                  className="w-full cursor-pointer rounded-xl bg-[#7F1D1D] py-3 font-display text-lg font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#641717]"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
