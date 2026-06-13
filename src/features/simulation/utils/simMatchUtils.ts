import type { SimulatedMatch } from '../models';

/** Decide the winner side from two goal counts. */
export const determineWinner = (goalsA: number, goalsB: number): 'A' | 'B' | 'draw' => {
  if (goalsA > goalsB) return 'A';
  if (goalsB > goalsA) return 'B';
  return 'draw';
};

/** Build a randomised group-phase match with mock probability metadata. */
export const buildRandomGroupMatch = (
  matchId: string,
  teamA: string,
  teamB: string,
  date: string,
  groupCode: string
): SimulatedMatch => {
  const goalsA = Math.floor(Math.random() * 4);
  const goalsB = Math.floor(Math.random() * 4);
  const winner = determineWinner(goalsA, goalsB);

  return {
    matchId,
    groupCode,
    teamA,
    teamB,
    goalsA,
    goalsB,
    winner,
    date,
    outcomeProbability: Math.floor(Math.random() * 40) + 50,
    scoreProbability: Math.floor(Math.random() * 30) + 10,
    decidedByPenalties: false,
    teamAWinProbability: Math.floor(Math.random() * 40) + 30,
    teamBWinProbability: Math.floor(Math.random() * 40) + 30,
  };
};

/** Build a randomised knockout match with mock probability metadata. */
export const buildRandomKnockoutMatch = (
  matchId: string,
  teamA: string,
  teamB: string,
  date: string
): SimulatedMatch => {
  const goalsA = Math.floor(Math.random() * 3);
  const goalsB = Math.floor(Math.random() * 3);
  const winner = determineWinner(goalsA, goalsB);

  return {
    matchId,
    teamA,
    teamB,
    goalsA,
    goalsB,
    winner,
    date,
    outcomeProbability: Math.floor(Math.random() * 40) + 50,
    scoreProbability: Math.floor(Math.random() * 30) + 10,
    decidedByPenalties: winner === 'draw' && Math.random() > 0.5,
    teamAWinProbability: Math.floor(Math.random() * 40) + 30,
    teamBWinProbability: Math.floor(Math.random() * 40) + 30,
  };
};

/** Return how many matches exist in a knockout stage (1-5). */
export const getMatchCountForStage = (stage: number): number => {
  if (stage === 1) return 16;
  if (stage === 2) return 8;
  if (stage === 3) return 4;
  if (stage === 4) return 2;
  return 1;
};
