'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  LogIn,
  KeyRound,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Power,
  Trophy,
  Crown,
  Trash2,
  Pencil,
  UserMinus,
  DoorOpen,
} from 'lucide-react';
import { cn, copyToClipboard } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useGroups, type Group } from '@/lib/groups';
import type { Player } from '@/lib/types';

interface Props {
  onViewLeaderboard: () => void;
  onJoinClick: () => void;
}

export function GroupsView({ onViewLeaderboard, onJoinClick }: Props) {
  const { user } = useAuth();
  const {
    groups,
    activeGroupId,
    setActiveGroup,
    createGroup,
    leaveGroup,
    renameGroup,
    regenerateCode,
    setLinkEnabled,
    removeMember,
    deleteGroup,
  } = useGroups();

  const username = user!.username;

  const [selectedId, setSelectedId] = useState<string | null>(activeGroupId);
  const [newName, setNewName] = useState('');
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [renaming, setRenaming] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [standings, setStandings] = useState<Player[]>([]);

  useEffect(() => {
    if ((!selectedId || !groups.some((g) => g.id === selectedId)) && groups.length) setSelectedId(groups[0].id);
  }, [groups, selectedId]);

  const selected = groups.find((g) => g.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) {
      setStandings([]);
      return;
    }
    let active = true;
    fetch(`/api/leaderboard?groupId=${selected.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (active) setStandings(d.players ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [selected, groups]);

  const flash = (kind: 'ok' | 'err', msg: string) => {
    setFeedback({ kind, msg });
    setTimeout(() => setFeedback(null), 2800);
  };

  const handleCreate = async () => {
    if (newName.trim().length < 2) return flash('err', 'Enter a group name (min 2 characters).');
    const res = await createGroup(newName);
    if (res.ok && res.group) {
      setNewName('');
      setSelectedId(res.group.id);
      flash('ok', `Created “${res.group.name}” — code ${res.group.code}`);
    } else {
      flash('err', res.error ?? 'Could not create group.');
    }
  };

  const inviteLink = (g: Group) =>
    typeof window !== 'undefined' ? `${window.location.origin}/join/${g.code}` : `/join/${g.code}`;

  const copy = (value: string, key: string) => {
    void copyToClipboard(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const share = async (g: Group) => {
    const url = inviteLink(g);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `Join ${g.name} on Kickoff Pool`, text: 'Join my World Cup pool!', url });
        return;
      } catch {
        /* fall through */
      }
    }
    copy(url, 'share');
  };

  const isAdmin = selected ? selected.adminUsername.toLowerCase() === username.toLowerCase() : false;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-[#2A1512]">My Groups</h1>
        <p className="mt-1 text-[#6B5D55]">
          Create private leagues or join your friends with a code or invite link. Everything is saved to your account.
        </p>
      </div>

      {feedback && (
        <div
          className={cn(
            'rounded-xl px-4 py-3 text-sm font-medium',
            feedback.kind === 'ok' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]',
          )}
        >
          {feedback.msg}
        </div>
      )}

      {/* create / join */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#EFE3DE] bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#DC2626]">
              <Plus className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-[#2A1512]">Create a group</h2>
          </div>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Friends League"
              className="flex-1 rounded-xl border border-[#EBD9D4] bg-[#FCF8F6] px-3 py-2.5 text-sm text-[#2A1512] outline-none focus:border-[#DC2626] focus:bg-white"
            />
            <button
              onClick={handleCreate}
              className="cursor-pointer rounded-xl bg-[#DC2626] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#B91C1C]"
            >
              Create
            </button>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-[#EFE3DE] bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#92600A]">
              <LogIn className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-[#2A1512]">
              Enter group code to join
            </h2>
          </div>
          <p className="mb-3 flex-1 text-sm text-[#6B5D55]">
            Got a code from a friend? Enter it to jump straight into their league.
          </p>
          <button
            onClick={onJoinClick}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7F1D1D] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#641717]"
          >
            <KeyRound className="h-4 w-4" /> Join by code
          </button>
        </div>
      </div>

      {/* my groups list */}
      <section>
        <h2 className="mb-3 font-display text-2xl font-bold uppercase tracking-wide text-[#2A1512]">
          Your leagues <span className="text-base text-[#A1897F]">({groups.length})</span>
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedId(g.id)}
              className={cn(
                'cursor-pointer rounded-2xl border bg-white p-4 text-left transition-shadow hover:shadow-[0_8px_24px_rgba(127,29,29,0.08)]',
                selectedId === g.id ? 'border-[#DC2626]' : 'border-[#EFE3DE]',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold text-[#2A1512]">{g.name}</span>
                {g.adminUsername.toLowerCase() === username.toLowerCase() && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#92600A]">
                    <Crown className="h-3 w-3 text-[#FBBF24]" /> Admin
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-2 text-sm text-[#6B5D55]">
                <span className="tnum rounded bg-[#F1EBE7] px-1.5 py-0.5 font-display font-bold tracking-widest text-[#7F1D1D]">
                  {g.code}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {g.members.length}
                </span>
                {activeGroupId === g.id && <span className="text-[11px] font-semibold uppercase text-[#16A34A]">Active</span>}
              </p>
            </button>
          ))}
          {groups.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-[#E2D3CD] bg-white py-8 text-center text-sm text-[#6B5D55]">
              You&apos;re not in any group yet. Create one or join with a code above.
            </p>
          )}
        </div>
      </section>

      {/* selected group detail */}
      {selected && (
        <motion.section
          key={selected.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5 rounded-2xl border border-[#EFE3DE] bg-white p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7F1D1D] text-[#FBBF24]">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-[#2A1512]">
                  {selected.name}
                </h2>
                <p className="text-sm text-[#6B5D55]">{selected.members.length} members</p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveGroup(selected.id);
                onViewLeaderboard();
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#B91C1C]"
            >
              <Trophy className="h-4 w-4" /> View leaderboard
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#EFE3DE] bg-[#FCF8F6] p-4">
              <p className="font-display text-xs font-semibold uppercase tracking-widest text-[#9B8178]">Join code</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="font-display text-3xl font-bold tracking-[0.2em] text-[#7F1D1D]">{selected.code}</span>
                <button
                  onClick={() => copy(selected.code, 'code')}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#EBD9D4] bg-white px-3 py-2 font-display text-sm font-semibold uppercase tracking-wide text-[#6B5D55] transition-colors hover:bg-[#FEF2F2]"
                >
                  {copied === 'code' ? <Check className="h-4 w-4 text-[#16A34A]" /> : <Copy className="h-4 w-4" />}
                  {copied === 'code' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#EFE3DE] bg-[#FCF8F6] p-4">
              <p className="flex items-center justify-between font-display text-xs font-semibold uppercase tracking-widest text-[#9B8178]">
                Invite link
                {!selected.linkEnabled && <span className="text-[#B91C1C]">Disabled</span>}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="truncate text-sm text-[#6B5D55]">{inviteLink(selected)}</span>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => copy(inviteLink(selected), 'link')}
                    disabled={!selected.linkEnabled}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#EBD9D4] bg-white px-2.5 py-2 text-[#6B5D55] transition-colors hover:bg-[#FEF2F2] disabled:opacity-40"
                  >
                    {copied === 'link' ? <Check className="h-4 w-4 text-[#16A34A]" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => share(selected)}
                    disabled={!selected.linkEnabled}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#DC2626] px-2.5 py-2 text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-40"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* standings */}
          <div>
            <p className="mb-2 font-display text-sm font-semibold uppercase tracking-widest text-[#9B8178]">Standings</p>
            <div className="overflow-hidden rounded-xl border border-[#EFE3DE]">
              {standings.length === 0 && (
                <p className="px-3 py-4 text-center text-sm text-[#6B5D55]">No members with picks yet.</p>
              )}
              {standings.map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center gap-3 border-b border-[#F4ECE8] px-3 py-2 last:border-0',
                    p.isMe && 'bg-[#FFFBEB]',
                  )}
                >
                  <span className="tnum w-6 font-display text-base font-bold text-[#7F1D1D]">{i + 1}</span>
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full font-display text-[11px] font-bold text-white"
                    style={{ backgroundColor: p.avatarColor }}
                  >
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="flex-1 truncate font-display text-base font-semibold text-[#2A1512]">
                    {p.name}
                    {selected.adminUsername.toLowerCase() === p.name.toLowerCase() && (
                      <Crown className="ml-1 inline h-3.5 w-3.5 text-[#FBBF24]" />
                    )}
                  </span>
                  <span className="tnum font-display text-lg font-bold text-[#7F1D1D]">{p.points}</span>
                  {isAdmin && p.name.toLowerCase() !== username.toLowerCase() && (
                    <button
                      onClick={async () => {
                        await removeMember(selected.id, p.name);
                        flash('ok', `Removed ${p.name}.`);
                      }}
                      title="Remove member"
                      className="cursor-pointer rounded-lg p-1.5 text-[#A1897F] transition-colors hover:bg-[#FEE2E2] hover:text-[#B91C1C]"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isAdmin ? (
            <div className="space-y-3 rounded-xl border border-[#FEE9C7] bg-[#FFFBEB] p-4">
              <p className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-[#92600A]">
                <Crown className="h-4 w-4 text-[#FBBF24]" /> Admin controls
              </p>

              <div className="flex gap-2">
                <input
                  value={renaming}
                  onChange={(e) => setRenaming(e.target.value)}
                  placeholder={`Rename “${selected.name}”`}
                  className="min-w-0 flex-1 rounded-lg border border-[#EBD9D4] bg-white px-3 py-2 text-sm text-[#2A1512] outline-none focus:border-[#DC2626]"
                />
                <button
                  onClick={async () => {
                    if (renaming.trim().length >= 2) {
                      await renameGroup(selected.id, renaming);
                      setRenaming('');
                      flash('ok', 'Group renamed.');
                    }
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#EBD9D4] bg-white px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide text-[#6B5D55] transition-colors hover:bg-[#FEF2F2]"
                >
                  <Pencil className="h-3.5 w-3.5" /> Rename
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    await regenerateCode(selected.id);
                    flash('ok', 'New code generated — the old link is now invalid.');
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#EBD9D4] bg-white px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide text-[#6B5D55] transition-colors hover:bg-[#FEF2F2]"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate link
                </button>
                <button
                  onClick={() => setLinkEnabled(selected.id, !selected.linkEnabled)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#EBD9D4] bg-white px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide text-[#6B5D55] transition-colors hover:bg-[#FEF2F2]"
                >
                  <Power className="h-3.5 w-3.5" /> {selected.linkEnabled ? 'Disable link' : 'Enable link'}
                </button>

                {confirmDelete ? (
                  <span className="inline-flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="cursor-pointer rounded-lg border border-[#EBD9D4] bg-white px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide text-[#6B5D55] hover:bg-[#FEF2F2]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        await deleteGroup(selected.id);
                        setSelectedId(null);
                        setConfirmDelete(false);
                        flash('ok', 'Group deleted.');
                      }}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#DC2626] px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#B91C1C]"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Confirm delete
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#DC2626] px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete group
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={async () => {
                await leaveGroup(selected.id);
                setSelectedId(null);
                flash('ok', `You left ${selected.name}.`);
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#EBD9D4] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#6B5D55] transition-colors hover:bg-[#FCF8F6]"
            >
              <DoorOpen className="h-4 w-4" /> Leave group
            </button>
          )}
        </motion.section>
      )}
    </div>
  );
}
