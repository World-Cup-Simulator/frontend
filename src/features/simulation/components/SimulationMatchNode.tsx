import { FlagImage } from '../../../shared/components/FlagImage';
import type { SimulatedMatch } from '../models';
import { getFifaCodeFromName } from '../utils/simulationMapper';

interface SimulationMatchNodeProps {
  match: SimulatedMatch;
  resultsMode: 'with-results' | 'no-results';
  teamAName?: string;
  teamBName?: string;
}

export const SimulationMatchNode = ({ match, resultsMode, teamAName, teamBName }: SimulationMatchNodeProps) => {
  const winnerSide: 'A' | 'B' | null = match.winner === 'A' ? 'A' : match.winner === 'B' ? 'B' : null;

  const rowClass = (side: 'A' | 'B') => {
    const base = 'w-full flex items-center gap-2 px-2 py-2';
    const winStyle = winnerSide === side
      ? 'bg-emerald-500/10 text-emerald-300'
      : 'bg-zinc-800/50 text-zinc-300';
    return `${base} ${winStyle}`;
  };

  // Format probability with null/undefined check
  const formatProbability = (prob: number | null | undefined): string => {
    if (prob === null || prob === undefined || isNaN(prob)) {
      return '0.00';
    }
    return (prob * 100).toFixed(2);
  };

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700/50 overflow-hidden min-w-[150px]">
      {/* Team A */}
      <div className={rowClass('A')}>
        <FlagImage code={getFifaCodeFromName(match.teamA)} alt={teamAName || match.teamA} className="h-3.5 w-5 shrink-0" />
        <span className="text-xs font-medium truncate flex-1 text-left">
          {teamAName || match.teamA}
        </span>
        {resultsMode === 'no-results' && winnerSide === 'A' && (
          <span className="text-[10px] font-bold text-emerald-400 shrink-0">
            {formatProbability(match.outcomeProbability)}%
          </span>
        )}
        {resultsMode === 'with-results' && (
          <span className="text-xs font-bold text-zinc-100 w-5 text-center shrink-0">
            {match.goalsA}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-700/50" />

      {/* Team B */}
      <div className={rowClass('B')}>
        <FlagImage code={getFifaCodeFromName(match.teamB)} alt={teamBName || match.teamB} className="h-3.5 w-5 shrink-0" />
        <span className="text-xs font-medium truncate flex-1 text-left">
          {teamBName || match.teamB}
        </span>
        {resultsMode === 'no-results' && winnerSide === 'B' && (
          <span className="text-[10px] font-bold text-emerald-400 shrink-0">
            {formatProbability(match.outcomeProbability)}%
          </span>
        )}
        {resultsMode === 'with-results' && (
          <span className="text-xs font-bold text-zinc-100 w-5 text-center shrink-0">
            {match.goalsB}
          </span>
        )}
      </div>

      {/* Sub-row for with-results mode */}
      {resultsMode === 'with-results' && (
        <div className="px-2 py-1.5 bg-zinc-900/50 border-t border-zinc-700/50 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">
            Resultado: {formatProbability(match.outcomeProbability)}%
            {match.decidedByPenalties && (
              <span className="text-emerald-400 font-bold ml-1">(P)</span>
            )}
          </span>
          <span className="text-[10px] text-zinc-400">
            Marcador: {formatProbability(match.scoreProbability)}%
          </span>
        </div>
      )}
    </div>
  );
};
