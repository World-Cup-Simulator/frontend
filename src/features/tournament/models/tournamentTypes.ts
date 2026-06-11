export interface TeamStanding {
  teamName: string;
  teamCode: string;
  points: number;
}

export interface GroupData {
  groupCode: string;
  standings: TeamStanding[];
}

export interface MatchSummary {
  matchId: string;
  round: string;
  date: string;
  groupCode: string;
  teamAName: string;
  teamBName: string;
  teamACode: string;
  teamBCode: string;
  goalsA: number;
  goalsB: number;
}
