import { useState, useCallback, useEffect, useRef } from 'react';
import { FlagImage } from '../../../../shared/components/FlagImage';
import type { BracketMatch } from '../../models';

interface MatchNodeProps {
  match: BracketMatch;
  mode: 'no-results' | 'with-results';
  onTeamClick: (matchId: string, teamCode: string) => void;
  onScoreChange: (matchId: string, goalsA: number, goalsB: number) => void;
  teamAInputTabIndex?: number;
  teamBInputTabIndex?: number;
}

export const MatchNode = ({ match, mode, onTeamClick, onScoreChange, teamAInputTabIndex, teamBInputTabIndex }: MatchNodeProps) => {
  const [inputs, setInputs] = useState(() => ({
    goalsA: match.goalsA !== undefined ? String(match.goalsA) : '',
    goalsB: match.goalsB !== undefined ? String(match.goalsB) : '',
  }));

  // Track previous match values to detect external changes (e.g., reset)
  const prevMatchRef = useRef({ goalsA: match.goalsA, goalsB: match.goalsB });

  // Sync inputs with parent state when reset or external changes occur
  useEffect(() => {
    const prev = prevMatchRef.current;
    // Only update if match values changed from outside (not from local input)
    if (prev.goalsA !== match.goalsA || prev.goalsB !== match.goalsB) {
      setInputs({
        goalsA: match.goalsA !== undefined ? String(match.goalsA) : '',
        goalsB: match.goalsB !== undefined ? String(match.goalsB) : '',
      });
      prevMatchRef.current = { goalsA: match.goalsA, goalsB: match.goalsB };
    }
  }, [match.goalsA, match.goalsB]);

  const handleInputChange = useCallback((field: 'goalsA' | 'goalsB', rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, '');
    const num = digitsOnly === '' ? 0 : parseInt(digitsOnly, 10);
    const capped = Math.min(num, 20);
    const sanitized = capped === 0 && digitsOnly === '' ? '' : capped.toString();

    const updated = { ...inputs, [field]: sanitized };
    setInputs(updated);

    if (updated.goalsA !== '' && updated.goalsB !== '') {
      onScoreChange(match.id, parseInt(updated.goalsA, 10), parseInt(updated.goalsB, 10));
    }
  }, [inputs, match.id, onScoreChange]);

  const isWinner = (teamCode: string | undefined) => match.winner === teamCode;
  const showTieBreaker = mode === 'with-results' && !!match.isTieBreaker;
  const canClickTeam = mode === 'no-results' || showTieBreaker;

  const teamRowClass = (teamCode: string | undefined, isClickable: boolean) => {
    const base = 'w-full flex items-center gap-2 px-2 py-2 transition-all duration-200';
    const winnerStyle = isWinner(teamCode)
      ? 'bg-amber-500/15 text-amber-300'
      : 'bg-zinc-800/50 text-zinc-300';
    const cursor = isClickable ? 'cursor-pointer hover:bg-zinc-700/40' : 'cursor-default';
    return `${base} ${winnerStyle} ${cursor}`;
  };

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700/50 overflow-hidden min-w-[150px]">
      {/* Team A */}
      <button
        type="button"
        className={teamRowClass(match.teamA?.code, canClickTeam && !!match.teamA)}
        onClick={() => {
          if (canClickTeam && match.teamA) {
            onTeamClick(match.id, match.teamA.code);
          }
        }}
        disabled={!canClickTeam || !match.teamA}
      >
        {match.stage === 1 && match.teamASource && (
          <span className="text-[10px] font-bold text-zinc-500 w-5 shrink-0 text-center">
            {match.teamASource}
          </span>
        )}
        {match.teamA ? (
          <>
            <FlagImage code={match.teamA.code} alt={match.teamA.name} className="h-3.5 w-5 shrink-0" />
            <span className="text-xs font-medium truncate text-left">{match.teamA.name}</span>
          </>
        ) : (
          <span className="text-xs text-zinc-500 italic text-left">Por definir</span>
        )}
        <span className="ml-auto" />
        {mode === 'with-results' && (
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            value={inputs.goalsA}
            onChange={(e) => handleInputChange('goalsA', e.target.value)}
            onFocus={(e) => e.target.select()}
            onClick={(e) => e.stopPropagation()}
            tabIndex={teamAInputTabIndex}
            className="w-7 h-6 bg-zinc-900 border border-zinc-700 rounded text-center text-xs font-bold text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shrink-0"
          />
        )}
        {mode === 'no-results' && isWinner(match.teamA?.code) && (
          <span className="text-amber-400 text-xs font-bold shrink-0">✓</span>
        )}
      </button>

      {/* Divider */}
      <div className="border-t border-zinc-700/50" />

      {/* Team B */}
      <button
        type="button"
        className={teamRowClass(match.teamB?.code, canClickTeam && !!match.teamB)}
        onClick={() => {
          if (canClickTeam && match.teamB) {
            onTeamClick(match.id, match.teamB.code);
          }
        }}
        disabled={!canClickTeam || !match.teamB}
      >
        {match.stage === 1 && match.teamBSource && (
          <span className="text-[10px] font-bold text-zinc-500 w-5 shrink-0 text-center">
            {match.teamBSource}
          </span>
        )}
        {match.teamB ? (
          <>
            <FlagImage code={match.teamB.code} alt={match.teamB.name} className="h-3.5 w-5 shrink-0" />
            <span className="text-xs font-medium truncate text-left">{match.teamB.name}</span>
          </>
        ) : (
          <span className="text-xs text-zinc-500 italic text-left">Por definir</span>
        )}
        <span className="ml-auto" />
        {mode === 'with-results' && (
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            value={inputs.goalsB}
            onChange={(e) => handleInputChange('goalsB', e.target.value)}
            onFocus={(e) => e.target.select()}
            onClick={(e) => e.stopPropagation()}
            tabIndex={teamBInputTabIndex}
            className="w-7 h-6 bg-zinc-900 border border-zinc-700 rounded text-center text-xs font-bold text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shrink-0"
          />
        )}
      </button>

      {/* Tie breaker hint */}
      {showTieBreaker && (
        <div className="px-2 py-1.5 bg-zinc-900/50 border-t border-zinc-700/50">
          <span className="text-[10px] text-amber-400 font-medium">Hacé click en un equipo para avanzarlo</span>
        </div>
      )}
    </div>
  );
};
