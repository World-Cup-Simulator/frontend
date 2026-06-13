import type { BracketMatch, BracketTeam, TeamStanding } from '../models';
import type { GroupData, ResultsMode } from '../models';

/** Build an empty Record of click orders (one empty array per group). */
export const createInitialClickOrders = (
  groups: GroupData[]
): Record<string, string[]> => {
  const initial: Record<string, string[]> = {};
  groups.forEach((g) => {
    initial[g.groupCode] = [];
  });
  return initial;
};

/** Look up a team across all groups and return its BracketTeam representation. */
export const findTeamInGroups = (
  teamCode: string,
  groups: GroupData[]
): BracketTeam | undefined => {
  for (const g of groups) {
    const team = g.teams.find((t) => t.code === teamCode);
    if (team) {
      return { code: team.code, name: team.name, flagCode: team.flagCode };
    }
  }
  return undefined;
};

/** Find the group code that contains the given team. */
export const findGroupCodeForTeam = (
  teamCode: string,
  groups: GroupData[]
): string => {
  for (const g of groups) {
    if (g.teams.some((t) => t.code === teamCode)) {
      return g.groupCode;
    }
  }
  return '';
};

/** Resolve a team from a source string like "1E" or "2A" using current standings or click order. */
export const resolveTeamFromSource = (
  source: string,
  groups: GroupData[],
  clickOrders: Record<string, string[]>,
  resultsMode: ResultsMode,
  standingsCalculator: (groupIndex: number) => TeamStanding[]
): BracketTeam | undefined => {
  const position = parseInt(source[0], 10);
  const groupCode = source[1];
  const groupIdx = groupCode.charCodeAt(0) - 65;
  const group = groups[groupIdx];
  if (!group) return undefined;

  if (resultsMode === 'no-results') {
    const order = clickOrders[groupCode] || [];
    const teamCode = order[position - 1];
    if (!teamCode) return undefined;
    return findTeamInGroups(teamCode, groups);
  }

  const standings = standingsCalculator(groupIdx);
  const standing = standings[position - 1];
  if (!standing) return undefined;
  return findTeamInGroups(standing.teamCode, groups);
};

/** Recursively clear results from a match and all downstream matches. */
export function clearDownstream(
  matches: Record<string, BracketMatch>,
  startMatchId: string
): Record<string, BracketMatch> {
  const startMatch = matches[startMatchId];
  if (!startMatch || !startMatch.nextMatchId) return matches;

  const nextId = startMatch.nextMatchId;
  const nextMatch = matches[nextId];
  if (!nextMatch) return matches;

  const updated: Record<string, BracketMatch> = {
    ...matches,
    [nextId]: {
      ...nextMatch,
      goalsA: undefined,
      goalsB: undefined,
      winner: undefined,
      isTieBreaker: undefined,
    },
  };

  return clearDownstream(updated, nextId);
}

/** Push the winner of a finished match into the next round and wipe downstream history. */
export const propagateToNextMatch = (
  matches: Record<string, BracketMatch>,
  matchId: string,
  winnerTeam: BracketTeam
): Record<string, BracketMatch> => {
  const match = matches[matchId];
  if (!match?.nextMatchId) return matches;

  const nextMatch = matches[match.nextMatchId];

  let updated = matches;
  if (nextMatch) {
    const slot = match.key % 2 === 1 ? 'teamA' : 'teamB';
    updated = {
      ...matches,
      [match.nextMatchId]: {
        ...nextMatch,
        [slot]: winnerTeam,
      },
    };
  }

  return clearDownstream(updated, matchId);
};

/** Build the skeleton for R16, QF, SF and Final matches. */
export const buildEmptyBracket = (): Record<string, BracketMatch> => {
  const matches: Record<string, BracketMatch> = {};

  for (let key = 1; key <= 8; key++) {
    matches[`2-${key}`] = {
      id: `2-${key}`,
      stage: 2,
      key,
      nextMatchId: `3-${Math.ceil(key / 2)}`,
    };
  }

  for (let key = 1; key <= 4; key++) {
    matches[`3-${key}`] = {
      id: `3-${key}`,
      stage: 3,
      key,
      nextMatchId: `4-${Math.ceil(key / 2)}`,
    };
  }

  for (let key = 1; key <= 2; key++) {
    matches[`4-${key}`] = {
      id: `4-${key}`,
      stage: 4,
      key,
      nextMatchId: '5-1',
    };
  }

  matches['5-1'] = {
    id: '5-1',
    stage: 5,
    key: 1,
    nextMatchId: null,
  };

  return matches;
};

/** Sort third-place teams by points → DG → GF and grab the top 8. */
export const selectTopThirdPlaces = (
  thirdPlaces: { points: number; dg: number; gf: number; teamCode: string }[]
): string[] => {
  return thirdPlaces
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.gf - a.gf;
    })
    .slice(0, 8)
    .map((t) => t.teamCode);
};
