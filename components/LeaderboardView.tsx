'use client';

import { motion } from 'framer-motion';
import { Crown, TrendingUp, TrendingDown, Target, Minus, Users, Settings } from 'lucide-react';
import type { Player } from '@/lib/types';
import type { Group } from '@/lib/groups';
import { cn } from '@/lib/utils';

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name === 'You' ? 'ME' : name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function Trend({ trend }: { trend: Player['trend'] }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-[#16A34A]" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-[#DC2626]" />;
  return <Minus className="h-4 w-4 text-[#C0AAA1]" />;
}

interface LeaderboardProps {
  players: Player[];
  group: Group | null;
  myGroups: Group[];
  onSwitch: (id: string) => void;
  onManageGroups: () => void;
}

export function LeaderboardView({ players, group, myGroups, onSwitch, onManageGroups }: LeaderboardProps) {
  const ranked = [...players].sort((a, b) => b.points - a.points);
  const podium = ranked.slice(0, 3);
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);
  const medal = ['#FBBF24', '#C9C2BC', '#CD7F32'];

  if (!group) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-[#2A1512]">Leaderboard</h1>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2D3CD] bg-white py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-[#D8C5BE]" />
          <p className="font-display text-xl font-semibold text-[#2A1512]">No group yet</p>
          <p className="mt-1 text-sm text-[#6B5D55]">Create or join a league to see its standings.</p>
          <button
            onClick={onManageGroups}
            className="mt-4 cursor-pointer rounded-xl bg-[#DC2626] px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#B91C1C]"
          >
            Go to My Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-[#2A1512]">Leaderboard</h1>
          <p className="mt-1 flex items-center gap-2 text-[#6B5D55]">
            <span className="font-display text-lg font-semibold text-[#7F1D1D]">{group.name}</span>
            <span className="tnum rounded bg-[#F1EBE7] px-1.5 py-0.5 font-display text-xs font-bold tracking-widest text-[#9B8178]">
              {group.code}
            </span>
            <span className="inline-flex items-center gap-1 text-sm">
              <Users className="h-3.5 w-3.5" /> {group.members.length}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {myGroups.length > 1 && (
            <select
              value={group.id}
              onChange={(e) => onSwitch(e.target.value)}
              className="cursor-pointer rounded-lg border border-[#EFE3DE] bg-white px-3 py-2 font-body text-sm text-[#2A1512] outline-none focus:border-[#DC2626]"
            >
              {myGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={onManageGroups}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#EFE3DE] bg-white px-3 py-2 font-display text-sm font-semibold uppercase tracking-wide text-[#6B5D55] transition-colors hover:bg-[#FCF8F6]"
          >
            <Settings className="h-4 w-4" /> Groups
          </button>
        </div>
      </div>

      {/* podium */}
      <div className="grid grid-cols-3 items-end gap-3 sm:gap-5">
        {podiumOrder.map((p) => {
          const rank = ranked.indexOf(p) + 1;
          const heights = { 1: 'h-32 sm:h-40', 2: 'h-24 sm:h-32', 3: 'h-20 sm:h-28' } as const;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: rank * 0.08, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-2">
                <Avatar name={p.name} color={p.avatarColor} />
                {rank === 1 && (
                  <Crown className="absolute -top-4 left-1/2 h-5 w-5 -translate-x-1/2 text-[#FBBF24]" fill="#FBBF24" />
                )}
              </div>
              <p className="font-display text-base font-semibold text-[#2A1512]">{p.name}</p>
              <p className="tnum font-display text-xl font-bold text-[#7F1D1D]">{p.points}</p>
              <div
                className={cn(
                  'mt-2 flex w-full items-start justify-center rounded-t-xl pt-2 font-display text-2xl font-bold text-white',
                  heights[rank as 1 | 2 | 3],
                )}
                style={{ backgroundColor: medal[rank - 1] }}
              >
                {rank}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* full table */}
      <div className="overflow-hidden rounded-2xl border border-[#EFE3DE] bg-white">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#FCF8F6] text-[11px] uppercase tracking-wider text-[#9B8178]">
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Player</th>
              <th className="px-4 py-3 text-center font-semibold">
                <span className="hidden sm:inline">Exact</span>
                <Target className="inline h-4 w-4 sm:hidden" />
              </th>
              <th className="px-4 py-3 text-center font-semibold">Results</th>
              <th className="px-4 py-3 text-right font-semibold">Points</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((p, i) => (
              <tr
                key={p.id}
                className={cn(
                  'border-t border-[#F4ECE8] transition-colors hover:bg-[#FCF8F6]',
                  p.isMe && 'bg-[#FFFBEB] hover:bg-[#FEF3C7]',
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="tnum font-display text-lg font-bold text-[#7F1D1D]">{i + 1}</span>
                    <Trend trend={p.trend} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} color={p.avatarColor} />
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-display text-lg font-semibold text-[#2A1512]">{p.name}</span>
                      {p.isMe && (
                        <span className="rounded bg-[#FBBF24] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7F1D1D]">
                          You
                        </span>
                      )}
                      {p.bonusWinner && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#92600A]">
                          <Crown className="h-3 w-3 text-[#FBBF24]" fill="#FBBF24" /> Champion +300
                        </span>
                      )}
                      {p.bonusScorer && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#B91C1C]">
                          <Target className="h-3 w-3" /> Pichichi +100
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="tnum px-4 py-3 text-center text-[#6B5D55]">{p.exactScores}</td>
                <td className="tnum px-4 py-3 text-center text-[#6B5D55]">{p.correctResults}</td>
                <td className="tnum px-4 py-3 text-right font-display text-xl font-bold text-[#7F1D1D]">{p.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
