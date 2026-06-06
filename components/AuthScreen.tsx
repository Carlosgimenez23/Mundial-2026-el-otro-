'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Trophy, User, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { POOL_NAME } from '@/lib/data';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = mode === 'login' ? await login(username, password) : await register(username, password);
    setBusy(false);
    if (!res.ok) setError(res.error ?? 'Something went wrong.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#7F1D1D] via-[#B91C1C] to-[#DC2626] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
      >
        <div className="flex flex-col items-center gap-2 bg-[#7F1D1D] px-6 py-8 text-center text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBBF24] text-[#7F1D1D] shadow-[0_4px_14px_rgba(251,191,36,0.5)]">
            <Trophy className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Kickoff Pool</h1>
          <p className="text-sm text-white/70">{POOL_NAME} · World Cup 2026 Predictions</p>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-7">
          <p className="text-center font-display text-xl font-semibold text-[#2A1512]">
            {mode === 'login' ? 'Sign in to play' : 'Create your account'}
          </p>

          <div>
            <label className="mb-1 block font-display text-xs font-semibold uppercase tracking-widest text-[#9B8178]">
              Username
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1897F]" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="e.g. carlos10"
                className="w-full rounded-xl border border-[#EBD9D4] bg-[#FCF8F6] py-2.5 pl-9 pr-3 text-sm text-[#2A1512] outline-none transition-colors focus:border-[#DC2626] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-display text-xs font-semibold uppercase tracking-widest text-[#9B8178]">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1897F]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#EBD9D4] bg-[#FCF8F6] py-2.5 pl-9 pr-3 text-sm text-[#2A1512] outline-none transition-colors focus:border-[#DC2626] focus:bg-white"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-[#FEE2E2] px-3 py-2 text-sm font-medium text-[#B91C1C]">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#DC2626] py-3 font-display text-lg font-semibold uppercase tracking-wide text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-colors hover:bg-[#B91C1C] disabled:opacity-60"
          >
            {busy && <Loader2 className="h-5 w-5 animate-spin" />}
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          <p className="text-center text-sm text-[#6B5D55]">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="cursor-pointer font-semibold text-[#DC2626] hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <p className="text-center text-[11px] leading-relaxed text-[#A1897F]">
            Just a username and password — no email needed. Your password is hashed, never stored as plain text.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
