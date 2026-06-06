import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { predictions, bonusPredictions, results } from '@/db/schema';
import { getSessionUser } from '@/lib/server/session';


export const dynamic = "force-dynamic";
export async function POST() {
  const user = await getSessionUser();
  if (!user || !user.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  await db.delete(predictions);
  await db.delete(results);
  // Reset bonus picks to empty (keep the rows).
  await db.update(bonusPredictions).set({ winner: '', topScorer: '' });
  return NextResponse.json({ ok: true });
}
