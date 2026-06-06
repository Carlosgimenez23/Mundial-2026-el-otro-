'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGroups } from '@/lib/groups';

interface Props {
  open: boolean;
  onClose: () => void;
  onJoined: (groupName: string) => void;
}

type State = 'idle' | 'joining' | 'success' | 'error';

export function JoinByCodeModal({ open, onClose, onJoined }: Props) {
  const { joinByCode } = useGroups();
  const [code, setCode] = useState('');
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCode('');
      setState('idle');
      setMessage('');
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async () => {
    if (state === 'joining' || state === 'success') return;
    const norm = code.trim().toUpperCase();
    if (norm.length < 4) {
      setState('error');
      setMessage('Enter a valid code, e.g. AB1234.');
      return;
    }
    setState('joining');
    const res = await joinByCode(norm);
    if (res.ok && res.group) {
      setState('success');
      setMessage(`You’ve joined ${res.group.name} successfully!`);
      const name = res.group.name;
      window.setTimeout(() => {
        onJoined(name);
        onClose();
      }, 1100);
    } else {
      setState('error');
      setMessage(res.error ?? 'This code does not match any existing group.');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A1512]/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
          >
            <button
              aria-label="close"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center gap-2 bg-gradient-to-br from-[#7F1D1D] to-[#B91C1C] px-6 pb-7 pt-8 text-center text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBBF24] text-[#7F1D1D] shadow-[0_4px_14px_rgba(251,191,36,0.5)]">
                <KeyRound className="h-7 w-7" strokeWidth={2.5} />
              </div>
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide">Join a group</h2>
              <p className="text-sm text-white/75">Enter the code your friend shared with you</p>
            </div>

            <div className="px-6 py-7">
              <input
                ref={inputRef}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
                  if (state === 'error') setState('idle');
                }}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                disabled={state === 'joining' || state === 'success'}
                placeholder="AB1234"
                inputMode="text"
                autoCapitalize="characters"
                aria-label="Group code"
                className={cn(
                  'w-full rounded-2xl border-2 bg-[#FCF8F6] px-4 py-5 text-center font-display text-4xl font-bold uppercase tracking-[0.4em] text-[#2A1512] outline-none transition-colors placeholder:text-[#D8C5BE] placeholder:tracking-[0.4em] focus:bg-white disabled:opacity-70',
                  state === 'error' ? 'border-[#DC2626]' : 'border-[#EBD9D4] focus:border-[#DC2626]',
                )}
              />

              {message && (
                <p
                  className={cn(
                    'mt-3 flex items-center justify-center gap-1.5 text-center text-sm font-medium',
                    state === 'success' ? 'text-[#15803D]' : 'text-[#B91C1C]',
                  )}
                >
                  {state === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {message}
                </p>
              )}

              <button
                onClick={submit}
                disabled={state === 'joining' || state === 'success'}
                className={cn(
                  'mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-4 font-display text-xl font-bold uppercase tracking-wide text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-colors',
                  state === 'success' ? 'bg-[#16A34A]' : 'bg-[#DC2626] hover:bg-[#B91C1C]',
                  state === 'joining' && 'opacity-80',
                )}
              >
                {state === 'joining' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Joining…
                  </>
                ) : state === 'success' ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> Joined!
                  </>
                ) : (
                  'Join Group'
                )}
              </button>

              <p className="mt-3 text-center text-xs text-[#A1897F]">
                Codes are 6 characters and not case-sensitive.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
