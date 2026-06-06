import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, bonusPredictions } from '@/db/schema';
import { hashPassword, randomToken, createSession, setSessionCookie, pickColor, ADMIN_USERNAME } from '@/lib/server/session';


export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));
  const name = (username || '').trim();
  if (name.length < 2) return NextResponse.json({ error: 'Username must be at least 2 characters.' }, { status: 400 });
  if ((password || '').length < 4)
    return NextResponse.json({ error: 'Password must be at least 4 characters.' }, { status: 400 });
  if (name.toLowerCase() === ADMIN_USERNAME)
    return NextResponse.json({ error: 'That username is reserved.' }, { status: 400 });

  const existing = await db.select().from(users).where(eq(users.usernameLower, name.toLowerCase())).limit(1);
  if (existing.length) return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 });

  const count = (await db.select({ id: users.id }).from(users)).length;
  const salt = randomToken().slice(0, 16);
  const inserted = await db
    .insert(users)
    .values({
      username: name,
      usernameLower: name.toLowerCase(),
      passwordHash: hashPassword(password, salt),
      salt,
      color: pickColor(count),
    })
    .returning();
  const u = inserted[0];
  await db.insert(bonusPredictions).values({ userId: u.id }).onConflictDoNothing();

  const token = await createSession(u.id);
  await setSessionCookie(token);
  return NextResponse.json({ user: { id: u.id, username: u.username, color: u.color, isAdmin: false } });
}
