import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, groupMembers } from '@/db/schema';
import { getSessionUser } from '@/lib/server/session';
import { genUniqueCode, loadMyGroups, serializeGroups } from '@/lib/server/groups';


export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ groups: await loadMyGroups(user.id) });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { name } = await req.json().catch(() => ({}));
  const trimmed = (name || '').trim();
  if (trimmed.length < 2) return NextResponse.json({ error: 'Enter a group name (min 2 characters).' }, { status: 400 });

  const code = await genUniqueCode();
  const inserted = await db
    .insert(groups)
    .values({ name: trimmed, code, adminId: user.id, linkEnabled: true })
    .returning();
  await db.insert(groupMembers).values({ groupId: inserted[0].id, userId: user.id }).onConflictDoNothing();

  const [group] = await serializeGroups(inserted);
  return NextResponse.json({ group });
}
