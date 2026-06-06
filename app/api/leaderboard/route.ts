import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groups, groupMembers, users, predictions, bonusPredictions, results } from '@/db/schema';
import { getSessionUser } from '@/lib/server/session';
import {
  scorePrediction,
  POINTS_EXACT,
  POINTS_BONUS_WINNER,
  POINTS_BONUS_SCORER,
  BONUS_RESULTS,
} from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const groupId = new URL(req.url).searchParams.get('groupId');
  if (!groupId) return NextResponse.json({ players: [] });

  const grp = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  if (!grp.length) return NextResponse.json({ players: [] });

  // Members (exclude the admin account from competitive standings).
  const memberRows = await db
    .select({ id: users.id, username: users.username, color: users.color, usernameLower: users.usernameLower })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId));
  const members = memberRows.filter((m) => m.usernameLower !== 'admin');
  if (!members.length) return NextResponse.json({ players: [] });

  const ids = members.map((m) => m.id);
  const allPreds = await db.select().from(predictions).where(inArray(predictions.userId, ids));
  const allBonus = await db.select().from(bonusPredictions).where(inArray(bonusPredictions.userId, ids));
  const allResults = await db.select().from(results);

  const resultMap = new Map(allResults.map((r) => [r.matchId, { home: r.home, away: r.away }]));
  const predsByUser = new Map<string, typeof allPreds>();
  for (const p of allPreds) {
    const arr = predsByUser.get(p.userId) ?? [];
    arr.push(p);
    predsByUser.set(p.userId, arr);
  }
  const bonusByUser = new Map(allBonus.map((b) => [b.userId, b]));

  const players = members.map((m) => {
    let points = 0;
    let exactScores = 0;
    let correctResults = 0;
    let played = 0;
    for (const p of predsByUser.get(m.id) ?? []) {
      const r = resultMap.get(p.matchId);
      if (!r) continue;
      const earned = scorePrediction({ home: p.home, away: p.away }, r.home, r.away);
      if (earned === null) continue;
      played++;
      points += earned;
      if (earned === POINTS_EXACT) exactScores++;
      else if (earned > 0) correctResults++;
    }

    const b = bonusByUser.get(m.id);
    const bonusWinner = Boolean(BONUS_RESULTS.winner && b && b.winner === BONUS_RESULTS.winner);
    const bonusScorer = Boolean(
      BONUS_RESULTS.topScorer &&
        b &&
        b.topScorer.trim().toLowerCase() === BONUS_RESULTS.topScorer.trim().toLowerCase(),
    );
    if (bonusWinner) points += POINTS_BONUS_WINNER;
    if (bonusScorer) points += POINTS_BONUS_SCORER;

    return {
      id: `u-${m.id}`,
      name: m.username,
      avatarColor: m.color,
      points,
      exactScores,
      correctResults,
      played,
      trend: 'same' as const,
      isMe: m.id === user.id,
      bonusWinner,
      bonusScorer,
    };
  });

  players.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  return NextResponse.json({ players });
}
