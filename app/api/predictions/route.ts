import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { predictions, users } from '@/db/schema';
import { getSessionUser } from '@/lib/server/session';


export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const matchId = new URL(req.url).searchParams.get('matchId');
  if (matchId) {
    const rows = await db
      .select({
        username: users.username,
        color: users.color,
        home: predictions.home,
        away: predictions.away,
      })
      .from(predictions)
      .innerJoin(users, eq(predictions.userId, users.id))
      .where(eq(predictions.matchId, matchId));
    return NextResponse.json({ predictions: rows.filter((r) => r.username.toLowerCase() !== 'admin') });
  }

  const rows = await db.select().from(predictions).where(eq(predictions.userId, user.id));
  const map: Record<string, { home: number; away: number }> = {};
  for (const r of rows) map[r.matchId] = { home: r.home, away: r.away };
  return NextResponse.json({ predictions: map });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { matchId, home, away } = await req.json().catch(() => ({}));
  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 });
  const h = Math.max(0, Math.floor(Number(home) || 0));
  const a = Math.max(0, Math.floor(Number(away) || 0));
  await db
    .insert(predictions)
    .values({ userId: user.id, matchId, home: h, away: a })
    .onConflictDoUpdate({
      target: [predictions.userId, predictions.matchId],
      set: { home: h, away: a, updatedAt: new Date() },
    });
  return NextResponse.json({ ok: true });
}
