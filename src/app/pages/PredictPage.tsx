import { usePredictor } from '../../features/prediction/hooks/usePredictor';
import { ThirdPlacesModal } from '../../features/prediction/components/ThirdPlacesModal';
import { TournamentBracket } from '../../features/prediction/components/TournamentBracket';
import { GroupPredictor } from '../../features/prediction/components/GroupPredictor';
import { LoadingOverlay } from '../../shared/components/LoadingOverlay';

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
    matchesData,
    loading,
    error,
    clickOrders,
    scores,
    selectedThirdPlaces,
    isReadyForBrackets,
    isGeneratingBracket,
    bracketError,
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
    resetBracketError,
  } = usePredictor();

  const thirdPlaceTeams = getThirdPlaceTeams();

  return (
    <div className="flex flex-col pt-16 min-h-screen">
      {(viewState === 'loading' || isGeneratingBracket) && <LoadingOverlay />}

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
            <div className="flex flex-col gap-6 relative min-h-[400px]">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm rounded-2xl z-20">
                  <LoadingOverlay />
                </div>
              )}

              {error ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-400 bg-zinc-800/30 rounded-2xl border border-zinc-700/50">
                  <span className="text-5xl mb-3">🚧</span>
                  <p className="text-base font-medium text-zinc-300 mb-1">No se pudo obtener los datos de los grupos</p>
                  <p className="text-sm text-zinc-500">Por favor intente nuevamente más tarde</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {groupsData.map((group, groupIndex) => (
                    <GroupPredictor
                      key={`${group.groupCode}-${resultsMode}`}
                      group={group}
                      groupIndex={groupIndex}
                      matches={matchesData[group.groupCode] || []}
                      resultsMode={resultsMode}
                      clickOrders={clickOrders}
                      onTeamClick={handleTeamClick}
                      onScoreChange={handleScoreChange}
                      calculateStandings={calculateStandings}
                      scores={scores}
                      hasBrackets={Object.keys(bracketMatches).length > 0}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Build Brackets Button */}
            {!error && !loading && (
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
            )}
          </div>
        )}

        {/* Brackets Tab */}
        {activeTab === 'brackets' && (
          <>
            {bracketError ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-400 bg-zinc-800/30 rounded-2xl border border-zinc-700/50">
                <span className="text-5xl mb-3">🚧</span>
                <p className="text-base font-medium text-zinc-300 mb-1">Error al armar las llaves, inténtelo nuevamente</p>
                <p className="text-sm text-zinc-500 mb-4">No se pudo obtener la configuración de los mejores terceros</p>
                <button
                  type="button"
                  onClick={() => {
                    resetBracketError();
                    setActiveTab('groups');
                  }}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all duration-200"
                >
                  Volver a Grupos
                </button>
              </div>
            ) : (
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
          </>
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
