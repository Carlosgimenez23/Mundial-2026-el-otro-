'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Save, CheckCircle2, Loader2, PartyPopper } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ResultsProvider, useResults } from '@/lib/results';
import { GroupsProvider, useGroups } from '@/lib/groups';
import { AuthScreen } from '@/components/AuthScreen';
import { Header, type Tab } from '@/components/Header';
import { MatchesView } from '@/components/MatchesView';
import { BracketView } from '@/components/BracketView';
import { BonusView } from '@/components/BonusView';
import { LeaderboardView } from '@/components/LeaderboardView';
import { GroupsView } from '@/components/GroupsView';
import { MyPredictionsView } from '@/components/MyPredictionsView';
import { AccountView } from '@/components/AccountView';
import { AdminPanel } from '@/components/AdminPanel';
import { JoinByCodeModal } from '@/components/JoinByCodeModal';
import { RulesView } from '@/components/RulesView';
import { MATCHES } from '@/lib/data';
import type { BonusPrediction, Player, PredictionMap } from '@/lib/types';

function AppShell() {
  const { user, ready, logout } = useAuth();
  const { ready: resultsReady } = useResults();
  const { ready: groupsReady, groups, activeGroupId, setActiveGroup, joinByCode } = useGroups();

  const [tab, setTab] = useState<Tab>('matches');
  const [predictions, setPredictions] = useState<PredictionMap>({});
  const [bonus, setBonus] = useState<BonusPrediction>({ winner: '', topScorer: '' });
  const [players, setPlayers] = useState<Player[]>([]);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [joinOpen, setJoinOpen] = useState(false);

  // Load this user's predictions + bonus from the database when they sign in.
  useEffect(() => {
    if (!user) {
      setPredictions({});
      setBonus({ winner: '', topScorer: '' });
      return;
    }
    setTab('matches');
    fetch('/api/predictions')
      .then((r) => r.json())
      .then((d) => setPredictions(d.predictions ?? {}))
      .catch(() => {});
    fetch('/api/bonus')
      .then((r) => r.json())
      .then((d) => setBonus(d.bonus ?? { winner: '', topScorer: '' }))
      .catch(() => {});
  }, [user]);

  // Pending invite-link join after authentication.
  useEffect(() => {
    if (!user || !groupsReady) return;
    let pending: string | null = null;
    try {
      pending = localStorage.getItem('wc_pending_join');
    } catch {
      /* ignore */
    }
    if (pending) {
      try {
        localStorage.removeItem('wc_pending_join');
      } catch {
        /* ignore */
      }
      joinByCode(pending).then((res) => {
        if (res.ok && res.group) {
          setToast(`You've joined ${res.group.name} successfully!`);
          setTab('leaderboard');
        } else if (res.error) {
          setToast(res.error);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, groupsReady]);

  // Fetch the active group's leaderboard.
  const loadLeaderboard = useCallback(async () => {
    if (!activeGroupId) {
      setPlayers([]);
      return;
    }
    try {
      const res = await fetch(`/api/leaderboard?groupId=${activeGroupId}`);
      const data = await res.json();
      setPlayers(data.players ?? []);
    } catch {
      /* keep */
    }
  }, [activeGroupId]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard, predictions, bonus]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  if (!ready || (user && (!resultsReady || !groupsReady))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#7F1D1D] text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;

  const handlePredict = (matchId: string, home: number, away: number) => {
    setPredictions((prev) => ({ ...prev, [matchId]: { home, away } }));
    setSaved(false);
    fetch('/api/predictions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, home, away }),
    })
      .then(() => loadLeaderboard())
      .catch(() => {});
  };

  const handleBonusSave = (next: BonusPrediction) => {
    setBonus(next);
    fetch('/api/bonus', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    }).catch(() => {});
  };

  const handleReset = () => {
    fetch('/api/admin/reset', { method: 'POST' })
      .then(() => {
        setPredictions({});
        setBonus({ winner: '', topScorer: '' });
        loadLeaderboard();
        setToast('Tournament data reset.');
      })
      .catch(() => {});
  };

  const pendingCount = Object.keys(predictions).length;

  return (
    <div className="min-h-screen bg-[#FBF7F4] pb-28">
      <Header
        active={tab}
        onChange={setTab}
        username={user.username}
        color={user.color}
        isAdmin={user.isAdmin}
        onJoinClick={() => setJoinOpen(true)}
        onLogout={logout}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed left-1/2 top-20 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-2 rounded-full bg-[#16A34A] px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white shadow-[0_8px_24px_rgba(22,163,74,0.35)]">
              <PartyPopper className="h-4 w-4" /> {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {tab === 'matches' && (
              <MatchesView matches={MATCHES} predictions={predictions} onPredict={handlePredict} />
            )}
            {tab === 'bracket' && <BracketView predictions={predictions} onPredict={handlePredict} />}
            {tab === 'bonus' && <BonusView bonus={bonus} onSave={handleBonusSave} />}
            {tab === 'leaderboard' && (
              <LeaderboardView
                players={players}
                group={activeGroup}
                myGroups={groups}
                onSwitch={setActiveGroup}
                onManageGroups={() => setTab('groups')}
              />
            )}
            {tab === 'groups' && (
              <GroupsView onViewLeaderboard={() => setTab('leaderboard')} onJoinClick={() => setJoinOpen(true)} />
            )}
            {tab === 'mine' && <MyPredictionsView matches={MATCHES} predictions={predictions} />}
            {tab === 'account' && (
              <AccountView
                username={user.username}
                isAdmin={user.isAdmin}
                groupCount={groups.length}
                onRecalculate={loadLeaderboard}
                onReset={handleReset}
                onManageGroups={() => setTab('groups')}
              />
            )}
            {tab === 'admin' && user.isAdmin && <AdminPanel />}
            {tab === 'rules' && <RulesView />}
          </motion.div>
        </AnimatePresence>
      </main>

      <JoinByCodeModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoined={(name) => {
          setToast(`You've joined ${name} successfully!`);
          setTab('leaderboard');
        }}
      />

      <AnimatePresence>
        {tab === 'matches' && pendingCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-[#EFE3DE] bg-white/95 backdrop-blur-sm"
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <p className="text-sm text-[#6B5D55]">
                <span className="font-display text-xl font-bold text-[#7F1D1D]">{pendingCount}</span>{' '}
                {pendingCount === 1 ? 'prediction' : 'predictions'} saved
              </p>
              <button
                onClick={() => setSaved(true)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#DC2626] px-5 py-2.5 font-display text-lg font-semibold uppercase tracking-wide text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)] transition-colors hover:bg-[#B91C1C]"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> All saved
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" /> Confirm picks
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <ResultsProvider>
        <GroupsProvider>
          <AppShell />
        </GroupsProvider>
      </ResultsProvider>
    </AuthProvider>
  );
}
