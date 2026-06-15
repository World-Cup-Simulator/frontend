import { useSimulator } from '../../features/simulation/hooks/useSimulator';
import { SimulationGroupView } from '../../features/simulation/components/SimulationGroupView';
import { SimulationBracket } from '../../features/simulation/components/SimulationBracket';
import { LoadingOverlay } from '../../shared/components/LoadingOverlay';

export const SimulationPage = () => {
  const {
    activeTab,
    setActiveTab,
    resultsMode,
    setResultsMode,
    simulationMode,
    setSimulationMode,
    phase,
    viewState,
    groupData,
    bracketData,
    handleSimulate,
    buttonLabel,
    groupsData,
    loading,
    error,
    isSimulating,
    isLocked,
  } = useSimulator();

  return (
    <div className="flex flex-col pt-16 min-h-screen">
      {/* Loading Overlay for initial load and simulation */}
      {(viewState === 'loading' || loading) && <LoadingOverlay />}

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Hero */}
        <section className="flex flex-col items-center text-center gap-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">
            Simulador del Torneo
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            Simulá el torneo completo y analizá las probabilidades de cada equipo.
          </p>
        </section>

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-400 bg-zinc-800/30 rounded-2xl border border-zinc-700/50">
            <span className="text-5xl mb-3">🚧</span>
            <p className="text-base font-medium text-zinc-300 mb-1">Error en la simulación</p>
            <p className="text-sm text-zinc-500 mb-4">Por favor intente nuevamente</p>
            <button
              type="button"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all duration-200"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        )}

        {!error && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap justify-center gap-3">
              {/* Results Mode Toggle */}
              <div className={`inline-flex rounded-xl p-1 border border-zinc-700/50 ${isLocked ? 'bg-zinc-800/30 opacity-50' : 'bg-zinc-800/50'}`}>
                <button
                  type="button"
                  disabled={isLocked}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200
                    ${resultsMode === 'no-results' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}
                    ${isLocked ? 'cursor-default' : 'cursor-pointer'}
                  `}
                  onClick={() => setResultsMode('no-results')}
                >
                  Sin Resultados
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200
                    ${resultsMode === 'with-results' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}
                    ${isLocked ? 'cursor-default' : 'cursor-pointer'}
                  `}
                  onClick={() => setResultsMode('with-results')}
                >
                  Con Resultados
                </button>
              </div>

              {/* Simulation Mode Toggle */}
              <div className={`inline-flex rounded-xl p-1 border border-zinc-700/50 ${isLocked ? 'bg-zinc-800/30 opacity-50' : 'bg-zinc-800/50'}`}>
                <button
                  type="button"
                  disabled={isLocked}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200
                    ${simulationMode === 'simple' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}
                    ${isLocked ? 'cursor-default' : 'cursor-pointer'}
                  `}
                  onClick={() => setSimulationMode('simple')}
                >
                  Simple
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200
                    ${simulationMode === 'adaptive' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}
                    ${isLocked ? 'cursor-default' : 'cursor-pointer'}
                  `}
                  onClick={() => setSimulationMode('adaptive')}
                >
                  Adaptativo
                </button>
              </div>
            </div>

            {/* Simulate Button */}
            <div className="flex justify-center">
              <button
                type="button"
                disabled={isSimulating || loading}
                className={`px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-medium rounded-xl transition-all duration-200 ease-out shadow-lg
                  ${isSimulating || loading
                    ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                  }
                `}
                onClick={handleSimulate}
              >
                {isSimulating ? 'Simulando...' : buttonLabel}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex justify-center">
              <div className="inline-flex bg-zinc-800/50 rounded-xl p-1 border border-zinc-700/50">
                <button
                  type="button"
                  disabled={isSimulating}
                  className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200
                    ${activeTab === 'groups' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}
                    ${isSimulating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                  onClick={() => setActiveTab('groups')}
                >
                  Grupos
                </button>
                <button
                  type="button"
                  disabled={isSimulating}
                  className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200
                    ${activeTab === 'brackets' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}
                    ${isSimulating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                  onClick={() => setActiveTab('brackets')}
                >
                  Llaves
                </button>
              </div>
            </div>

            {/* Groups Tab */}
            {activeTab === 'groups' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {groupsData.map((group) => {
                  const simulatedGroup = groupData.find((g) => g.groupCode === group.groupCode);
                  return (
                    <SimulationGroupView
                      key={group.groupCode}
                      group={group}
                      simulatedGroup={simulatedGroup}
                      resultsMode={resultsMode}
                    />
                  );
                })}
              </div>
            )}

            {/* Brackets Tab */}
            {activeTab === 'brackets' && bracketData && (
              <SimulationBracket bracketData={bracketData} resultsMode={resultsMode} />
            )}

            {activeTab === 'brackets' && !bracketData && (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="w-full max-w-md bg-zinc-800/30 rounded-2xl border border-zinc-700/50 p-8 flex flex-col items-center text-center gap-4">
                  <p className="text-zinc-400 text-sm">
                    {phase === 'idle'
                      ? 'Primero simulá la fase de grupos para generar las llaves.'
                      : 'Simulá las finales para ver el bracket completo.'
                    }
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
