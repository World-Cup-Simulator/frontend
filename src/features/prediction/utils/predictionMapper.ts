import type { groupsDisplayResponse, teamDisplay } from '../../../shared/models/teamTypes';
import type { match } from '../../../shared/models/matchTypes';
import type { TeamStanding } from '../models';
import { getIsoCodeFromFifa } from '../../../shared/utils/flagMapper';

export interface HookGroupData {
  groupCode: string;
  teams: { code: string; name: string; flagCode: string }[];
}

export interface HookMatch {
  matchId: number;
  teamA: { code: string; name: string; flagCode: string };
  teamB: { code: string; name: string; flagCode: string };
  date: string;
}

export const mapTeamDisplayToHookTeam = (team: teamDisplay): { code: string; name: string; flagCode: string } => ({
  code: team.teamCode,
  name: team.teamName,
  flagCode: getIsoCodeFromFifa(team.teamCode),
});

export const mapApiGroupToHookFormat = (apiGroup: groupsDisplayResponse): HookGroupData => ({
  groupCode: apiGroup.groupCode,
  teams: apiGroup.teams.map(mapTeamDisplayToHookTeam),
});

export const mapApiMatchToHookFormat = (apiMatch: match): HookMatch => ({
  matchId: apiMatch.matchId,
  teamA: {
    code: apiMatch.teamACode,
    name: apiMatch.teamAName,
    flagCode: getIsoCodeFromFifa(apiMatch.teamACode),
  },
  teamB: {
    code: apiMatch.teamBCode,
    name: apiMatch.teamBName,
    flagCode: getIsoCodeFromFifa(apiMatch.teamBCode),
  },
  date: apiMatch.date,
});

export const mapMatchToTeamStanding = (apiMatch: match, teamCode: string): TeamStanding => {
  const isTeamA = apiMatch.teamACode === teamCode;
  return {
    teamCode: isTeamA ? apiMatch.teamACode : apiMatch.teamBCode,
    teamName: isTeamA ? apiMatch.teamAName : apiMatch.teamBName,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    gc: 0,
    dg: 0,
    points: 0,
  };
};
