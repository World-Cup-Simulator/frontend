import type { groupsDisplayResponse, teamDisplay } from '../../../shared/models/teamTypes';
import type { match } from '../../../shared/models/matchTypes';
import type { GroupData, TeamStanding, MatchSummary } from '../models/tournamentTypes';

export const mapTeamDisplayToTeamStanding = (team: teamDisplay): TeamStanding => ({
  teamName: team.teamName,
  teamCode: team.teamCode,
  points: team.points,
});

export const mapGroupToGroupData = (apiGroup: groupsDisplayResponse): GroupData => ({
  groupCode: apiGroup.groupCode,
  standings: apiGroup.teams.map(mapTeamDisplayToTeamStanding),
});

export const mapMatchToMatchSummary = (apiMatch: match): MatchSummary => ({
  matchId: apiMatch.matchId.toString(),
  round: apiMatch.round.toString(),
  date: apiMatch.date,
  groupCode: apiMatch.groupCode,
  teamAName: apiMatch.teamAName,
  teamBName: apiMatch.teamBName,
  teamACode: apiMatch.teamACode,
  teamBCode: apiMatch.teamBCode,
  goalsA: apiMatch.goalsA ?? 0,
  goalsB: apiMatch.goalsB ?? 0,
});
