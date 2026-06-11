export interface BracketTeam {
  code: string;
  name: string;
  flagCode: string;
}

export interface BracketMatch {
  id: string;
  stage: 1 | 2 | 3 | 4 | 5;
  key: number;
  nextMatchId: string | null;

  teamASource?: string;
  teamBSource?: string;

  teamA?: BracketTeam;
  teamB?: BracketTeam;

  goalsA?: number;
  goalsB?: number;
  winner?: string;

  isTieBreaker?: boolean;
}

export type BracketState = Record<string, BracketMatch>;
