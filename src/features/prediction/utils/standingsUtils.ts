import type { TeamStanding } from '../models';

/** Initialise zeroed standings for every team in a group. */
export const createEmptyStandings = (
  teams: { code: string; name: string }[]
): Record<string, TeamStanding> => {
  const standings: Record<string, TeamStanding> = {};
  teams.forEach((t) => {
    standings[t.code] = {
      teamCode: t.code,
      teamName: t.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      points: 0,
    };
  });
  return standings;
};

interface MatchForProcessing {
  teamA: { code: string };
  teamB: { code: string };
}

interface ScoreEntry {
  goalsA: number;
  goalsB: number;
}

/** Update standings for both teams after a single match result. */
export const applyMatchResult = (
  standings: Record<string, TeamStanding>,
  match: MatchForProcessing,
  score: ScoreEntry
): void => {
  const teamA = standings[match.teamA.code];
  const teamB = standings[match.teamB.code];
  if (!teamA || !teamB) return;

  teamA.played += 1;
  teamB.played += 1;
  teamA.gf += score.goalsA;
  teamA.gc += score.goalsB;
  teamB.gf += score.goalsB;
  teamB.gc += score.goalsA;

  if (score.goalsA > score.goalsB) {
    teamA.won += 1;
    teamA.points += 3;
    teamB.lost += 1;
    return;
  }

  if (score.goalsA < score.goalsB) {
    teamB.won += 1;
    teamB.points += 3;
    teamA.lost += 1;
    return;
  }

  teamA.drawn += 1;
  teamA.points += 1;
  teamB.drawn += 1;
  teamB.points += 1;
};

/** Finalise goal difference and sort by points → DG → GF. */
export const sortStandings = (standings: Record<string, TeamStanding>): TeamStanding[] => {
  Object.values(standings).forEach((s) => {
    s.dg = s.gf - s.gc;
  });

  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.dg !== a.dg) return b.dg - a.dg;
    return b.gf - a.gf;
  });
};
