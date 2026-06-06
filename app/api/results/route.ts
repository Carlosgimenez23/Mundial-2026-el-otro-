import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { results } from '@/db/schema';
import { getSessionUser } from '@/lib/server/session';


export const dynamic = "force-dynamic";
export async function GET() {
  const rows = await db.select().from(results);
  return NextResponse.json({
    results: rows.map((r) => ({ matchId: r.matchId, home: r.home, away: r.away, status: r.status, manual: r.manual })),
  });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user || !user.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const { matchId, home, away, status, override } = await req.json().catch(() => ({}));
  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 });
  const h = Math.max(0, Math.floor(Number(home) || 0));
  const a = Math.max(0, Math.floor(Number(away) || 0));
  const st = ['upcoming', 'live', 'finished'].includes(status) ? status : 'finished';
  await db
    .insert(results)
    .values({ matchId, home: h, away: a, status: st, manual: Boolean(override) })
    .onConflictDoUpdate({
      target: results.matchId,
      set: { home: h, away: a, status: st, manual: Boolean(override), updatedAt: new Date() },
    });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user || !user.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const { matchId } = await req.json().catch(() => ({}));
  if (matchId) await db.delete(results).where(eq(results.matchId, matchId));
  else await db.delete(results);
  return NextResponse.json({ ok: true });
}
