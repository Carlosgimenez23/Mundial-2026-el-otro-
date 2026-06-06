'use client';

import { Timer, Clock } from 'lucide-react';
import type { Match } from '@/lib/types';
import { useNow } from '@/lib/useNow';
import { formatClock, formatKickoff, TZ_LABEL } from '@/lib/data';

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="tnum min-w-[2.5ch] rounded-lg bg-white/15 px-2 py-1 text-center font-display text-3xl font-bold leading-none text-white sm:text-4xl">
        {pad(value)}
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-white/60">{label}</span>
    </div>
  );
}

export function Countdown({ match }: { match: Match }) {
  const { now, mounted } = useNow();
  const { time } = formatKickoff(match.kickoff);

  const remaining = Math.max(0, Math.floor((Date.parse(match.kickoff) - now) / 1000));
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-[#7F1D1D] to-[#B91C1C] px-5 py-4 text-white shadow-[0_8px_30px_rgba(127,29,29,0.25)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBBF24] text-[#7F1D1D]">
          <Timer className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#FBBF24]">Next kickoff</p>
          <p className="font-display text-xl font-semibold">
            <span aria-hidden>{match.home.flag}</span> {match.home.code} vs {match.away.code}{' '}
            <span aria-hidden>{match.away.flag}</span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white/60">
            <Clock className="h-3 w-3" />
            <span className="tnum" suppressHydrationWarning>
              {mounted ? `${formatClock(now)} ${TZ_LABEL}` : `${time} ${TZ_LABEL}`}
            </span>
            · {match.group}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3" suppressHydrationWarning>
        <Unit value={days} label="Days" />
        <span className="font-display text-2xl text-white/30">:</span>
        <Unit value={hours} label="Hrs" />
        <span className="font-display text-2xl text-white/30">:</span>
        <Unit value={minutes} label="Min" />
        <span className="font-display text-2xl text-white/30">:</span>
        <Unit value={secs} label="Sec" />
      </div>
    </div>
  );
}
