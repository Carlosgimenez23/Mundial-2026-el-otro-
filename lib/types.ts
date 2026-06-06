export interface Team {
  name: string;
  code: string;
  flag: string; // emoji flag (content, represents the nation)
}

export type MatchStatus = 'finished' | 'live' | 'upcoming';

export interface Match {
  id: string;
  matchNumber: number; // official FIFA match number
  stage: string;
  group: string; // "Group A" ... "Group L"
  groupLetter: string; // "A" ... "L"
  matchday: number; // 1, 2, 3
  venue: string;
  city: string;
  kickoff: string; // ISO datetime stored in UTC, displayed in CEST
  home: Team;
  away: Team;
}

/** Final score for a match — sourced from the results API once available. */
export interface Result {
  home: number;
  away: number;
}

export type ResultMap = Record<string, Result>;

export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  points: number;
  exactScores: number;
  correctResults: number;
  played: number;
  trend: 'up' | 'down' | 'same';
  isMe?: boolean;
  bonusWinner?: boolean; // predicted the World Cup winner correctly
  bonusScorer?: boolean; // predicted the top scorer correctly
}

/** A candidate footballer for the top-scorer (Pichichi) bonus. */
export interface ScorerCandidate {
  id: string;
  name: string;
  teamCode: string;
  flag: string;
}

/** A player's bonus predictions: champion (team code) and top scorer (free-text name). */
export interface BonusPrediction {
  winner: string; // team code, '' if unset
  topScorer: string; // free-text player name, '' if unset
}

/** The official bonus outcomes — filled once known (admin / API). */
export interface BonusResults {
  winner: string | null; // team code
  topScorer: string | null; // official top scorer's name
}

export interface Prediction {
  home: number;
  away: number;
}

export type PredictionMap = Record<string, Prediction>;
