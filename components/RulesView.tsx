'use client';

import { motion } from 'framer-motion';
import { Target, CheckCircle2, XCircle, Users, Clock, Trophy, Crown } from 'lucide-react';
import {
  POINTS_EXACT,
  POINTS_RESULT,
  POINTS_WRONG,
  POINTS_BONUS_WINNER,
  POINTS_BONUS_SCORER,
} from '@/lib/data';

const BONUSES = [
  {
    icon: <Crown className="h-6 w-6" />,
    points: POINTS_BONUS_WINNER,
    title: 'World Cup winner',
    desc: 'Predict the nation that lifts the trophy. Set it on the Bonus tab before the opening match.',
  },
  {
    icon: <Target className="h-6 w-6" />,
    points: POINTS_BONUS_SCORER,
    title: 'Top scorer (Pichichi)',
    desc: 'Predict the Golden Boot winner. One huge call for the whole tournament.',
  },
];

const SCORING = [
  {
    icon: <Target className="h-6 w-6" />,
    points: POINTS_EXACT,
    title: 'Exact score',
    desc: 'You predicted the precise final result (e.g. you said 2–1 and it ended 2–1).',
    tone: '#FBBF24',
    bg: '#FFFBEB',
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    points: POINTS_RESULT,
    title: 'Right outcome',
    desc: 'You got the winner (or a draw) right, but not the exact score.',
    tone: '#16A34A',
    bg: '#F0FDF4',
  },
  {
    icon: <XCircle className="h-6 w-6" />,
    points: POINTS_WRONG,
    title: 'Missed it',
    desc: 'Wrong outcome — better luck on the next match.',
    tone: '#DC2626',
    bg: '#FEF2F2',
  },
];

const STEPS = [
  { icon: <Users className="h-5 w-5" />, title: 'Invite your friends', desc: 'Everyone joins the same pool and predicts the same fixtures.' },
  { icon: <Clock className="h-5 w-5" />, title: 'Pick before kickoff', desc: 'Predictions lock the moment a match starts — no late edits.' },
  { icon: <Trophy className="h-5 w-5" />, title: 'Climb the table', desc: 'Points stack up across the tournament. Most points wins.' },
];

export function RulesView() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-[#2A1512]">How it works</h1>
        <p className="mt-1 max-w-xl text-[#6B5D55]">
          A simple prediction game for the whole tournament. Call the scores, rack up points, settle who really knows
          football.
        </p>
      </div>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-wide text-[#2A1512]">Scoring</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {SCORING.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="rounded-2xl border border-[#EFE3DE] bg-white p-5"
            >
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: s.bg, color: s.tone }}
              >
                {s.icon}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold" style={{ color: s.tone }}>
                  +{s.points}
                </span>
                <span className="font-display text-lg font-semibold uppercase tracking-wide text-[#2A1512]">
                  {s.title}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#6B5D55]">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-wide text-[#2A1512]">
          Bonus predictions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {BONUSES.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="flex items-center gap-4 rounded-2xl border border-[#EFE3DE] bg-gradient-to-r from-white to-[#FFFBEB] p-5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7F1D1D] text-[#FBBF24]">
                {b.icon}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-[#7F1D1D]">+{b.points}</span>
                  <span className="font-display text-lg font-semibold uppercase tracking-wide text-[#2A1512]">
                    {b.title}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[#6B5D55]">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-wide text-[#2A1512]">The flow</h2>
        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="flex items-center gap-4 rounded-2xl border border-[#EFE3DE] bg-white px-5 py-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7F1D1D] text-[#FBBF24]">
                {s.icon}
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-[#2A1512]">{s.title}</p>
                <p className="text-sm text-[#6B5D55]">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
