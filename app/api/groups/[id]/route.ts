import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groups, groupMembers, users } from '@/db/schema';
import { getSessionUser } from '@/lib/server/session';
import { genUniqueCode, loadGroupById } from '@/lib/server/groups';


export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { id } = await ctx.params;

  const rows = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
  if (!rows.length) return NextResponse.json({ error: 'Group not found.' }, { status: 404 });
  const group = rows[0];
  const isAdmin = group.adminId === user.id;

  const body = await req.json().catch(() => ({}));
  const action = body.action as string;

  if (action === 'leave') {
    if (isAdmin)
      return NextResponse.json({ error: 'Admins cannot leave their own group — delete it instead.' }, { status: 400 });
    await db.delete(groupMembers).where(and(eq(groupMembers.groupId, id), eq(groupMembers.userId, user.id)));
    return NextResponse.json({ ok: true });
  }

  if (!isAdmin) return NextResponse.json({ error: 'Only the group admin can do that.' }, { status: 403 });

  if (action === 'rename') {
    const name = (body.name || '').trim();
    if (name.length < 2) return NextResponse.json({ error: 'Name too short.' }, { status: 400 });
    await db.update(groups).set({ name }).where(eq(groups.id, id));
  } else if (action === 'regenerate') {
    const code = await genUniqueCode();
    await db.update(groups).set({ code }).where(eq(groups.id, id));
  } else if (action === 'toggleLink') {
    await db.update(groups).set({ linkEnabled: Boolean(body.enabled) }).where(eq(groups.id, id));
  } else if (action === 'removeMember') {
    const uname = (body.username || '').toLowerCase();
    const u = await db.select({ id: users.id }).from(users).where(eq(users.usernameLower, uname)).limit(1);
    if (u.length && u[0].id !== group.adminId)
      await db.delete(groupMembers).where(and(eq(groupMembers.groupId, id), eq(groupMembers.userId, u[0].id)));
  } else {
    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  }

  return NextResponse.json({ group: await loadGroupById(id) });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { id } = await ctx.params;

  const rows = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
  if (!rows.length) return NextResponse.json({ ok: true });
  if (rows[0].adminId !== user.id)
    return NextResponse.json({ error: 'Only the group admin can delete it.' }, { status: 403 });

  await db.delete(groupMembers).where(eq(groupMembers.groupId, id));
  await db.delete(groups).where(eq(groups.id, id));
  return NextResponse.json({ ok: true });
}
