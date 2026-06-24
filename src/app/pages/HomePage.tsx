import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TickerTape } from '../../shared/components/TickerTape';
import type { MatchTick } from '../../shared/models';
import { GroupCarousel } from '../../features/home/components/GroupCarousel';
import type { GroupData, MatchSummary } from '../../features/home/models';
import { fetchService } from '../../shared/services/fetchService';
import type { match } from '../../shared/models/matchTypes';
import type { groupsDisplayResponse } from '../../shared/models/teamTypes';
import { mapMatchToMatchTick } from '../../shared/utils/tickerMapper';
import { mapGroupToGroupData, mapMatchToMatchSummary } from '../../features/home/utils/tournamentMapper';
import { LoadingOverlay } from '../../shared/components/LoadingOverlay';

export const HomePage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'carousel' | 'expanded'>('carousel');
  
  // Ticker state
  const [tickerMatches, setTickerMatches] = useState<MatchTick[]>([]);
  const [tickerLoading, setTickerLoading] = useState(true);
  const [tickerError, setTickerError] = useState(false);
  
  // Groups carousel state
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [matchSummaries, setMatchSummaries] = useState<MatchSummary[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState(false);

  // Fetch ticker matches
  useEffect(() => {
    const fetchTickerMatches = async () => {
      try {
        setTickerLoading(true);
        setTickerError(false);
        const response = await fetchService.matches();
        const mappedMatches = response.data.map((match: match) => mapMatchToMatchTick(match));
        setTickerMatches(mappedMatches);
      } catch {
        setTickerError(true);
      } finally {
        setTickerLoading(false);
      }
    };

    fetchTickerMatches();
  }, []);

  // Fetch groups and matches for carousel (sequential - matches first, then groups)
  useEffect(() => {
    const fetchGroupsData = async () => {
      try {
        setGroupsLoading(true);
        setGroupsError(false);
        
        // First fetch matches
        const matchesResponse = await fetchService.matches();
        const mappedMatches = matchesResponse.data.map((match: match) => mapMatchToMatchSummary(match));
        setMatchSummaries(mappedMatches);
        
        // Then fetch groups
        const groupsResponse = await fetchService.groups();
        const mappedGroups = groupsResponse.data.map((group: groupsDisplayResponse) => mapGroupToGroupData(group));
        setGroups(mappedGroups);
      } catch {
        setGroupsError(true);
      } finally {
        setGroupsLoading(false);
      }
    };

    fetchGroupsData();
  }, []);

  return (
    <div className="flex flex-col pt-16">
      {/* Ticker Section */}
      {!tickerError && (
        tickerLoading ? (
          <div className="h-16 overflow-hidden bg-[#111113] backdrop-blur-sm border-b border-zinc-800/50">
            <div className="flex items-center h-full px-4">
              <div className="flex gap-8 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-6 bg-zinc-700 rounded-sm" />
                    <div className="h-4 w-12 bg-zinc-700 rounded" />
                    <div className="h-4 w-8 bg-zinc-700 rounded" />
                    <div className="h-4 w-12 bg-zinc-700 rounded" />
                    <div className="h-4 w-6 bg-zinc-700 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <TickerTape matches={tickerMatches} />
        )
      )}

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        <section className="flex flex-col items-center text-center gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
            Simulador Mundial 2026
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl">
            Predice resultados, explora escenarios y descubre qué selección levantará la Copa del Mundo 2026.
          </p>
        </section>

        {/* Groups Carousel Section */}
        <section className="flex flex-col gap-4 relative min-h-[520px]">
          {groupsLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm rounded-2xl z-20">
              <LoadingOverlay />
            </div>
          )}
          
          {groupsError ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400 bg-zinc-800/30 rounded-2xl border border-zinc-700/50">
              <span className="text-5xl mb-3">🚧</span>
              <p className="text-base font-medium text-zinc-300 mb-1">No se pudo obtener los datos de los grupos</p>
              <p className="text-sm text-zinc-500">Por favor intente nuevamente más tarde</p>
            </div>
          ) : (
            <GroupCarousel
              groups={groups}
              matches={matchSummaries}
              currentView={view}
              onToggleView={() => setView(view === 'carousel' ? 'expanded' : 'carousel')}
            />
          )}
        </section>

        <section className="flex flex-row gap-4 justify-center">
          <button
            type="button"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all duration-200 ease-out"
            onClick={() => navigate('/predict')}
          >
            Predecir
          </button>
          <button
            type="button"
            className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all duration-200 ease-out"
            onClick={() => navigate('/simulation')}
          >
            Simular
          </button>
        </section>
      </div>

      <button
        type="button"
        className="hidden min-[700px]:block fixed bottom-8 right-8 z-50 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium rounded-xl border border-zinc-700/50 transition-all duration-200 ease-out shadow-lg"
        onClick={() => setView(view === 'carousel' ? 'expanded' : 'carousel')}
      >
        {view === 'carousel' ? 'Ver Grilla' : 'Ver Carrusel'}
      </button>
    </div>
  );
};
