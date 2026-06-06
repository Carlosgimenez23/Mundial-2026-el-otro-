'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, RefreshCw, Trash2, ShieldAlert, UserCircle, Users, Trophy } from 'lucide-react';

interface Props {
  username: string;
  isAdmin: boolean;
  groupCount: number;
  onRecalculate: () => void;
  onReset: () => void;
  onManageGroups: () => void;
}

export function AccountView({ username, isAdmin, groupCount, onRecalculate, onReset, onManageGroups }: Props) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [recalcDone, setRecalcDone] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-[#2A1512]">Account</h1>
        <p className="mt-1 text-[#6B5D55]">
          Signed in as <span className="font-semibold text-[#2A1512]">{username}</span>.
        </p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="rounded-2xl border border-[#EFE3DE] bg-white p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#DC2626]">
              <UserCircle className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-[#2A1512]">Profile</h2>
          </div>
          <p className="text-sm text-[#6B5D55]">
            Username: <span className="font-semibold text-[#2A1512]">{username}</span>
          </p>
          <p className="mt-1 text-sm text-[#6B5D55]">
            Saved permanently in the database — your account and groups persist across sessions and devices.
          </p>
        </div>

        <div className="rounded-2xl border border-[#EFE3DE] bg-white p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#92600A]">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-[#2A1512]">Your leagues</h2>
          </div>
          <p className="text-sm text-[#6B5D55]">
            You belong to <span className="font-semibold text-[#2A1512]">{groupCount}</span> group
            {groupCount === 1 ? '' : 's'}.
          </p>
          <button
            onClick={onManageGroups}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#B91C1C]"
          >
            <Trophy className="h-4 w-4" /> Manage groups
          </button>
        </div>
      </motion.section>

      {isAdmin && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-2xl border border-[#EFE3DE] bg-white p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#92600A]">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-[#2A1512]">Admin tools</h2>
              <p className="text-sm text-[#6B5D55]">Keep standings in sync across all players.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#EFE3DE] bg-[#FCF8F6] p-4">
              <div>
                <p className="font-display text-lg font-semibold text-[#2A1512]">Recalculate leaderboard</p>
                <p className="text-sm text-[#6B5D55]">Re-score everyone from the latest results.</p>
              </div>
              <button
                onClick={() => {
                  onRecalculate();
                  setRecalcDone(true);
                  setTimeout(() => setRecalcDone(false), 1800);
                }}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#7F1D1D] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#641717]"
              >
                {recalcDone ? <Check className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                {recalcDone ? 'Updated' : 'Recalculate'}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#F3C9C0] bg-[#FEF2F2] p-4">
              <div>
                <p className="font-display text-lg font-semibold text-[#B91C1C]">Reset tournament data</p>
                <p className="text-sm text-[#B05A4E]">Clears all predictions and results for a fresh start.</p>
              </div>
              {confirmReset ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="cursor-pointer rounded-xl border border-[#EBD9D4] bg-white px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#6B5D55] transition-colors hover:bg-[#FCF8F6]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onReset();
                      setConfirmReset(false);
                    }}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#B91C1C]"
                  >
                    <Trash2 className="h-4 w-4" /> Confirm reset
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#DC2626] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
                >
                  <Trash2 className="h-4 w-4" /> Reset
                </button>
              )}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
