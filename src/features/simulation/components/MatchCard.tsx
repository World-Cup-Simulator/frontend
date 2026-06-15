import { FlagImage } from '../../../shared/components/FlagImage';
import type { SimulatedMatch } from '../models';

interface MatchCardProps {
  match: SimulatedMatch;
  getTeamInfo: (code: string) => { code: string; name: string; flagCode: string } | undefined;
  hasSimulation: boolean;
  resultsMode: 'with-results' | 'no-results';
}

/** Return the winning team code, or null for a draw. */
const getWinner = (match: SimulatedMatch): string | null => {
  if (match.winner === 'A') return match.teamA;
  if (match.winner === 'B') return match.teamB;
  return null;
};

export const MatchCard = ({ match, getTeamInfo, hasSimulation, resultsMode }: MatchCardProps) => {
  const teamA = getTeamInfo(match.teamA);
  const teamB = getTeamInfo(match.teamB);
  const winner = hasSimulation ? getWinner(match) : null;

  const teamAClass = hasSimulation && winner === match.teamA ? 'text-emerald-300' : 'text-zinc-300';
  const teamBClass = hasSimulation && winner === match.teamB ? 'text-emerald-300' : 'text-zinc-300';

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700/50 overflow-hidden">
      {/* Main row: [Flag Name Score Name Flag] */}
      <div className="flex items-center justify-between px-3 py-2">
        {/* Team A side */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {teamA && <FlagImage code={teamA.code} alt={teamA.name} className="h-3.5 w-5 shrink-0" />}
          <span className={`text-xs font-medium truncate ${teamAClass}`}>
            {teamA?.name || match.teamA}
          </span>
        </div>

        {/* Center: Score or VS */}
        <div className="flex items-center gap-2 px-2 shrink-0">
          {hasSimulation && resultsMode === 'with-results' ? (
            <span className="text-sm font-bold text-zinc-100">
              {match.goalsA} - {match.goalsB}
            </span>
          ) : (
            <span className="text-xs text-zinc-500 font-medium">vs</span>
          )}
        </div>

        {/* Team B side */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className={`text-xs font-medium truncate text-right ${teamBClass}`}>
            {teamB?.name || match.teamB}
          </span>
          {teamB && <FlagImage code={teamB.code} alt={teamB.name} className="h-3.5 w-5 shrink-0" />}
        </div>
      </div>

      {/* Sub-row: probabilities (only when simulated) */}
      {hasSimulation && (
        <div className="px-3 py-1.5 bg-zinc-900/50 border-t border-zinc-700/50 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">
            Resultado: {match.outcomeProbability ? (match.outcomeProbability * 100).toFixed(2) : 0}%
          </span>
          {resultsMode === 'with-results' && (
            <span className="text-[10px] text-zinc-400">
              Marcador: {match.scoreProbability ? (match.scoreProbability * 100).toFixed(2) : 0}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};
