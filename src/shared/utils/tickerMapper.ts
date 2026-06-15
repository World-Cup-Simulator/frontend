import type { match } from '../models/matchTypes';
import type { MatchTick } from '../models/tickerTypes';

export const mapMatchToMatchTick = (apiMatch: match): MatchTick => ({
  id: apiMatch.matchId.toString(),
  homeTeam: {
    name: apiMatch.teamAName,
    code: apiMatch.teamACode,
    flagCode: apiMatch.teamACode,
  },
  awayTeam: {
    name: apiMatch.teamBName,
    code: apiMatch.teamBCode,
    flagCode: apiMatch.teamBCode,
  },
  score: apiMatch.goalsA !== null && apiMatch.goalsB !== null
    ? { home: apiMatch.goalsA, away: apiMatch.goalsB }
    : undefined,
  date: apiMatch.date,
});
