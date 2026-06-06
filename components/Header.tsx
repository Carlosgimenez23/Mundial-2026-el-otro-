'use client';

import { motion } from 'framer-motion';
import { Trophy, LogOut, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tab =
  | 'matches'
  | 'bracket'
  | 'bonus'
  | 'leaderboard'
  | 'groups'
  | 'mine'
  | 'account'
  | 'admin'
  | 'rules';

const BASE_TABS: { id: Tab; label: string }[] = [
  { id: 'matches', label: 'Predict' },
  { id: 'bracket', label: 'Bracket' },
  { id: 'bonus', label: 'Bonus' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'groups', label: 'My Groups' },
  { id: 'mine', label: 'My Picks' },
  { id: 'account', label: 'Account' },
  { id: 'rules', label: 'How it works' },
];

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
  username: string;
  color: string;
  isAdmin?: boolean;
  onJoinClick: () => void;
  onLogout: () => void;
}

export function Header({ active, onChange, username, color, isAdmin, onJoinClick, onLogout }: Props) {
  const tabs = isAdmin ? [...BASE_TABS, { id: 'admin' as Tab, label: 'Admin' }] : BASE_TABS;
  return (
    <header className="sticky top-0 z-40 bg-[#7F1D1D] text-white shadow-[0_4px_24px_rgba(127,29,29,0.25)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <button onClick={() => onChange('matches')} className="flex cursor-pointer items-center gap-3 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBBF24] text-[#7F1D1D] shadow-[0_2px_8px_rgba(251,191,36,0.5)]">
            <Trophy className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="font-display text-2xl font-bold uppercase tracking-wide">Kickoff Pool</p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-[#FBBF24]">World Cup 2026</p>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onJoinClick}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#FBBF24] px-3 py-1.5 font-display text-sm font-bold uppercase tracking-wide text-[#7F1D1D] transition-colors hover:bg-[#F59E0B]"
          >
            <KeyRound className="h-4 w-4" />
            <span className="hidden sm:inline">Join</span>
          </button>
          <button
            onClick={() => onChange('account')}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 transition-colors hover:bg-white/20"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {username.slice(0, 2).toUpperCase()}
            </span>
            <span className="hidden max-w-[8rem] truncate font-display text-sm font-semibold sm:block">
              {username}
            </span>
            {isAdmin && (
              <span className="rounded bg-[#FBBF24] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#7F1D1D]">
                Admin
              </span>
            )}
          </button>
          <button
            onClick={onLogout}
            aria-label="Sign out"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="mx-auto max-w-6xl px-2 sm:px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={cn(
                  'relative shrink-0 cursor-pointer px-4 py-3 font-display text-lg uppercase tracking-wide transition-colors duration-200',
                  isActive ? 'text-white' : 'text-white/55 hover:text-white/90',
                )}
              >
                {t.label}
                {isActive && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-x-3 bottom-0 h-1 rounded-full bg-[#FBBF24]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
