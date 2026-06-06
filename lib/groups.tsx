'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';

export interface GroupMember {
  userId: string;
  username: string;
  color: string;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  adminUsername: string;
  linkEnabled: boolean;
  members: GroupMember[];
}

interface JoinResult {
  ok: boolean;
  group?: Group;
  error?: string;
}

interface GroupsState {
  groups: Group[];
  ready: boolean;
  activeGroupId: string | null;
  setActiveGroup: (id: string | null) => void;
  refresh: () => Promise<void>;
  createGroup: (name: string) => Promise<JoinResult>;
  joinByCode: (code: string) => Promise<JoinResult>;
  leaveGroup: (id: string) => Promise<void>;
  renameGroup: (id: string, name: string) => Promise<void>;
  regenerateCode: (id: string) => Promise<void>;
  setLinkEnabled: (id: string, enabled: boolean) => Promise<void>;
  removeMember: (id: string, username: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
}

const GroupsContext = createContext<GroupsState | null>(null);

export function GroupsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setGroups([]);
      return;
    }
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      setGroups(data.groups ?? []);
    } catch {
      /* keep existing */
    }
  }, [user]);

  useEffect(() => {
    setReady(false);
    refresh().finally(() => setReady(true));
  }, [refresh]);

  // Keep a valid active group selected.
  useEffect(() => {
    if (groups.length === 0) {
      setActiveGroupId(null);
    } else if (!activeGroupId || !groups.some((g) => g.id === activeGroupId)) {
      setActiveGroupId(groups[0].id);
    }
  }, [groups, activeGroupId]);

  const setActiveGroup = useCallback((id: string | null) => setActiveGroupId(id), []);

  const createGroup = useCallback(
    async (name: string): Promise<JoinResult> => {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: data.error ?? 'Could not create group.' };
      await refresh();
      setActiveGroupId(data.group.id);
      return { ok: true, group: data.group };
    },
    [refresh],
  );

  const joinByCode = useCallback(
    async (code: string): Promise<JoinResult> => {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: data.error ?? 'Could not join group.' };
      await refresh();
      if (data.group) setActiveGroupId(data.group.id);
      return { ok: true, group: data.group };
    },
    [refresh],
  );

  const patch = useCallback(
    async (id: string, body: Record<string, unknown>) => {
      await fetch(`/api/groups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await refresh();
    },
    [refresh],
  );

  const leaveGroup = useCallback((id: string) => patch(id, { action: 'leave' }), [patch]);
  const renameGroup = useCallback((id: string, name: string) => patch(id, { action: 'rename', name }), [patch]);
  const regenerateCode = useCallback((id: string) => patch(id, { action: 'regenerate' }), [patch]);
  const setLinkEnabled = useCallback(
    (id: string, enabled: boolean) => patch(id, { action: 'toggleLink', enabled }),
    [patch],
  );
  const removeMember = useCallback(
    (id: string, username: string) => patch(id, { action: 'removeMember', username }),
    [patch],
  );

  const deleteGroup = useCallback(
    async (id: string) => {
      await fetch(`/api/groups/${id}`, { method: 'DELETE' });
      await refresh();
    },
    [refresh],
  );

  return (
    <GroupsContext.Provider
      value={{
        groups,
        ready,
        activeGroupId,
        setActiveGroup,
        refresh,
        createGroup,
        joinByCode,
        leaveGroup,
        renameGroup,
        regenerateCode,
        setLinkEnabled,
        removeMember,
        deleteGroup,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups(): GroupsState {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error('useGroups must be used within GroupsProvider');
  return ctx;
}
