import { useState, useCallback } from 'react';
import { FlagImage } from '../../shared/components/FlagImage';
import { getGroupMatches } from '../../shared/data/teams';
import { usePredictor } from '../../features/prediction/hooks/usePredictor';
import { ThirdPlacesModal } from '../../features/prediction/components/ThirdPlacesModal';
import { TournamentBracket } from '../../features/prediction/components/TournamentBracket';
import { LoadingOverlay } from '../../features/tournament/components/GroupCarousel/LoadingOverlay';

export const PredictPage = () => {
  const {
    activeTab,
    setActiveTab,
    resultsMode,
    setResultsMode,
    viewState,
    isThirdPlacesModalOpen,
    setIsThirdPlacesModalOpen,
    groupsData,
    clickOrders,
    selectedThirdPlaces,
    isReadyForBrackets,
    handleTeamClick,
    handleScoreChange,
    calculateStandings,
    getThirdPlaceTeams,
    toggleThirdPlace,
    handleBuildBrackets,
    confirmThirdPlaces,
    bracketMatches,
    bracketChampion,
    advanceTeam,
    updateBracketScore,
    resetBracket,
    resetAllPredictions,
  } = usePredictor();

  const thirdPlaceTeams = getThirdPlaceTeams();

  return (
    <div className="flex flex-col pt-16 min-h-screen">
      {viewState === 'loading' && <LoadingOverlay />}

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Hero */}
        <section className="flex flex-col items-center text-center gap-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">
            Elegí tu ganador
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            Predecí los resultados de la fase de grupos y armá tu camino hacia la final.
          </p>
        </section>

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex bg-zinc-800/50 rounded-xl p-1 border border-zinc-700/50">
            <button
              type="button"
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === 'groups'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
                }
              `}
              onClick={() => setActiveTab('groups')}
            >
              Grupos
            </button>
            <button
              type="button"
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === 'brackets'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
                }
              `}
              onClick={() => setActiveTab('brackets')}
            >
              Llaves
            </button>
          </div>
        </div>

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="flex flex-col gap-6">
            {/* Results Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex bg-zinc-800/50 rounded-xl p-1 border border-zinc-700/50">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${resultsMode === 'no-results'
                      ? 'bg-zinc-700 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200'
                    }
                  `}
                  onClick={() => setResultsMode('no-results')}
                >
                  Sin Resultados
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${resultsMode === 'with-results'
                      ? 'bg-zinc-700 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200'
                    }
                  `}
                  onClick={() => setResultsMode('with-results')}
                >
                  Con Resultados
                </button>
              </div>
            </div>

            {/* Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {groupsData.map((group, groupIndex) => (
                <GroupPredictor
                  key={`${group.groupCode}-${resultsMode}`}
                  group={group}
                  groupIndex={groupIndex}
                  resultsMode={resultsMode}
                  clickOrders={clickOrders}
                  onTeamClick={handleTeamClick}
                  onScoreChange={handleScoreChange}
                  calculateStandings={calculateStandings}
                />
              ))}
            </div>

            {/* Build Brackets Button */}
            <div className="flex justify-center">
              <button
                type="button"
                className={`px-8 py-3 font-medium rounded-xl transition-all duration-200 ease-out shadow-lg
                  ${isReadyForBrackets
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                    : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  }
                `}
                onClick={handleBuildBrackets}
                disabled={!isReadyForBrackets}
                title={isReadyForBrackets ? '' : resultsMode === 'no-results'
                  ? 'Selecciona el orden de todos los grupos primero'
                  : 'Completa todos los resultados de los partidos primero'
                }
              >
                Armar Llaves
              </button>
            </div>
          </div>
        )}

        {/* Brackets Tab */}
        {activeTab === 'brackets' && (
          <TournamentBracket
            bracketMatches={bracketMatches}
            bracketChampion={bracketChampion}
            resultsMode={resultsMode}
            advanceTeam={advanceTeam}
            updateBracketScore={updateBracketScore}
            resetBracket={resetBracket}
            resetAllPredictions={resetAllPredictions}
            onGoToGroups={() => setActiveTab('groups')}
          />
        )}
      </div>

      {/* Third Places Modal */}
      <ThirdPlacesModal
        isOpen={isThirdPlacesModalOpen}
        teams={thirdPlaceTeams}
        selectedCount={selectedThirdPlaces.length}
        onToggle={toggleThirdPlace}
        onConfirm={confirmThirdPlaces}
        onClose={() => setIsThirdPlacesModalOpen(false)}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* GroupPredictor – isolated per-group to avoid global re-renders     */
/* ------------------------------------------------------------------ */

interface GroupPredictorProps {
  group: { groupCode: string; teams: { code: string; name: string; flagCode: string }[] };
  groupIndex: number;
  resultsMode: 'with-results' | 'no-results';
  clickOrders: Record<string, string[]>;
  onTeamClick: (groupCode: string, teamCode: string) => void;
  onScoreChange: (matchId: string, goalsA: number, goalsB: number) => void;
  calculateStandings: (groupIndex: number) => {
    teamCode: string;
    teamName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    gc: number;
    dg: number;
    points: number;
  }[];
}

const GroupPredictor = ({
  group,
  groupIndex,
  resultsMode,
  clickOrders,
  onTeamClick,
  onScoreChange,
  calculateStandings,
}: GroupPredictorProps) => {
  const [inputValues, setInputValues] = useState<Record<string, { goalsA: string; goalsB: string }>>({});

  const handleInputChange = useCallback((matchId: string, field: 'goalsA' | 'goalsB', rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, '');
    const num = digitsOnly === '' ? 0 : parseInt(digitsOnly, 10);
    const capped = Math.min(num, 20);
    const sanitized = capped === 0 && digitsOnly === '' ? '' : capped.toString();

    setInputValues((prev) => {
      const current = prev[matchId] || { goalsA: '', goalsB: '' };
      const updated = {
        ...prev,
        [matchId]: {
          ...current,
          [field]: sanitized,
        },
      };

      const match = updated[matchId];
      if (match.goalsA !== '' || match.goalsB !== '') {
        const goalsA = match.goalsA === '' ? 0 : parseInt(match.goalsA, 10);
        const goalsB = match.goalsB === '' ? 0 : parseInt(match.goalsB, 10);
        onScoreChange(matchId, goalsA, goalsB);
      }

      return updated;
    });
  }, [onScoreChange]);

  const standings = calculateStandings(groupIndex);
  const matches = getGroupMatches(groupIndex);
  const order = clickOrders[group.groupCode] || [];

  const getPosition = (teamCode: string) => {
    if (resultsMode === 'no-results') {
      const idx = order.indexOf(teamCode);
      return idx === -1 ? '-' : `${idx + 1}º`;
    }
    const idx = standings.findIndex((s) => s.teamCode === teamCode);
    return idx === -1 ? '-' : `${idx + 1}º`;
  };

  const getRowBg = (position: number) => {
    if (position === 0) return 'bg-yellow-500/15';
    if (position === 1) return 'bg-zinc-400/15';
    if (position === 2) return 'bg-amber-700/20';
    return '';
  };

  const tableGridCols = resultsMode === 'with-results'
    ? 'grid-cols-[28px_1fr_36px_36px_36px_36px]'
    : 'grid-cols-[28px_1fr]';

  // Determine which array to map: standings (sorted) in with-results, group.teams (static) in no-results
  const rowsToRender = resultsMode === 'with-results' ? standings : group.teams.map((t) => ({
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
          const isClickable = resultsMode === 'no-results';
          const position = resultsMode === 'with-results'
            ? `${index + 1}º`
            : getPosition(row.teamCode);
          const posIndex = resultsMode === 'with-results' ? index : parseInt(position) - 1;

          return (
            <button
              key={row.teamCode}
              type="button"
              className={`grid ${tableGridCols} gap-2 items-center w-full py-1.5 px-1 text-left transition-all duration-200 rounded-lg
                ${isClickable ? 'cursor-pointer hover:bg-zinc-700/30' : 'cursor-default'}
                ${!isNaN(posIndex) && posIndex >= 0 ? getRowBg(posIndex) : ''}
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
