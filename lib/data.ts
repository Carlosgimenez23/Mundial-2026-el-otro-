import type {
  BonusResults,
  Match,
  MatchStatus,
  Player,
  Prediction,
  ResultMap,
  ScorerCandidate,
  Team,
} from '@/lib/types';

export const POOL_NAME = 'The Group Chat League';
export const POINTS_EXACT = 5;
export const POINTS_RESULT = 2;
export const POINTS_WRONG = 0;
export const POINTS_BONUS_WINNER = 300;
export const POINTS_BONUS_SCORER = 100;

/** Display timezone — Spain. June/July is always CEST (UTC+2). */
export const DISPLAY_TZ = 'Europe/Madrid';
export const TZ_LABEL = 'CEST';

/** A match is "live" for this long after kickoff, then "finished". */
export const MATCH_DURATION_MS = 110 * 60 * 1000; // 90' + stoppage + half-time buffer

/**
 * Stable pre-tournament instant used ONLY for the first server/client render so
 * there is no hydration mismatch. The live clock (useNow) replaces it on mount.
 */
export const SSR_NOW = Date.parse('2026-06-10T00:00:00Z');

/**
 * Official 2026 FIFA World Cup final draw (held 5 Dec 2025, Washington D.C.).
 * Teams are listed in drawn position order (slot 1–4), so fixture slots like
 * "A1"/"A2" map directly onto the real matchups.
 */
export const GROUPS: Record<string, Team[]> = {
  A: [
    { name: 'Mexico', code: 'MEX', flag: '🇲🇽' },
    { name: 'South Africa', code: 'RSA', flag: '🇿🇦' },
    { name: 'South Korea', code: 'KOR', flag: '🇰🇷' },
    { name: 'Czechia', code: 'CZE', flag: '🇨🇿' },
  ],
  B: [
    { name: 'Canada', code: 'CAN', flag: '🇨🇦' },
    { name: 'Bosnia & Herzegovina', code: 'BIH', flag: '🇧🇦' },
    { name: 'Qatar', code: 'QAT', flag: '🇶🇦' },
    { name: 'Switzerland', code: 'SUI', flag: '🇨🇭' },
  ],
  C: [
    { name: 'Brazil', code: 'BRA', flag: '🇧🇷' },
    { name: 'Morocco', code: 'MAR', flag: '🇲🇦' },
    { name: 'Haiti', code: 'HAI', flag: '🇭🇹' },
    { name: 'Scotland', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ],
  D: [
    { name: 'United States', code: 'USA', flag: '🇺🇸' },
    { name: 'Paraguay', code: 'PAR', flag: '🇵🇾' },
    { name: 'Australia', code: 'AUS', flag: '🇦🇺' },
    { name: 'Türkiye', code: 'TUR', flag: '🇹🇷' },
  ],
  E: [
    { name: 'Germany', code: 'GER', flag: '🇩🇪' },
    { name: 'Curaçao', code: 'CUW', flag: '🇨🇼' },
    { name: 'Ivory Coast', code: 'CIV', flag: '🇨🇮' },
    { name: 'Ecuador', code: 'ECU', flag: '🇪🇨' },
  ],
  F: [
    { name: 'Netherlands', code: 'NED', flag: '🇳🇱' },
    { name: 'Japan', code: 'JPN', flag: '🇯🇵' },
    { name: 'Sweden', code: 'SWE', flag: '🇸🇪' },
    { name: 'Tunisia', code: 'TUN', flag: '🇹🇳' },
  ],
  G: [
    { name: 'Belgium', code: 'BEL', flag: '🇧🇪' },
    { name: 'Egypt', code: 'EGY', flag: '🇪🇬' },
    { name: 'Iran', code: 'IRN', flag: '🇮🇷' },
    { name: 'New Zealand', code: 'NZL', flag: '🇳🇿' },
  ],
  H: [
    { name: 'Spain', code: 'ESP', flag: '🇪🇸' },
    { name: 'Cape Verde', code: 'CPV', flag: '🇨🇻' },
    { name: 'Saudi Arabia', code: 'KSA', flag: '🇸🇦' },
    { name: 'Uruguay', code: 'URU', flag: '🇺🇾' },
  ],
  I: [
    { name: 'France', code: 'FRA', flag: '🇫🇷' },
    { name: 'Senegal', code: 'SEN', flag: '🇸🇳' },
    { name: 'Iraq', code: 'IRQ', flag: '🇮🇶' },
    { name: 'Norway', code: 'NOR', flag: '🇳🇴' },
  ],
  J: [
    { name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
    { name: 'Algeria', code: 'ALG', flag: '🇩🇿' },
    { name: 'Austria', code: 'AUT', flag: '🇦🇹' },
    { name: 'Jordan', code: 'JOR', flag: '🇯🇴' },
  ],
  K: [
    { name: 'Portugal', code: 'POR', flag: '🇵🇹' },
    { name: 'DR Congo', code: 'COD', flag: '🇨🇩' },
    { name: 'Uzbekistan', code: 'UZB', flag: '🇺🇿' },
    { name: 'Colombia', code: 'COL', flag: '🇨🇴' },
  ],
  L: [
    { name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Croatia', code: 'CRO', flag: '🇭🇷' },
    { name: 'Ghana', code: 'GHA', flag: '🇬🇭' },
    { name: 'Panama', code: 'PAN', flag: '🇵🇦' },
  ],
};

export const GROUP_LETTERS = Object.keys(GROUPS);

interface Fixture {
  n: number; // official match number
  date: string; // ISO UTC kickoff
  city: string;
  stadium: string;
  t1: string; // slot, e.g. "A1"
  t2: string; // slot, e.g. "A2"
}

/** Official 2026 FIFA World Cup group-stage fixture list (UTC). */
const FIXTURES: Record<string, Fixture[]> = {
  A: [
    { n: 1, date: '2026-06-12T18:00:00Z', city: 'Guadalajara', stadium: 'Estadio Akron', t1: 'A1', t2: 'A2' },
    { n: 2, date: '2026-06-13T18:00:00Z', city: 'Houston', stadium: 'NRG Stadium', t1: 'A3', t2: 'A4' },
    { n: 3, date: '2026-06-17T18:00:00Z', city: 'Atlanta', stadium: 'Mercedes-Benz Stadium', t1: 'A1', t2: 'A3' },
    { n: 4, date: '2026-06-17T21:00:00Z', city: 'Seattle', stadium: 'Lumen Field', t1: 'A2', t2: 'A4' },
    { n: 5, date: '2026-06-21T18:00:00Z', city: 'Vancouver', stadium: 'BC Place', t1: 'A1', t2: 'A4' },
    { n: 6, date: '2026-06-21T21:00:00Z', city: 'New York', stadium: 'MetLife Stadium', t1: 'A2', t2: 'A3' },
  ],
  B: [
    { n: 7, date: '2026-06-12T21:00:00Z', city: 'Toronto', stadium: 'BMO Field', t1: 'B1', t2: 'B2' },
    { n: 8, date: '2026-06-13T21:00:00Z', city: 'Los Angeles', stadium: 'SoFi Stadium', t1: 'B3', t2: 'B4' },
    { n: 9, date: '2026-06-17T18:00:00Z', city: 'Dallas', stadium: 'AT&T Stadium', t1: 'B1', t2: 'B3' },
    { n: 10, date: '2026-06-17T21:00:00Z', city: 'Boston', stadium: 'Gillette Stadium', t1: 'B2', t2: 'B4' },
    { n: 11, date: '2026-06-22T18:00:00Z', city: 'Miami', stadium: 'Hard Rock Stadium', t1: 'B1', t2: 'B4' },
    { n: 12, date: '2026-06-22T21:00:00Z', city: 'Houston', stadium: 'NRG Stadium', t1: 'B2', t2: 'B3' },
  ],
  C: [
    { n: 13, date: '2026-06-13T18:00:00Z', city: 'Monterrey', stadium: 'Estadio BBVA', t1: 'C1', t2: 'C2' },
    { n: 14, date: '2026-06-14T21:00:00Z', city: 'Philadelphia', stadium: 'Lincoln Financial Field', t1: 'C3', t2: 'C4' },
    { n: 15, date: '2026-06-18T18:00:00Z', city: 'Kansas City', stadium: 'Arrowhead Stadium', t1: 'C1', t2: 'C3' },
    { n: 16, date: '2026-06-18T21:00:00Z', city: 'San Francisco', stadium: 'Levi’s Stadium', t1: 'C2', t2: 'C4' },
    { n: 17, date: '2026-06-22T18:00:00Z', city: 'Boston', stadium: 'Gillette Stadium', t1: 'C1', t2: 'C4' },
    { n: 18, date: '2026-06-22T21:00:00Z', city: 'Guadalajara', stadium: 'Estadio Akron', t1: 'C2', t2: 'C3' },
  ],
  D: [
    { n: 19, date: '2026-06-14T18:00:00Z', city: 'Vancouver', stadium: 'BC Place', t1: 'D1', t2: 'D2' },
    { n: 20, date: '2026-06-15T18:00:00Z', city: 'Miami', stadium: 'Hard Rock Stadium', t1: 'D3', t2: 'D4' },
    { n: 21, date: '2026-06-19T18:00:00Z', city: 'Dallas', stadium: 'AT&T Stadium', t1: 'D1', t2: 'D3' },
    { n: 22, date: '2026-06-19T21:00:00Z', city: 'Atlanta', stadium: 'Mercedes-Benz Stadium', t1: 'D2', t2: 'D4' },
    { n: 23, date: '2026-06-23T18:00:00Z', city: 'Los Angeles', stadium: 'SoFi Stadium', t1: 'D1', t2: 'D4' },
    { n: 24, date: '2026-06-23T21:00:00Z', city: 'Houston', stadium: 'NRG Stadium', t1: 'D2', t2: 'D3' },
  ],
  E: [
    { n: 25, date: '2026-06-15T18:00:00Z', city: 'New York', stadium: 'MetLife Stadium', t1: 'E1', t2: 'E2' },
    { n: 26, date: '2026-06-16T18:00:00Z', city: 'Toronto', stadium: 'BMO Field', t1: 'E3', t2: 'E4' },
    { n: 27, date: '2026-06-20T18:00:00Z', city: 'San Francisco', stadium: 'Levi’s Stadium', t1: 'E1', t2: 'E3' },
    { n: 28, date: '2026-06-20T21:00:00Z', city: 'Boston', stadium: 'Gillette Stadium', t1: 'E2', t2: 'E4' },
    { n: 29, date: '2026-06-24T18:00:00Z', city: 'Houston', stadium: 'NRG Stadium', t1: 'E1', t2: 'E4' },
    { n: 30, date: '2026-06-24T21:00:00Z', city: 'Dallas', stadium: 'AT&T Stadium', t1: 'E2', t2: 'E3' },
  ],
  F: [
    { n: 31, date: '2026-06-16T18:00:00Z', city: 'Monterrey', stadium: 'Estadio BBVA', t1: 'F1', t2: 'F2' },
    { n: 32, date: '2026-06-17T18:00:00Z', city: 'Atlanta', stadium: 'Mercedes-Benz Stadium', t1: 'F3', t2: 'F4' },
    { n: 33, date: '2026-06-21T18:00:00Z', city: 'Miami', stadium: 'Hard Rock Stadium', t1: 'F1', t2: 'F3' },
    { n: 34, date: '2026-06-21T21:00:00Z', city: 'Seattle', stadium: 'Lumen Field', t1: 'F2', t2: 'F4' },
    { n: 35, date: '2026-06-25T18:00:00Z', city: 'Philadelphia', stadium: 'Lincoln Financial Field', t1: 'F1', t2: 'F4' },
    { n: 36, date: '2026-06-25T21:00:00Z', city: 'New York', stadium: 'MetLife Stadium', t1: 'F2', t2: 'F3' },
  ],
  G: [
    { n: 37, date: '2026-06-17T18:00:00Z', city: 'Toronto', stadium: 'BMO Field', t1: 'G1', t2: 'G2' },
    { n: 38, date: '2026-06-18T18:00:00Z', city: 'Los Angeles', stadium: 'SoFi Stadium', t1: 'G3', t2: 'G4' },
    { n: 39, date: '2026-06-22T18:00:00Z', city: 'Dallas', stadium: 'AT&T Stadium', t1: 'G1', t2: 'G3' },
    { n: 40, date: '2026-06-22T21:00:00Z', city: 'Houston', stadium: 'NRG Stadium', t1: 'G2', t2: 'G4' },
    { n: 41, date: '2026-06-26T18:00:00Z', city: 'Kansas City', stadium: 'Arrowhead Stadium', t1: 'G1', t2: 'G4' },
    { n: 42, date: '2026-06-26T21:00:00Z', city: 'Vancouver', stadium: 'BC Place', t1: 'G2', t2: 'G3' },
  ],
  H: [
    { n: 43, date: '2026-06-18T18:00:00Z', city: 'Guadalajara', stadium: 'Estadio Akron', t1: 'H1', t2: 'H2' },
    { n: 44, date: '2026-06-19T18:00:00Z', city: 'San Francisco', stadium: 'Levi’s Stadium', t1: 'H3', t2: 'H4' },
    { n: 45, date: '2026-06-23T18:00:00Z', city: 'Miami', stadium: 'Hard Rock Stadium', t1: 'H1', t2: 'H3' },
    { n: 46, date: '2026-06-23T21:00:00Z', city: 'Boston', stadium: 'Gillette Stadium', t1: 'H2', t2: 'H4' },
    { n: 47, date: '2026-06-27T18:00:00Z', city: 'Houston', stadium: 'NRG Stadium', t1: 'H1', t2: 'H4' },
    { n: 48, date: '2026-06-27T21:00:00Z', city: 'Seattle', stadium: 'Lumen Field', t1: 'H2', t2: 'H3' },
  ],
  I: [
    { n: 49, date: '2026-06-19T18:00:00Z', city: 'Toronto', stadium: 'BMO Field', t1: 'I1', t2: 'I2' },
    { n: 50, date: '2026-06-20T18:00:00Z', city: 'Dallas', stadium: 'AT&T Stadium', t1: 'I3', t2: 'I4' },
    { n: 51, date: '2026-06-24T18:00:00Z', city: 'Miami', stadium: 'Hard Rock Stadium', t1: 'I1', t2: 'I3' },
    { n: 52, date: '2026-06-24T21:00:00Z', city: 'New York', stadium: 'MetLife Stadium', t1: 'I2', t2: 'I4' },
    { n: 53, date: '2026-06-28T18:00:00Z', city: 'Los Angeles', stadium: 'SoFi Stadium', t1: 'I1', t2: 'I4' },
    { n: 54, date: '2026-06-28T21:00:00Z', city: 'Boston', stadium: 'Gillette Stadium', t1: 'I2', t2: 'I3' },
  ],
  J: [
    { n: 55, date: '2026-06-20T18:00:00Z', city: 'Philadelphia', stadium: 'Lincoln Financial Field', t1: 'J1', t2: 'J2' },
    { n: 56, date: '2026-06-21T18:00:00Z', city: 'Kansas City', stadium: 'Arrowhead Stadium', t1: 'J3', t2: 'J4' },
    { n: 57, date: '2026-06-25T18:00:00Z', city: 'Seattle', stadium: 'Lumen Field', t1: 'J1', t2: 'J3' },
    { n: 58, date: '2026-06-25T21:00:00Z', city: 'New York', stadium: 'MetLife Stadium', t1: 'J2', t2: 'J4' },
    { n: 59, date: '2026-06-29T18:00:00Z', city: 'Vancouver', stadium: 'BC Place', t1: 'J1', t2: 'J4' },
    { n: 60, date: '2026-06-29T21:00:00Z', city: 'Miami', stadium: 'Hard Rock Stadium', t1: 'J2', t2: 'J3' },
  ],
  K: [
    { n: 61, date: '2026-06-21T18:00:00Z', city: 'Guadalajara', stadium: 'Estadio Akron', t1: 'K1', t2: 'K2' },
    { n: 62, date: '2026-06-22T18:00:00Z', city: 'San Francisco', stadium: 'Levi’s Stadium', t1: 'K3', t2: 'K4' },
    { n: 63, date: '2026-06-26T18:00:00Z', city: 'Boston', stadium: 'Gillette Stadium', t1: 'K1', t2: 'K3' },
    { n: 64, date: '2026-06-26T21:00:00Z', city: 'Houston', stadium: 'NRG Stadium', t1: 'K2', t2: 'K4' },
    { n: 65, date: '2026-06-30T18:00:00Z', city: 'Dallas', stadium: 'AT&T Stadium', t1: 'K1', t2: 'K4' },
    { n: 66, date: '2026-06-30T21:00:00Z', city: 'Toronto', stadium: 'BMO Field', t1: 'K2', t2: 'K3' },
  ],
  L: [
    { n: 67, date: '2026-06-22T18:00:00Z', city: 'Los Angeles', stadium: 'SoFi Stadium', t1: 'L1', t2: 'L2' },
    { n: 68, date: '2026-06-23T18:00:00Z', city: 'Philadelphia', stadium: 'Lincoln Financial Field', t1: 'L3', t2: 'L4' },
    { n: 69, date: '2026-06-27T18:00:00Z', city: 'Miami', stadium: 'Hard Rock Stadium', t1: 'L1', t2: 'L3' },
    { n: 70, date: '2026-06-27T21:00:00Z', city: 'New York', stadium: 'MetLife Stadium', t1: 'L2', t2: 'L4' },
    { n: 71, date: '2026-07-01T18:00:00Z', city: 'Atlanta', stadium: 'Mercedes-Benz Stadium', t1: 'L1', t2: 'L4' },
    { n: 72, date: '2026-07-01T21:00:00Z', city: 'Seattle', stadium: 'Lumen Field', t1: 'L2', t2: 'L3' },
  ],
};

/** Resolve a slot like "A1" to the real drawn team for that group position. */
function resolveTeam(slot: string): Team {
  const letter = slot[0];
  const idx = Number(slot.slice(1)) - 1;
  return GROUPS[letter][idx];
}

function buildMatches(): Match[] {
  const matches: Match[] = [];

  GROUP_LETTERS.forEach((letter) => {
    FIXTURES[letter].forEach((f, idxInGroup) => {
      const matchday = Math.floor(idxInGroup / 2) + 1; // 0,1 -> MD1 · 2,3 -> MD2 · 4,5 -> MD3
      matches.push({
        id: `wc-${f.n}`,
        matchNumber: f.n,
        stage: `Group Stage · Matchday ${matchday}`,
        group: `Group ${letter}`,
        groupLetter: letter,
        matchday,
        venue: f.stadium,
        city: f.city,
        kickoff: f.date,
        home: resolveTeam(f.t1),
        away: resolveTeam(f.t2),
      });
    });
  });

  matches.sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));
  return matches;
}

export const MATCHES: Match[] = buildMatches();

/**
 * Final scores, keyed by match id. Empty until the results API is connected —
 * the app fills this from a trusted football API (no scraping). Until then no
 * match shows as finished with a score.
 */
export const RESULTS: ResultMap = {};

/** Tournament start = first kickoff. Bonus predictions lock at this moment. */
export const TOURNAMENT_START_MS = MATCHES.length ? Date.parse(MATCHES[0].kickoff) : Infinity;

/** Star players eligible for the Top Scorer (Pichichi) bonus. */
export const TOP_SCORER_CANDIDATES: ScorerCandidate[] = [
  { id: 'messi', name: 'Lionel Messi', teamCode: 'ARG', flag: '🇦🇷' },
  { id: 'alvarez', name: 'Julián Álvarez', teamCode: 'ARG', flag: '🇦🇷' },
  { id: 'mbappe', name: 'Kylian Mbappé', teamCode: 'FRA', flag: '🇫🇷' },
  { id: 'dembele', name: 'Ousmane Dembélé', teamCode: 'FRA', flag: '🇫🇷' },
  { id: 'haaland', name: 'Erling Haaland', teamCode: 'NOR', flag: '🇳🇴' },
  { id: 'vinicius', name: 'Vinícius Júnior', teamCode: 'BRA', flag: '🇧🇷' },
  { id: 'rodrygo', name: 'Rodrygo', teamCode: 'BRA', flag: '🇧🇷' },
  { id: 'kane', name: 'Harry Kane', teamCode: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'bellingham', name: 'Jude Bellingham', teamCode: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'yamal', name: 'Lamine Yamal', teamCode: 'ESP', flag: '🇪🇸' },
  { id: 'morata', name: 'Álvaro Morata', teamCode: 'ESP', flag: '🇪🇸' },
  { id: 'ronaldo', name: 'Cristiano Ronaldo', teamCode: 'POR', flag: '🇵🇹' },
  { id: 'leao', name: 'Rafael Leão', teamCode: 'POR', flag: '🇵🇹' },
  { id: 'lukaku', name: 'Romelu Lukaku', teamCode: 'BEL', flag: '🇧🇪' },
  { id: 'debruyne', name: 'Kevin De Bruyne', teamCode: 'BEL', flag: '🇧🇪' },
  { id: 'depay', name: 'Memphis Depay', teamCode: 'NED', flag: '🇳🇱' },
  { id: 'gakpo', name: 'Cody Gakpo', teamCode: 'NED', flag: '🇳🇱' },
  { id: 'wirtz', name: 'Florian Wirtz', teamCode: 'GER', flag: '🇩🇪' },
  { id: 'havertz', name: 'Kai Havertz', teamCode: 'GER', flag: '🇩🇪' },
  { id: 'salah', name: 'Mohamed Salah', teamCode: 'EGY', flag: '🇪🇬' },
  { id: 'nunez', name: 'Darwin Núñez', teamCode: 'URU', flag: '🇺🇾' },
  { id: 'pulisic', name: 'Christian Pulisic', teamCode: 'USA', flag: '🇺🇸' },
  { id: 'son', name: 'Son Heung-min', teamCode: 'KOR', flag: '🇰🇷' },
  { id: 'ennesyri', name: 'Youssef En-Nesyri', teamCode: 'MAR', flag: '🇲🇦' },
];

export function scorerById(id: string): ScorerCandidate | undefined {
  return TOP_SCORER_CANDIDATES.find((c) => c.id === id);
}

/**
 * Official bonus outcomes — empty until the tournament concludes (filled by an
 * admin or the results API). `topScorer` is the official player name and is
 * matched case-insensitively against each user's free-text entry. No bonus
 * points are awarded until these are set.
 */
export const BONUS_RESULTS: BonusResults = { winner: null, topScorer: null };

/** Live match status from the real clock. */
export function matchStatus(kickoff: string, nowMs: number): MatchStatus {
  const k = Date.parse(kickoff);
  if (k + MATCH_DURATION_MS <= nowMs) return 'finished';
  if (k <= nowMs) return 'live';
  return 'upcoming';
}

/** Unique list of every team in the tournament, alphabetical — for the country filter. */
export const ALL_TEAMS: Team[] = GROUP_LETTERS.flatMap((l) => GROUPS[l]).sort((a, b) =>
  a.name.localeCompare(b.name),
);

export const PLAYERS: Player[] = [
  { id: 'p1', name: 'Sofia M.', avatarColor: '#DC2626', points: 47, exactScores: 5, correctResults: 9, played: 18, trend: 'up' },
  { id: 'p2', name: 'You', avatarColor: '#FBBF24', points: 44, exactScores: 4, correctResults: 8, played: 18, trend: 'up', isMe: true },
  { id: 'p3', name: 'Marco R.', avatarColor: '#0F766E', points: 41, exactScores: 3, correctResults: 10, played: 18, trend: 'down' },
  { id: 'p4', name: 'Aisha K.', avatarColor: '#7C3AED', points: 38, exactScores: 4, correctResults: 6, played: 18, trend: 'up' },
  { id: 'p5', name: 'Leo D.', avatarColor: '#2563EB', points: 33, exactScores: 2, correctResults: 9, played: 18, trend: 'same' },
  { id: 'p6', name: 'Nina P.', avatarColor: '#DB2777', points: 29, exactScores: 2, correctResults: 7, played: 18, trend: 'down' },
  { id: 'p7', name: 'Tom B.', avatarColor: '#16A34A', points: 24, exactScores: 1, correctResults: 7, played: 18, trend: 'same' },
  { id: 'p8', name: 'Yuki S.', avatarColor: '#EA580C', points: 19, exactScores: 1, correctResults: 5, played: 18, trend: 'down' },
];

/** Scoring engine — pure, reused across views. */
export function scorePrediction(
  pred: Prediction | null | undefined,
  homeScore: number | null,
  awayScore: number | null,
): number | null {
  if (!pred || homeScore === null || awayScore === null) return null;
  if (pred.home === homeScore && pred.away === awayScore) return POINTS_EXACT;
  const predOutcome = Math.sign(pred.home - pred.away);
  const realOutcome = Math.sign(homeScore - awayScore);
  if (predOutcome === realOutcome) return POINTS_RESULT;
  return POINTS_WRONG;
}

/** Kickoff formatted in Spain time (CEST), 24-hour. */
export function formatKickoff(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: DISPLAY_TZ,
    }),
    time: d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: DISPLAY_TZ,
    }),
  };
}

/** Current Spain wall-clock time, 24-hour with seconds (e.g. "21:00:05"). */
export function formatClock(nowMs: number): string {
  return new Date(nowMs).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: DISPLAY_TZ,
  });
}

/** Short "time until kickoff" label relative to the live clock, e.g. "8d", "10h", "45m". */
export function kickoffBadge(iso: string, nowMs: number): string {
  const diff = Date.parse(iso) - nowMs;
  if (diff <= 0) return 'now';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

/** Next upcoming match relative to the live clock. */
export function getNextKickoff(nowMs: number): Match | null {
  let best: Match | null = null;
  let bestDiff = Infinity;
  for (const m of MATCHES) {
    const diff = Date.parse(m.kickoff) - nowMs;
    if (diff > 0 && diff < bestDiff) {
      best = m;
      bestDiff = diff;
    }
  }
  return best;
}
