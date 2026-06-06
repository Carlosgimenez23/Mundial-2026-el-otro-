import { cookies } from 'next/headers';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, sessions, bonusPredictions } from '@/db/schema';

export const SESSION_COOKIE = 'wc_session';
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = '1234';

const AVATAR_COLORS = ['#DC2626', '#0F766E', '#7C3AED', '#2563EB', '#DB2777', '#16A34A', '#EA580C', '#0891B2'];

export interface SessionUser {
  id: string;
  username: string;
  color: string;
  isAdmin: boolean;
}

export function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

export function randomToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function pickColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

/** Persist a session token in an httpOnly cookie (survives reopen). */
export async function setSessionCookie(token: string) {
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
}

export async function createSession(userId: string): Promise<string> {
  const token = randomToken();
  await db.insert(sessions).values({ token, userId });
  return token;
}

/** Resolve the currently authenticated user from the session cookie. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const sess = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  if (!sess.length) return null;
  const row = await db.select().from(users).where(eq(users.id, sess[0].userId)).limit(1);
  if (!row.length) return null;
  const u = row[0];
  return { id: u.id, username: u.username, color: u.color, isAdmin: u.usernameLower === ADMIN_USERNAME };
}

/** Ensure the special admin account exists (created on first admin login). */
export async function ensureAdminUser(): Promise<string> {
  const existing = await db.select().from(users).where(eq(users.usernameLower, ADMIN_USERNAME)).limit(1);
  if (existing.length) return existing[0].id;
  const salt = randomToken().slice(0, 16);
  const inserted = await db
    .insert(users)
    .values({
      username: 'admin',
      usernameLower: ADMIN_USERNAME,
      passwordHash: hashPassword(ADMIN_PASSWORD, salt),
      salt,
      color: '#102A43',
    })
    .returning({ id: users.id });
  await db.insert(bonusPredictions).values({ userId: inserted[0].id }).onConflictDoNothing();
  return inserted[0].id;
}
