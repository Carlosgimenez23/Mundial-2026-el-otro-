'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Target, Lock, Check, Save, Search } from 'lucide-react';
import type { BonusPrediction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useNow } from '@/lib/useNow';
import {
  ALL_TEAMS,
  TOP_SCORER_CANDIDATES,
  TOURNAMENT_START_MS,
  POINTS_BONUS_WINNER,
  POINTS_BONUS_SCORER,
  formatKickoff,
  TZ_LABEL,
} from '@/lib/data';

interface Props {
  bonus: BonusPrediction;
  onSave: (bonus: BonusPrediction) => void;
}

export function BonusView({ bonus, onSave }: Props) {
  const { now } = useNow();
  const [winner, setWinner] = useState(bonus.winner);
  const [topScorer, setTopScorer] = useState(bonus.topScorer);
  const [scorerOpen, setScorerOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const locked = now >= TOURNAMENT_START_MS;

  const scorerQuery = topScorer.trim().toLowerCase();
  const scorerSuggestions = (
    scorerQuery
      ? TOP_SCORER_CANDIDATES.filter(
          (c) => c.name.toLowerCase().includes(scorerQuery) || c.teamCode.toLowerCase().includes(scorerQuery),
        )
      : TOP_SCORER_CANDIDATES
  ).slice(0, 6);
  const scorerExact = TOP_SCORER_CANDIDATES.find((c) => c.name.toLowerCase() === scorerQuery);
  const dirty = winner !== bonus.winner || topScorer !== bonus.topScorer;
  const lockInfo = formatKickoff(new Date(TOURNAMENT_START_MS).toISOString());

  const handleSave = () => {
    onSave({ winner, topScorer });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-[#2A1512]">Bonus Predictions</h1>
        <p className="mt-1 max-w-xl text-[#6B5D55]">
          Big-call predictions for the whole tournament. Lock them in before the opening whistle for a huge points
          swing.
        </p>
      </div>

      {locked ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#EFE3DE] bg-[#FCF8F6] px-4 py-3 text-sm text-[#6B5D55]">
          <Lock className="h-4 w-4 text-[#A1897F]" />
          Bonus picks are locked — the tournament has kicked off.
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-[#FEE9C7] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92600A]">
          <Lock className="h-4 w-4" />
          Editable until kickoff of the first match · {lockInfo.date}, {lockInfo.time} {TZ_LABEL}
        </div>
      )}

      {/* Winner */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-2xl border border-[#EFE3DE] bg-white"
      >
        <div className="flex items-center justify-between border-b border-[#F4ECE8] bg-gradient-to-r from-[#7F1D1D] to-[#B91C1C] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBBF24] text-[#7F1D1D]">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">World Cup Winner</h2>
              <p className="text-xs text-white/70">Which nation lifts the trophy?</p>
            </div>
          </div>
          <span className="rounded-full bg-[#FBBF24] px-3 py-1 font-display text-lg font-bold text-[#7F1D1D]">
            +{POINTS_BONUS_WINNER}
          </span>
        </div>

        <div className="p-5">
          <select
            value={winner}
            onChange={(e) => setWinner(e.target.value)}
            disabled={locked}
            className="w-full cursor-pointer appearance-none rounded-xl border border-[#EBD9D4] bg-[#FCF8F6] px-4 py-3 font-body text-base text-[#2A1512] outline-none transition-colors focus:border-[#DC2626] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">— Select a champion —</option>
            {ALL_TEAMS.map((t) => (
              <option key={t.code} value={t.code}>
                {t.name}
              </option>
            ))}
          </select>
          {winner && (
            <p className="mt-3 flex items-center gap-2 font-display text-lg font-semibold text-[#2A1512]">
              <Trophy className="h-5 w-5 text-[#FBBF24]" />
              Your champion:{' '}
              <span aria-hidden>{ALL_TEAMS.find((t) => t.code === winner)?.flag}</span>{' '}
              {ALL_TEAMS.find((t) => t.code === winner)?.name}
            </p>
          )}
        </div>
      </motion.section>

      {/* Top scorer */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="overflow-hidden rounded-2xl border border-[#EFE3DE] bg-white"
      >
        <div className="flex items-center justify-between border-b border-[#F4ECE8] bg-gradient-to-r from-[#7F1D1D] to-[#B91C1C] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBBF24] text-[#7F1D1D]">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">Top Scorer (Pichichi)</h2>
              <p className="text-xs text-white/70">Who wins the Golden Boot?</p>
            </div>
          </div>
          <span className="rounded-full bg-[#FBBF24] px-3 py-1 font-display text-lg font-bold text-[#7F1D1D]">
            +{POINTS_BONUS_SCORER}
          </span>
        </div>

        <div className="p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1897F]" />
            <input
              type="text"
              value={topScorer}
              disabled={locked}
              onChange={(e) => {
                setTopScorer(e.target.value);
                setScorerOpen(true);
              }}
              onFocus={() => setScorerOpen(true)}
              onBlur={() => setTimeout(() => setScorerOpen(false), 120)}
              placeholder="Type any player's name…"
              autoComplete="off"
              className="w-full rounded-xl border border-[#EBD9D4] bg-[#FCF8F6] py-3 pl-9 pr-3 font-body text-base text-[#2A1512] outline-none transition-colors focus:border-[#DC2626] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

            {scorerOpen && !locked && scorerSuggestions.length > 0 && !(scorerExact && scorerSuggestions.length === 1) && (
              <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[#EFE3DE] bg-white py-1 shadow-[0_12px_30px_rgba(127,29,29,0.12)]">
                {scorerSuggestions.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setTopScorer(c.name);
                        setScorerOpen(false);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-[#FCF8F6]"
                    >
                      <span className="text-lg" aria-hidden>{c.flag}</span>
                      <span className="font-body text-sm font-medium text-[#2A1512]">{c.name}</span>
                      <span className="ml-auto text-[11px] font-semibold uppercase tracking-widest text-[#A1897F]">
                        {c.teamCode}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-2 text-xs text-[#A1897F]">
            Pick from the suggestions or type any name — your entry is saved exactly as written.
          </p>

          {topScorer.trim() && (
            <p className="mt-3 flex items-center gap-2 font-display text-lg font-semibold text-[#2A1512]">
              <Target className="h-5 w-5 text-[#DC2626]" />
              Your pick:{scorerExact ? ' ' : ' '}
              {scorerExact && <span aria-hidden>{scorerExact.flag}</span>} {topScorer.trim()}
            </p>
          )}
        </div>
      </motion.section>

      {!locked && (
        <button
          onClick={handleSave}
          disabled={!dirty && !savedFlash}
          className={cn(
            'inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3.5 font-display text-lg font-semibold uppercase tracking-wide text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-colors sm:w-auto sm:px-8',
            savedFlash ? 'bg-[#16A34A]' : 'bg-[#DC2626] hover:bg-[#B91C1C]',
            !dirty && !savedFlash && 'opacity-60',
          )}
        >
          {savedFlash ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
          {savedFlash ? 'Bonus picks saved' : 'Save bonus picks'}
        </button>
      )}
    </div>
  );
}
