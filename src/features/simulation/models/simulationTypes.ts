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

export interface finalsSimulationMatch {
  key: number;
  stage: number;
  nextMatchKey: number;
  teamAID: number;
  teamA: string;
  teamAFifaRank: number;
  aAccumulatedScores: number;
  aAccumulatedWeights: number;
  aAccumulatedPenalties: number;
  aAccumulatedCount: number;
  teamBID: number;
  teamB: string;
  teamBFifaRank: number;
  bAccumulatedScores: number;
  bAccumulatedWeights: number;
  bAccumulatedPenalties: number;
  bAccumulatedCount: number;
}

export interface groupResult {
    groupCode: string,
    teamA: string,
    teamB: string,
    goalsA: number,
    goalsB: number,
    winner: number,
    date: Date,
    outcomeProbability: number,
    scoreProbability: number,
    decidedByPenalties: boolean
}

export interface finalsResult {
    teamA: string,
    teamB: string,
    goalsA: number,
    goalsB: number,
    winner: number,
    outcomeProbability: number,
    scoreProbability: number,
    decidedByPenalties: boolean
}

export interface adaptiveRequest {
    matches: finalsSimulationMatch[],
    previuosResults: previousResult[]
}

export interface groupStanding {
    name: string,
    points: number,
    goalsScored: number,
    goalsConceded: number,
    goalDifference: number
}

export interface groupStandings {
    groupCode: string,
    teams: groupStanding[]
}

export interface groupsResponse {
    results: groupResult[],
    finalStandings: groupStandings[],
    knockoutBracket: finalsSimulationMatch[],
    ratingData: previousResult[]
}

export interface finalsResponse {
  results: finalsResult[],
  nextMatches: finalsSimulationMatch[],
  previousResults:previousResult[],
  isFinal: boolean
}

export interface previousResult {
  teamID: number,
  goalsScored: number,
  goalsConceded: number,
  opponentFifaRank: number,
  opponentAttackRating: number,
  date: Date,
  competition: number,
  stage: number   
}