import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sessions } from '@/db/schema';
import { SESSION_COOKIE, clearSessionCookie } from '@/lib/server/session';


export const dynamic = "force-dynamic";
export async function POST() {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.token, token));
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
