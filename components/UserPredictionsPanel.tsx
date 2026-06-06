'use client';

import { useEffect, useState } from 'react';
import { Users, Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import type { MatchStatus, Result } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { scorePrediction, POINTS_EXACT } from '@/lib/data';

interface Props {
  matchId: string;
  status: MatchStatus;
  result: Result | null;
}

interface ApiRow {
  username: string;
  color: string;
  home: number;
  away: number;
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function UserPredictionsPanel({ matchId, status, result }: Props) {
  const { user } = useAuth();
  const [reveal, setReveal] = useState(false);
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/predictions?matchId=${encodeURIComponent(matchId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (active) setRows(d.predictions ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [matchId]);

  const locked = status !== 'upcoming';
  const hideOthers = !locked && !reveal; // pre-match privacy toggle

  const enriched = rows
    .map((r) => ({
      ...r,
      isMe: user ? r.username.toLowerCase() === user.username.toLowerCase() : false,
      earned: status === 'finished' && result ? scorePrediction({ home: r.home, away: r.away }, result.home, result.away) : null,
    }))
    .sort((a, b) => {
      if (a.earned !== null && b.earned !== null && a.earned !== b.earned) return b.earned - a.earned;
      return a.username.localeCompare(b.username);
    });

  return (
    <div className="border-t border-[#F4ECE8] bg-white px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-[#2A1512]">
          <Users className="h-4 w-4 text-[#DC2626]" /> User Predictions
          <span className="tnum rounded-full bg-[#F1EBE7] px-2 py-0.5 text-xs font-bold text-[#9B8178]">
            {enriched.length}
          </span>
        </h3>
        {!locked && enriched.length > 0 && (
          <button
            onClick={() => setReveal((r) => !r)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#EBD9D4] bg-[#FCF8F6] px-2.5 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-[#6B5D55] transition-colors hover:bg-[#FEF2F2]"
          >
            {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {reveal ? 'Hide picks' : 'Reveal picks'}
          </button>
        )}
      </div>

      {loading ? (
        <p className="flex items-center justify-center gap-2 py-6 text-sm text-[#6B5D55]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading predictions…
        </p>
      ) : enriched.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#E2D3CD] bg-[#FCF8F6] py-6 text-center text-sm text-[#6B5D55]">
          No predictions submitted yet for this match.
        </p>
      ) : (
        <ul className="max-h-60 space-y-1.5 overflow-auto pr-1">
          {enriched.map((r) => {
            const masked = hideOthers && !r.isMe;
            return (
              <li
                key={r.username}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2',
                  r.isMe ? 'bg-[#FFFBEB]' : 'bg-[#FCF8F6]',
                )}
              >
                <Avatar name={r.username} color={r.color} />
                <span className="flex-1 truncate font-display text-base font-semibold text-[#2A1512]">
                  {r.username}
                  {r.isMe && (
                    <span className="ml-2 rounded bg-[#FBBF24] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#7F1D1D]">
                      You
                    </span>
                  )}
                </span>

                {masked ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-[#A1897F]">
                    <Lock className="h-3 w-3" /> Hidden
                  </span>
                ) : (
                  <span className="tnum rounded-lg bg-white px-2.5 py-1 font-display text-lg font-bold text-[#7F1D1D]">
                    {r.home} – {r.away}
                  </span>
                )}

                {r.earned !== null && !masked && (
                  <span
                    className={cn(
                      'tnum w-11 shrink-0 rounded-full px-2 py-1 text-center font-display text-xs font-bold',
                      r.earned === POINTS_EXACT
                        ? 'bg-[#FBBF24] text-[#7F1D1D]'
                        : r.earned > 0
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : 'bg-[#FEE2E2] text-[#B91C1C]',
                    )}
                  >
                    +{r.earned}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {hideOthers && enriched.length > 1 && (
        <p className="mt-2 text-center text-[11px] text-[#A1897F]">
          Others&apos; picks are hidden until kickoff — tap “Reveal picks” to compare.
        </p>
      )}
    </div>
  );
}
