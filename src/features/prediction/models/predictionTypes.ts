export interface MatchScore {
  matchId: string;
  teamACode: string;
  teamBCode: string;
  goalsA: number;
  goalsB: number;
}

export interface TeamPosition {
  teamCode: string;
  teamName: string;
  position: number;
}

export interface GroupPrediction {
  groupCode: string;
  teams: TeamPosition[];
  scores: MatchScore[];
}

export interface ThirdPlaceTeam {
  teamCode: string;
  teamName: string;
  groupCode: string;
  points: number;
  gf: number;
  gc: number;
  dg: number;
  selected: boolean;
}

/** Input for the third-place API - represents a ranked third-place team */
export interface ThirdPlaceInput {
  /** Index in the ranking (0 = best, 1 = second best, etc.) */
  index: number;
  /** Group code (A, B, C, etc.) */
  group: string;
}

/** Response from the third-place API - maps match key to team index */
export interface ThirdPlaceSlot {
  /** Match key where this third-place team should play (1-16) */
  key: number;
  /** Index in the input array (0-7) */
  index: number;
}
