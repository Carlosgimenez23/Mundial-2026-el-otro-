import type { Match, Result, ResultMap, Team } from '@/lib/types';
import { GROUPS, GROUP_LETTERS, MATCHES } from '@/lib/data';

export type KnockoutRound = 'R32' | 'R16' | 'QF' | 'SF' | '3P' | 'F';

export const ROUND_LABELS: Record<KnockoutRound, string> = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarter-finals',
  SF: 'Semi-finals',
  '3P': 'Third-place Match',
  F: 'Final',
};

export const ROUND_ORDER: KnockoutRound[] = ['R32', 'R16', 'QF', 'SF', '3P', 'F'];

type Slot =
  | { kind: 'group'; pos: 1 | 2; group: string }
  | { kind: 'third'; groups: string[] }
  | { kind: 'winner'; match: number }
  | { kind: 'loser'; match: number };

export interface KnockoutMatch {
  n: number;
  id: string; // 'k73' ... 'k104' (shares the predictions/results maps)
  round: KnockoutRound;
  roundLabel: string;
  kickoff: string; // UTC ISO
  venue: string;
  city: string;
  home: Slot;
  away: Slot;
}

const g = (pos: 1 | 2, group: string): Slot => ({ kind: 'group', pos, group });
const third = (groups: string): Slot => ({ kind: 'third', groups: groups.split('') });
const w = (match: number): Slot => ({ kind: 'winner', match });
const l = (match: number): Slot => ({ kind: 'loser', match });

// Official 2026 bracket: [matchNumber, round, homeSlot, awaySlot]
const DEFS: [number, KnockoutRound, Slot, Slot][] = [
  // Round of 32
  [73, 'R32', g(2, 'A'), g(2, 'B')],
  [74, 'R32', g(1, 'E'), third('ABCDF')],
  [75, 'R32', g(1, 'F'), g(2, 'C')],
  [76, 'R32', g(1, 'C'), g(2, 'F')],
  [77, 'R32', g(1, 'I'), third('CDFGH')],
  [78, 'R32', g(2, 'E'), g(2, 'I')],
  [79, 'R32', g(1, 'A'), third('CEFHI')],
  [80, 'R32', g(1, 'L'), third('EHIJK')],
  [81, 'R32', g(1, 'D'), third('BEFIJ')],
  [82, 'R32', g(1, 'G'), third('AEHIJ')],
  [83, 'R32', g(2, 'K'), g(2, 'L')],
  [84, 'R32', g(1, 'H'), g(2, 'J')],
  [85, 'R32', g(1, 'B'), third('EFGIJ')],
  [86, 'R32', g(1, 'J'), g(2, 'H')],
  [87, 'R32', g(1, 'K'), third('DEIJL')],
  [88, 'R32', g(2, 'D'), g(2, 'G')],
  // Round of 16
  [89, 'R16', w(74), w(77)],
  [90, 'R16', w(73), w(75)],
  [91, 'R16', w(76), w(78)],
  [92, 'R16', w(79), w(80)],
  [93, 'R16', w(83), w(84)],
  [94, 'R16', w(81), w(82)],
  [95, 'R16', w(86), w(88)],
  [96, 'R16', w(85), w(87)],
  // Quarter-finals
  [97, 'QF', w(89), w(90)],
  [98, 'QF', w(93), w(94)],
  [99, 'QF', w(91), w(92)],
  [100, 'QF', w(95), w(96)],
  // Semi-finals
  [101, 'SF', w(97), w(98)],
  [102, 'SF', w(99), w(100)],
  // Third place + Final
  [103, '3P', l(101), l(102)],
  [104, 'F', w(101), w(102)],
];

const KO_VENUES: { stadium: string; city: string }[] = [
  { stadium: 'SoFi Stadium', city: 'Los Angeles' },
  { stadium: 'AT&T Stadium', city: 'Dallas' },
  { stadium: 'Mercedes-Benz Stadium', city: 'Atlanta' },
  { stadium: 'Hard Rock Stadium', city: 'Miami' },
  { stadium: 'NRG Stadium', city: 'Houston' },
  { stadium: 'Lumen Field', city: 'Seattle' },
  { stadium: 'BC Place', city: 'Vancouver' },
  { stadium: 'Arrowhead Stadium', city: 'Kansas City' },
  { stadium: 'Levi’s Stadium', city: 'San Francisco' },
  { stadium: 'Lincoln Financial Field', city: 'Philadelphia' },
  { stadium: 'Gillette Stadium', city: 'Boston' },
  { stadium: 'BMO Field', city: 'Toronto' },
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function koKickoff(n: number, round: KnockoutRound): string {
  let day = 1;
  let hour = 18;
  if (round === 'R32') {
    const i = n - 73;
    day = 2 + Math.floor(i / 4);
    hour = [16, 18, 20, 22][i % 4];
  } else if (round === 'R16') {
    const i = n - 89;
    day = 7 + Math.floor(i / 2);
    hour = [17, 20][i % 2];
  } else if (round === 'QF') {
    const i = n - 97;
    day = 12 + Math.floor(i / 2);
    hour = [17, 20][i % 2];
  } else if (round === 'SF') {
    day = 17 + (n - 101);
    hour = 20;
  } else if (round === '3P') {
    day = 21;
    hour = 16;
  } else {
    day = 22;
    hour = 18;
  }
  return `2026-07-${pad(day)}T${pad(hour)}:00:00Z`;
}

export const KNOCKOUT_MATCHES: KnockoutMatch[] = DEFS.map(([n, round, home, away]) => {
  const venue = n === 104 ? { stadium: 'MetLife Stadium', city: 'New York' } : KO_VENUES[(n - 73) % KO_VENUES.length];
  return {
    n,
    id: `k${n}`,
    round,
    roundLabel: ROUND_LABELS[round],
    kickoff: koKickoff(n, round),
    venue: venue.stadium,
    city: venue.city,
    home,
    away,
  };
});

const KO_BY_N: Record<number, KnockoutMatch> = Object.fromEntries(KNOCKOUT_MATCHES.map((m) => [m.n, m]));

/** Bracket starts when the first R32 match kicks off — locks bonus-style edits per match. */
export const KNOCKOUT_START_MS = Date.parse(KNOCKOUT_MATCHES[0].kickoff);

interface TeamStat {
  team: Team;
  group: string;
  seed: number;
  played: number;
  pts: number;
  gd: number;
  gf: number;
}

interface GroupTable {
  ranked: TeamStat[];
  complete: boolean;
}

function computeGroupTables(results: ResultMap): Record<string, GroupTable> {
  const tables: Record<string, GroupTable> = {};

  for (const letter of GROUP_LETTERS) {
    const stats: Record<string, TeamStat> = {};
    GROUPS[letter].forEach((team, seed) => {
      stats[team.code] = { team, group: letter, seed, played: 0, pts: 0, gd: 0, gf: 0 };
    });

    const groupMatches = MATCHES.filter((m) => m.groupLetter === letter);
    let played = 0;
    for (const m of groupMatches) {
      const r = results[m.id];
      if (!r) continue;
      played++;
      const h = stats[m.home.code];
      const a = stats[m.away.code];
      h.played++;
      a.played++;
      h.gf += r.home;
      a.gf += r.away;
      h.gd += r.home - r.away;
      a.gd += r.away - r.home;
      if (r.home > r.away) h.pts += 3;
      else if (r.home < r.away) a.pts += 3;
      else {
        h.pts += 1;
        a.pts += 1;
      }
    }

    const ranked = Object.values(stats).sort(
      (x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.seed - y.seed,
    );
    tables[letter] = { ranked, complete: played === groupMatches.length };
  }

  return tables;
}

export interface ResolvedSlot {
  team: Team | null;
  ref: string; // "1A", "2B", "3rd A/B/C/D/F", "Winner 74", "Loser 101"
}

export interface ResolvedMatch {
  match: KnockoutMatch;
  home: ResolvedSlot;
  away: ResolvedSlot;
  score: Result | null;
  winner: Team | null;
  loser: Team | null;
}

/**
 * Resolve the whole bracket from group + knockout results. Teams populate only
 * once the group stage is complete (winners, runners-up, 8 best thirds) and as
 * knockout matches finish (winners advance). Slots always carry a human ref.
 */
export function resolveBracket(results: ResultMap): Record<number, ResolvedMatch> {
  const tables = computeGroupTables(results);
  const allComplete = GROUP_LETTERS.every((l) => tables[l].complete);

  // Rank the 12 third-placed teams; top 8 qualify.
  const thirds = allComplete
    ? GROUP_LETTERS.map((l) => tables[l].ranked[2]).sort(
        (x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf,
      )
    : [];
  const qualifiedThirdGroups = new Set(thirds.slice(0, 8).map((t) => t.group));

  // Greedy, deterministic assignment of best thirds to R32 third-slots (in match order).
  const usedThirdGroups = new Set<string>();
  const thirdAssignment: Record<number, string> = {};
  if (allComplete) {
    for (const km of KNOCKOUT_MATCHES) {
      for (const slot of [km.home, km.away]) {
        if (slot.kind !== 'third') continue;
        const pick = thirds.find(
          (t) => slot.groups.includes(t.group) && qualifiedThirdGroups.has(t.group) && !usedThirdGroups.has(t.group),
        );
        if (pick) {
          usedThirdGroups.add(pick.group);
          thirdAssignment[km.n] = pick.group;
        }
      }
    }
  }

  const resolved: Record<number, ResolvedMatch> = {};

  for (const km of KNOCKOUT_MATCHES) {
    const resolveSlot = (slot: Slot): ResolvedSlot => {
      if (slot.kind === 'group') {
        const ref = `${slot.pos}${slot.group}`;
        const team = tables[slot.group].complete ? tables[slot.group].ranked[slot.pos - 1].team : null;
        return { team, ref };
      }
      if (slot.kind === 'third') {
        const ref = `3rd ${slot.groups.join('/')}`;
        const grp = thirdAssignment[km.n];
        const team = grp ? tables[grp].ranked[2].team : null;
        return { team, ref };
      }
      if (slot.kind === 'winner') {
        return { team: resolved[slot.match]?.winner ?? null, ref: `Winner ${slot.match}` };
      }
      return { team: resolved[slot.match]?.loser ?? null, ref: `Loser ${slot.match}` };
    };

    const home = resolveSlot(km.home);
    const away = resolveSlot(km.away);
    const score = results[km.id] ?? null;

    let winner: Team | null = null;
    let loser: Team | null = null;
    if (score && home.team && away.team && score.home !== score.away) {
      if (score.home > score.away) {
        winner = home.team;
        loser = away.team;
      } else {
        winner = away.team;
        loser = home.team;
      }
    }

    resolved[km.n] = { match: km, home, away, score, winner, loser };
  }

  return resolved;
}

export function isGroupStageComplete(results: ResultMap): boolean {
  return MATCHES.every((m) => results[m.id]);
}

/** Build a synthetic Match (for the shared prediction modal) from a resolved tie. */
export function toModalMatch(r: ResolvedMatch): Match | null {
  if (!r.home.team || !r.away.team) return null;
  const km = r.match;
  return {
    id: km.id,
    matchNumber: km.n,
    stage: km.roundLabel,
    group: km.roundLabel,
    groupLetter: '',
    matchday: 0,
    venue: km.venue,
    city: km.city,
    kickoff: km.kickoff,
    home: r.home.team,
    away: r.away.team,
  };
}

export { KO_BY_N };
