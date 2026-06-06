import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bonusPredictions } from '@/db/schema';
import { getSessionUser } from '@/lib/server/session';


export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const rows = await db.select().from(bonusPredictions).where(eq(bonusPredictions.userId, user.id)).limit(1);
  const bonus = rows.length ? { winner: rows[0].winner, topScorer: rows[0].topScorer } : { winner: '', topScorer: '' };
  return NextResponse.json({ bonus });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { winner, topScorer } = await req.json().catch(() => ({}));
  await db
    .insert(bonusPredictions)
    .values({ userId: user.id, winner: winner || '', topScorer: topScorer || '' })
    .onConflictDoUpdate({
      target: bonusPredictions.userId,
      set: { winner: winner || '', topScorer: topScorer || '' },
    });
  return NextResponse.json({ ok: true });
}
