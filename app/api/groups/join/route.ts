import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groups, groupMembers } from '@/db/schema';
import { getSessionUser } from '@/lib/server/session';
import { loadGroupById } from '@/lib/server/groups';


export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { code } = await req.json().catch(() => ({}));
  const norm = (code || '').trim().toUpperCase();
  if (norm.length < 4) return NextResponse.json({ error: 'Enter a valid code, e.g. AB1234.' }, { status: 400 });

  const rows = await db.select().from(groups).where(eq(groups.code, norm)).limit(1);
  if (!rows.length)
    return NextResponse.json({ error: 'This code does not match any existing group.' }, { status: 404 });
  const group = rows[0];

  const member = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, user.id)))
    .limit(1);

  if (!member.length) {
    if (!group.linkEnabled)
      return NextResponse.json({ error: 'This group is not accepting new members right now.' }, { status: 403 });
    await db.insert(groupMembers).values({ groupId: group.id, userId: user.id }).onConflictDoNothing();
  }

  return NextResponse.json({ group: await loadGroupById(group.id) });
}
