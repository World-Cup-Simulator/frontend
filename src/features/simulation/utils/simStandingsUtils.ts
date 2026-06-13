import type { SimulatedMatch } from '../models';

interface SimStanding {
  code: string;
  points: number;
  gf: number;
  gc: number;
  dg: number;
}

/** Initialise zeroed standings for every team in a group. */
export const createEmptySimStandings = (
  teams: { code: string }[]
): Record<string, SimStanding> => {
  const standings: Record<string, SimStanding> = {};
  teams.forEach((t) => {
    standings[t.code] = { code: t.code, points: 0, gf: 0, gc: 0, dg: 0 };
  });
  return standings;
};

/** Apply a single simulated match result to the standings table. */
export const applySimMatchResult = (
  standings: Record<string, SimStanding>,
  match: SimulatedMatch
): void => {
  const teamA = standings[match.teamA];
  const teamB = standings[match.teamB];
  if (!teamA || !teamB) return;

  teamA.gf += match.goalsA;
  teamA.gc += match.goalsB;
  teamB.gf += match.goalsB;
  teamB.gc += match.goalsA;

  if (match.winner === 'A') {
    teamA.points += 3;
    return;
  }

  if (match.winner === 'B') {
    teamB.points += 3;
    return;
  }

  teamA.points += 1;
  teamB.points += 1;
};

/** Finalise goal difference and sort by points → DG → GF. */
export const sortSimStandings = (standings: Record<string, SimStanding>): SimStanding[] => {
  Object.values(standings).forEach((s) => {
    s.dg = s.gf - s.gc;
  });

  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.dg !== a.dg) return b.dg - a.dg;
    return b.gf - a.gf;
  });
};
