import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groups, groupMembers, users } from '@/db/schema';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '0123456789';

function rnd(set: string, n: number): string {
  let s = '';
  for (let i = 0; i < n; i++) s += set[Math.floor(Math.random() * set.length)];
  return s;
}

export async function genUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 50; attempt++) {
    const code = rnd(LETTERS, 2) + rnd(DIGITS, 4);
    const ex = await db.select({ id: groups.id }).from(groups).where(eq(groups.code, code)).limit(1);
    if (!ex.length) return code;
  }
  return rnd(LETTERS, 3) + rnd(DIGITS, 4);
}

export interface GroupMemberDTO {
  userId: string;
  username: string;
  color: string;
}

export interface GroupDTO {
  id: string;
  name: string;
  code: string;
  adminUsername: string;
  linkEnabled: boolean;
  members: GroupMemberDTO[];
}

type GroupRow = typeof groups.$inferSelect;

export async function serializeGroups(groupRows: GroupRow[]): Promise<GroupDTO[]> {
  if (!groupRows.length) return [];
  const ids = groupRows.map((g) => g.id);
  const adminIds = groupRows.map((g) => g.adminId);

  const memberRows = await db
    .select({ groupId: groupMembers.groupId, userId: users.id, username: users.username, color: users.color })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(inArray(groupMembers.groupId, ids));

  const adminRows = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(inArray(users.id, adminIds));
  const adminMap = new Map(adminRows.map((a) => [a.id, a.username]));

  return groupRows.map((g) => ({
    id: g.id,
    name: g.name,
    code: g.code,
    linkEnabled: g.linkEnabled,
    adminUsername: adminMap.get(g.adminId) ?? '',
    members: memberRows
      .filter((m) => m.groupId === g.id)
      .map((m) => ({ userId: m.userId, username: m.username, color: m.color })),
  }));
}

export async function loadMyGroups(userId: string): Promise<GroupDTO[]> {
  const mem = await db.select({ groupId: groupMembers.groupId }).from(groupMembers).where(eq(groupMembers.userId, userId));
  const ids = mem.map((m) => m.groupId);
  if (!ids.length) return [];
  const rows = await db.select().from(groups).where(inArray(groups.id, ids));
  rows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return serializeGroups(rows);
}

export async function loadGroupById(id: string): Promise<GroupDTO | null> {
  const rows = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
  if (!rows.length) return null;
  return (await serializeGroups(rows))[0];
}
