export interface Team {
  name: string;
  code: string;
  flagCode: string;
}

export interface MatchTick {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  score?: { home: number; away: number };
  date: string;
}

export interface TickerTapeProps {
  matches: MatchTick[];
}

export interface TickerItemProps {
  match: MatchTick;
}
