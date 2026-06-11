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
