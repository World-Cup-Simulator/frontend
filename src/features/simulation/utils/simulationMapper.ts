import type { groupsResponse, groupResult, finalsResponse, finalsResult } from '../models/simulationTypes';
import type { SimulatedGroup, SimulatedMatch } from '../models';
import { getIsoCodeFromFifa } from '../../../shared/utils/flagMapper';

/**
 * Convert API match ID format to UI format
 * Stage 1 (R32): keys 1-16 → "1-1" to "1-16"
 * Stage 2 (R16): keys 1-8 → "2-1" to "2-8"
 * Stage 3 (QF): keys 1-4 → "3-1" to "3-4"
 * Stage 4 (SF): keys 1-2 → "4-1" to "4-2"
 * Stage 5 (Final): key 1 → "5-1"
 */
export const convertMatchId = (stage: number, key: number): string => {
  return `${stage}-${key}`;
};

/**
 * Map API group result to SimulatedMatch
 * API winner codes: 0 = draw, 1 = TeamA wins, 2 = TeamB wins
 */
export const mapGroupResultToSimulatedMatch = (apiMatch: groupResult): SimulatedMatch => {
  // Determine winner based on API winner field (not goals)
  // This is important for "Sin Resultados" mode where goals are 0-0
  let winner: 'A' | 'B' | 'draw';
  if (apiMatch.winner === 1) {
    winner = 'A';
  } else if (apiMatch.winner === 2) {
    winner = 'B';
  } else {
    winner = 'draw';
  }

  return {
    matchId: `${apiMatch.groupCode}-${apiMatch.teamA}-${apiMatch.teamB}`,
    groupCode: apiMatch.groupCode,
    teamA: apiMatch.teamA,
    teamB: apiMatch.teamB,
    goalsA: apiMatch.goalsA,
    goalsB: apiMatch.goalsB,
    winner,
    date: apiMatch.date instanceof Date ? apiMatch.date.toISOString().split('T')[0] : String(apiMatch.date),
    outcomeProbability: apiMatch.outcomeProbability,
    scoreProbability: apiMatch.scoreProbability,
    decidedByPenalties: apiMatch.decidedByPenalties,
  };
};

/**
 * Map API finals result to SimulatedMatch
 * API winner codes: 0 = TeamA wins, 1 = draw, 2 = TeamB wins
 */
export const mapFinalsResultToSimulatedMatch = (
  apiMatch: finalsResult,
  stage: number,
  key: number
): SimulatedMatch => {
  // Determine winner based on API winner property (not goals)
  // 0 = TeamA wins, 1 = draw, 2 = TeamB wins
  let winner: 'A' | 'B' | 'draw';
  if (apiMatch.winner === 0) {
    winner = 'A';
  } else if (apiMatch.winner === 2) {
    winner = 'B';
  } else {
    winner = 'draw';
  }

  return {
    matchId: convertMatchId(stage, key),
    teamA: apiMatch.teamA,
    teamB: apiMatch.teamB,
    goalsA: apiMatch.goalsA,
    goalsB: apiMatch.goalsB,
    winner,
    date: '', // Finals results don't include date
    outcomeProbability: apiMatch.outcomeProbability,
    scoreProbability: apiMatch.scoreProbability,
    decidedByPenalties: apiMatch.decidedByPenalties,
  };
};

/**
 * Map groupsResponse to SimulatedGroup array
 */
export const mapGroupsResponseToSimulatedGroups = (
  apiResponse: groupsResponse
): SimulatedGroup[] => {
  // Group matches by groupCode
  const matchesByGroup: Record<string, SimulatedMatch[]> = {};
  
  apiResponse.results.forEach((result) => {
    if (!matchesByGroup[result.groupCode]) {
      matchesByGroup[result.groupCode] = [];
    }
    matchesByGroup[result.groupCode].push(mapGroupResultToSimulatedMatch(result));
  });

  // Map finalStandings (which is an array of groups) to SimulatedGroup array
  return apiResponse.finalStandings.map((group) => {
    const groupCode = group.groupCode;
    const matches = matchesByGroup[groupCode] || [];
    
    // Map teams to standings format
    const standings = group.teams.map((team, index) => ({
      teamCode: team.name,
      position: index + 1,
      points: team.points,
      dg: team.goalDifference,
      gf: team.goalsScored,
      gc: team.goalsConceded,
      winProbability: 0, // Not provided by API
    }));

    return {
      groupCode,
      standings,
      matches,
    };
  });
};

/**
 * Map finalsResponse to SimulatedBracket
 * Accumulates matches from multiple API calls
 */
export const mapFinalsResponseToSimulatedBracket = (
  apiResponse: finalsResponse,
  existingMatches: Record<string, SimulatedMatch> = {},
  stage: number
): { matches: Record<string, SimulatedMatch>; champion: string; championProbability: number } => {
  const matches = { ...existingMatches };
  
  // Map results to matches with proper IDs
  apiResponse.results.forEach((result, index) => {
    const key = index + 1;
    const matchId = convertMatchId(stage, key);
    matches[matchId] = mapFinalsResultToSimulatedMatch(result, stage, key);
  });

  // Determine champion from the last match (final)
  // API winner codes: 0 = TeamA wins, 1 = draw, 2 = TeamB wins
  let champion = '';
  let championProbability = 0;
  
  if (apiResponse.isFinal && apiResponse.results.length > 0) {
    const finalMatch = apiResponse.results[apiResponse.results.length - 1];
    if (finalMatch.winner === 0) {
      champion = finalMatch.teamA;
    } else if (finalMatch.winner === 2) {
      champion = finalMatch.teamB;
    }
    // Format probability as percentage
    championProbability = finalMatch.outcomeProbability ? finalMatch.outcomeProbability * 100 : 0;
  }

  return {
    matches,
    champion,
    championProbability,
  };
};

/**
 * Get team info with proper flag code conversion
 */
export const getTeamInfoWithFlag = (
  teamCode: string,
  groupsData: { groupCode: string; teams: { code: string; name: string; flagCode: string }[] }[]
): { code: string; name: string; flagCode: string } | undefined => {
  for (const group of groupsData) {
    const team = group.teams.find(t => t.code === teamCode);
    if (team) {
      return {
        ...team,
        flagCode: getIsoCodeFromFifa(team.code),
      };
    }
  }
  return undefined;
};

// Global lookup map for team name to FIFA code
let teamNameToFifaCodeMap: Record<string, string> | null = null;

/**
 * Initialize the team name to FIFA code lookup map
 * Call this once when the simulation data is loaded
 */
export const initializeTeamNameLookup = (
  groupsData: { groupCode: string; teams: { code: string; name: string; flagCode: string }[] }[]
): void => {
  teamNameToFifaCodeMap = {};
  groupsData.forEach((group) => {
    group.teams.forEach((team) => {
      teamNameToFifaCodeMap![team.name] = team.code;
    });
  });
};

/**
 * Get FIFA code from team name
 * Returns the name itself if not found (fallback)
 */
export const getFifaCodeFromName = (teamName: string): string => {
  if (!teamNameToFifaCodeMap) {
    console.warn('Team name lookup not initialized');
    return teamName;
  }
  return teamNameToFifaCodeMap[teamName] || teamName;
};
