import { useState, useCallback } from 'react';
import { FlagImage } from '../../../shared/components/FlagImage';
import { getGroupMatches } from '../../../shared/data/teams';
import type { TeamStanding } from '../models';
import { getRowBg, sanitizeScoreInput } from '../utils/predictionPageUtils';

type ResultsMode = 'with-results' | 'no-results';

interface GroupPredictorProps {
  group: { groupCode: string; teams: { code: string; name: string; flagCode: string }[] };
  groupIndex: number;
  resultsMode: ResultsMode;
  clickOrders: Record<string, string[]>;
  onTeamClick: (groupCode: string, teamCode: string) => void;
  onScoreChange: (matchId: string, goalsA: number, goalsB: number) => void;
  calculateStandings: (groupIndex: number) => TeamStanding[];
}

export const GroupPredictor = ({
  group,
  groupIndex,
  resultsMode,
  clickOrders,
  onTeamClick,
  onScoreChange,
  calculateStandings,
}: GroupPredictorProps) => {
  const [inputValues, setInputValues] = useState<Record<string, { goalsA: string; goalsB: string }>>({});

  /** Update a single score input and notify parent when both sides are filled. */
  const handleInputChange = useCallback((matchId: string, field: 'goalsA' | 'goalsB', rawValue: string) => {
    const { display } = sanitizeScoreInput(rawValue);

    setInputValues((prev) => {
      const current = prev[matchId] || { goalsA: '', goalsB: '' };
      const updated = {
        ...prev,
        [matchId]: { ...current, [field]: display },
      };

      const match = updated[matchId];
      if (match.goalsA === '' && match.goalsB === '') return updated;

      const goalsA = match.goalsA === '' ? 0 : parseInt(match.goalsA, 10);
      const goalsB = match.goalsB === '' ? 0 : parseInt(match.goalsB, 10);
      onScoreChange(matchId, goalsA, goalsB);

      return updated;
    });
  }, [onScoreChange]);

  const standings = calculateStandings(groupIndex);
  const matches = getGroupMatches(groupIndex);
  const order = clickOrders[group.groupCode] || [];

  const isClickable = resultsMode === 'no-results';

  const tableGridCols = resultsMode === 'with-results'
    ? 'grid-cols-[28px_1fr_36px_36px_36px_36px]'
    : 'grid-cols-[28px_1fr]';

  const rowsToRender = resultsMode === 'with-results'
    ? standings
    : group.teams.map((t) => ({
        teamCode: t.code,
        teamName: t.name,
        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, gc: 0, dg: 0, points: 0,
      }));

  return (
    <div className="flex flex-col bg-zinc-800/50 rounded-2xl border border-zinc-700/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-700/50">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
          Grupo {group.groupCode}
        </h3>
      </div>

      {/* Table */}
      <div className="px-4 py-2">
        {/* Header */}
        <div className={`grid ${tableGridCols} gap-2 text-[10px] font-medium text-zinc-500 mb-1 px-1`}>
          <span>Pos</span>
          <span>Equipo</span>
          {resultsMode === 'with-results' && (
            <>
              <span className="text-center">Pts</span>
              <span className="text-center">DG</span>
              <span className="text-center">GF</span>
              <span className="text-center">GC</span>
            </>
          )}
        </div>

        {/* Rows */}
        {rowsToRender.map((row, index) => {
          const position = resultsMode === 'with-results'
            ? `${index + 1}º`
            : order.indexOf(row.teamCode) === -1
              ? '-'
              : `${order.indexOf(row.teamCode) + 1}º`;

          const posIndex = resultsMode === 'with-results'
            ? index
            : order.indexOf(row.teamCode);

          const highlightClass = posIndex >= 0 ? getRowBg(posIndex) : '';

          return (
            <button
              key={row.teamCode}
              type="button"
              className={`grid ${tableGridCols} gap-2 items-center w-full py-1.5 px-1 text-left transition-all duration-200 rounded-lg
                ${isClickable ? 'cursor-pointer hover:bg-zinc-700/30' : 'cursor-default'}
                ${highlightClass}
              `}
              onClick={() => isClickable && onTeamClick(group.groupCode, row.teamCode)}
            >
              <span className="text-xs font-bold text-zinc-400 text-center">{position}</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <FlagImage code={row.teamCode} alt={row.teamName} className="h-3.5 w-5 shrink-0" />
                <span className="text-xs font-medium text-zinc-200 truncate">{row.teamName}</span>
              </div>
              {resultsMode === 'with-results' && (
                <>
                  <span className="text-xs font-bold text-zinc-100 text-center">{row.points}</span>
                  <span className="text-xs text-zinc-300 text-center">{row.dg}</span>
                  <span className="text-xs text-zinc-300 text-center">{row.gf}</span>
                  <span className="text-xs text-zinc-300 text-center">{row.gc}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Match Inputs (only with-results) */}
      {resultsMode === 'with-results' && (
        <div className="px-4 py-3 border-t border-zinc-700/50">
          <div className="flex flex-col gap-2">
            {matches.map((match) => {
              const values = inputValues[match.matchId] || { goalsA: '', goalsB: '' };
              return (
                <div
                  key={match.matchId}
                  className="flex items-center justify-center gap-3 py-1.5"
                >
                  <FlagImage code={match.teamA.code} alt={match.teamA.name} className="h-4 w-6 shrink-0" />

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={values.goalsA}
                    onChange={(e) => handleInputChange(match.matchId, 'goalsA', e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-10 h-7 bg-zinc-900 border border-zinc-700 rounded text-center text-sm font-bold text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  <span className="text-xs text-zinc-500 font-medium">-</span>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={values.goalsB}
                    onChange={(e) => handleInputChange(match.matchId, 'goalsB', e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-10 h-7 bg-zinc-900 border border-zinc-700 rounded text-center text-sm font-bold text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  <FlagImage code={match.teamB.code} alt={match.teamB.name} className="h-4 w-6 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
