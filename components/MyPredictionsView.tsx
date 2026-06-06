'use client';

import { motion } from 'framer-motion';
import { Target, TrendingUp, Award, ListChecks } from 'lucide-react';
import type { Match, PredictionMap, Prediction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useNow } from '@/lib/useNow';
import { useResults } from '@/lib/results';
import { scorePrediction, formatKickoff, POINTS_EXACT, TZ_LABEL } from '@/lib/data';

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-[#EFE3DE] bg-white p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#DC2626]">
        {icon}
      </div>
      <p className="tnum font-display text-3xl font-bold text-[#2A1512]">{value}</p>
      <p className="text-sm text-[#6B5D55]">{label}</p>
    </div>
  );
}

export function MyPredictionsView({
  matches,
  predictions,
}: {
  matches: Match[];
  predictions: PredictionMap;
}) {
  const { now } = useNow();
  const { results, effectiveStatus } = useResults();

  const rows = matches
    .filter((m) => predictions[m.id]) // only matches the user has predicted
    .map((m) => {
      const pred: Prediction = predictions[m.id];
      const status = effectiveStatus(m.id, m.kickoff, now);
      const result = results[m.id] ?? null;
      const earned = status === 'finished' && result ? scorePrediction(pred, result.home, result.away) : null;
      return { match: m, pred, status, result, earned };
    });

  const totalPoints = rows.reduce((sum, r) => sum + (r.earned ?? 0), 0);
  const exact = rows.filter((r) => r.earned === POINTS_EXACT).length;
  const settled = rows.filter((r) => r.status === 'finished' && r.result).length;
  const made = rows.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-[#2A1512]">My Picks</h1>
        <p className="mt-1 text-[#6B5D55]">Every prediction you&apos;ve made and how it scored.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<Award className="h-5 w-5" />} value={totalPoints} label="Points earned" />
        <Stat icon={<Target className="h-5 w-5" />} value={exact} label="Exact scores" />
        <Stat icon={<ListChecks className="h-5 w-5" />} value={made} label="Picks made" />
        <Stat icon={<TrendingUp className="h-5 w-5" />} value={settled} label="Matches settled" />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E2D3CD] bg-white py-16 text-center">
          <p className="font-display text-xl font-semibold text-[#2A1512]">No predictions yet</p>
          <p className="mt-1 text-sm text-[#6B5D55]">Head to the Matches tab and lock in your first score.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => {
            const { date, time } = formatKickoff(r.match.kickoff);
            return (
              <motion.div
                key={r.match.id}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.2) }}
                className="flex items-center gap-3 rounded-2xl border border-[#EFE3DE] bg-white px-4 py-3"
              >
                <div className="hidden w-24 shrink-0 text-xs font-medium uppercase tracking-wider text-[#A1897F] sm:block">
                  {date}
                  <br />
                  {time} {TZ_LABEL}
                </div>

                <div className="flex flex-1 items-center justify-center gap-2 sm:gap-4">
                  <span className="flex flex-1 items-center justify-end gap-2 font-display text-lg font-semibold text-[#2A1512]">
                    <span className="truncate">{r.match.home.name}</span>
                    <span className="text-xl" aria-hidden>{r.match.home.flag}</span>
                  </span>

                  <div className="flex shrink-0 flex-col items-center">
                    <span className="tnum rounded-lg bg-[#FCF8F6] px-2.5 py-1 font-display text-lg font-bold text-[#7F1D1D]">
                      {r.pred.home} – {r.pred.away}
                    </span>
                    {r.status === 'finished' && r.result && (
                      <span className="tnum mt-0.5 text-[11px] text-[#9B8178]">
                        actual {r.result.home}–{r.result.away}
                      </span>
                    )}
                    {r.status === 'live' && (
                      <span className="mt-0.5 text-[11px] font-semibold uppercase text-[#DC2626]">Live</span>
                    )}
                  </div>

                  <span className="flex flex-1 items-center gap-2 font-display text-lg font-semibold text-[#2A1512]">
                    <span className="text-xl" aria-hidden>{r.match.away.flag}</span>
                    <span className="truncate">{r.match.away.name}</span>
                  </span>
                </div>

                <div className="w-16 shrink-0 text-right">
                  {r.earned !== null ? (
                    <span
                      className={cn(
                        'tnum inline-block rounded-full px-2.5 py-1 font-display text-sm font-bold',
                        r.earned === POINTS_EXACT
                          ? 'bg-[#FBBF24] text-[#7F1D1D]'
                          : r.earned > 0
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : 'bg-[#FEE2E2] text-[#B91C1C]',
                      )}
                    >
                      +{r.earned}
                    </span>
                  ) : (
                    <span className="text-xs font-medium uppercase tracking-wide text-[#C0AAA1]">Pending</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
