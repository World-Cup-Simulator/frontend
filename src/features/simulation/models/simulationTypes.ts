export interface SimulatedMatch {
  matchId: string;
  groupCode?: string;
  teamA: string;
  teamB: string;
  goalsA: number;
  goalsB: number;
  winner: 'A' | 'B' | 'draw';
  date: string;
  outcomeProbability: number;
  scoreProbability: number;
  decidedByPenalties: boolean;
  teamAWinProbability?: number;
  teamBWinProbability?: number;
}

export interface SimulatedGroupStanding {
  teamCode: string;
  position: number;
  points: number;
  dg: number;
  gf: number;
  gc: number;
  winProbability: number;
}

export interface SimulatedGroup {
  groupCode: string;
  standings: SimulatedGroupStanding[];
  matches: SimulatedMatch[];
}

export interface SimulatedBracket {
  matches: Record<string, SimulatedMatch>;
  champion: string;
  championProbability: number;
}

export type SimulationMode = 'simple' | 'adaptive';
export type SimulationPhase = 'idle' | 'groups-simulated' | 'complete';
