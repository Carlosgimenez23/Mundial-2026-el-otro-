import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import {
  hashPassword,
  createSession,
  setSessionCookie,
  ensureAdminUser,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
} from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));
  const name = (username || '').trim();

  if (name.toLowerCase() === ADMIN_USERNAME) {
    if (password !== ADMIN_PASSWORD)
      return NextResponse.json({ error: 'Incorrect admin password.' }, { status: 401 });
    const id = await ensureAdminUser();
    const token = await createSession(id);
    await setSessionCookie(token);
    return NextResponse.json({ user: { id, username: 'admin', color: '#102A43', isAdmin: true } });
  }

  const row = await db.select().from(users).where(eq(users.usernameLower, name.toLowerCase())).limit(1);
  if (!row.length) return NextResponse.json({ error: 'No account with that username.' }, { status: 404 });
  const u = row[0];
  if (hashPassword(password || '', u.salt) !== u.passwordHash)
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });

  const token = await createSession(u.id);
  await setSessionCookie(token);
  return NextResponse.json({ user: { id: u.id, username: u.username, color: u.color, isAdmin: false } });
}
