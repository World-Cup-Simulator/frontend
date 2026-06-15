import { useState, useCallback, useEffect, useMemo } from 'react';
import { fetchService } from '../../../shared/services/fetchService';
import type { groupsDisplayResponse } from '../../../shared/models/teamTypes';
import type { 
  SimulatedGroup, 
  SimulatedBracket, 
  SimulationPhase, 
  SimulationMode,
  finalsSimulationMatch,
  previousResult,
  finalsResponse,
  adaptiveRequest 
} from '../models';
import { mapGroupsResponseToSimulatedGroups, mapFinalsResponseToSimulatedBracket, initializeTeamNameLookup } from '../utils/simulationMapper';
import type { groupCode } from '../../../shared/models/teamTypes';
import type { match } from '../../../shared/models/matchTypes';
import { getIsoCodeFromFifa } from '../../../shared/utils/flagMapper';

type ActiveTab = 'groups' | 'brackets';
type ResultsMode = 'with-results' | 'no-results';
type ViewState = 'idle' | 'loading';

export interface HookGroupData {
  groupCode: string;
  teams: { code: string; name: string; flagCode: string }[];
}

export interface HookMatch {
  matchId: number;
  teamA: { code: string; name: string; flagCode: string };
  teamB: { code: string; name: string; flagCode: string };
  date: string;
}

export const useSimulator = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('groups');
  const [resultsMode, setResultsMode] = useState<ResultsMode>('no-results');
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('simple');
  const [phase, setPhase] = useState<SimulationPhase>('idle');
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [groupData, setGroupData] = useState<SimulatedGroup[]>([]);
  const [bracketData, setBracketData] = useState<SimulatedBracket | null>(null);
  
  // Data states
  const [groupsData, setGroupsData] = useState<HookGroupData[]>([]);
  const [matchesData, setMatchesData] = useState<Record<string, HookMatch[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Store data from groups simulation for knockouts
  const [knockoutBracket, setKnockoutBracket] = useState<finalsSimulationMatch[]>([]);
  const [ratingData, setRatingData] = useState<previousResult[]>([]);

  // Fetch initial groups and matches on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Fetch groups
        const groupsResponse = await fetchService.groups();
        const mappedGroups = groupsResponse.data.map((group: groupsDisplayResponse) => ({
          groupCode: group.groupCode,
          teams: group.teams.map(team => ({
            code: team.teamCode,
            name: team.teamName,
            flagCode: getIsoCodeFromFifa(team.teamCode),
          })),
        }));
        setGroupsData(mappedGroups);
        
        // Initialize team name lookup for flag display in brackets
        initializeTeamNameLookup(mappedGroups);
        
        // Fetch matches for each group
        const matchesMap: Record<string, HookMatch[]> = {};
        for (const group of mappedGroups) {
          const matchesResponse = await fetchService.groupmatches(group.groupCode as groupCode);
          matchesMap[group.groupCode] = matchesResponse.data.map((match: match) => ({
            matchId: match.matchId,
            teamA: {
              code: match.teamACode,
              name: match.teamAName,
              flagCode: getIsoCodeFromFifa(match.teamACode),
            },
            teamB: {
              code: match.teamBCode,
              name: match.teamBName,
              flagCode: getIsoCodeFromFifa(match.teamBCode),
            },
            date: match.date,
          }));
        }
        setMatchesData(matchesMap);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const resetToIdle = useCallback(() => {
    setPhase('idle');
    setGroupData([]);
    setBracketData(null);
    setKnockoutBracket([]);
    setRatingData([]);
    setError(false);
  }, []);

  const handleResultsModeChange = useCallback((mode: ResultsMode) => {
    setResultsMode(mode);
    if (mode === 'no-results') {
      setSimulationMode('simple');
    }
    if (phase !== 'idle') {
      resetToIdle();
    }
  }, [phase, resetToIdle]);

  const handleSimulationModeChange = useCallback((mode: SimulationMode) => {
    setSimulationMode(mode);
    if (mode === 'adaptive') {
      setResultsMode('with-results');
    }
    if (phase !== 'idle') {
      resetToIdle();
    }
  }, [phase, resetToIdle]);

  /** Simulate groups phase using API */
  const simulateGroups = useCallback(async () => {
    setIsSimulating(true);
    setViewState('loading');
    setError(false);

    try {
      const type = resultsMode === 'with-results' ? 1 : 0;
      const response = await fetchService.simulategroups(type);
      
      // Store knockout bracket and rating data for later use
      setKnockoutBracket(response.data.knockoutBracket);
      setRatingData(response.data.ratingData);
      
      // Map response to SimulatedGroup format
      const simulatedGroups = mapGroupsResponseToSimulatedGroups(response.data);
      setGroupData(simulatedGroups);
      setPhase('groups-simulated');
    } catch {
      setError(true);
      resetToIdle();
    } finally {
      setIsSimulating(false);
      setViewState('idle');
    }
  }, [resultsMode, resetToIdle]);

  /** Simulate knockouts phase using API with sequential calls */
  const simulateBrackets = useCallback(async () => {
    setIsSimulating(true);
    setViewState('loading');
    setError(false);

    try {
      const type = resultsMode === 'with-results' ? 1 : 0;
      let allMatches: Record<string, import('../models').SimulatedMatch> = {};
      let currentStage = 1;
      
      if (simulationMode === 'simple') {
        // Simple mode: sequential calls with nextMatches
        let currentMatches = knockoutBracket;
        
        while (true) {
          const response: { data: finalsResponse } = await fetchService.simulateknockouts(type, currentMatches);
          
          // Map and accumulate matches
          const mapped = mapFinalsResponseToSimulatedBracket(response.data, allMatches, currentStage);
          allMatches = mapped.matches;
          
          if (response.data.isFinal) {
            // Set final bracket data
            setBracketData({
              matches: allMatches,
              champion: mapped.champion,
              championProbability: mapped.championProbability,
            });
            break;
          }
          
          // Continue with next round
          currentMatches = response.data.nextMatches;
          currentStage++;
        }
      } else {
        // Adaptive mode: sequential calls with adaptiveRequest
        let currentMatches = knockoutBracket;
        let previousResults = ratingData;
        
        while (true) {
          const request: adaptiveRequest = {
            matches: currentMatches,
            previuosResults: previousResults,
          };
          
          const response: { data: finalsResponse } = await fetchService.simulateknockoutsadp(request);
          
          // Map and accumulate matches
          const mapped = mapFinalsResponseToSimulatedBracket(response.data, allMatches, currentStage);
          allMatches = mapped.matches;
          
          if (response.data.isFinal) {
            // Set final bracket data
            setBracketData({
              matches: allMatches,
              champion: mapped.champion,
              championProbability: mapped.championProbability,
            });
            break;
          }
          
          // Continue with next round
          currentMatches = response.data.nextMatches;
          previousResults = response.data.previousResults;
          currentStage++;
        }
      }
      
      setPhase('complete');
      setActiveTab('brackets');
    } catch {
      setError(true);
      // Reset to groups-simulated state
      setPhase('groups-simulated');
      setBracketData(null);
      setActiveTab('groups');
    } finally {
      setIsSimulating(false);
      setViewState('idle');
    }
  }, [resultsMode, simulationMode, knockoutBracket, ratingData]);

  const resetSimulation = useCallback(() => {
    setPhase('idle');
    setGroupData([]);
    setBracketData(null);
    setKnockoutBracket([]);
    setRatingData([]);
    setActiveTab('groups');
    setError(false);
  }, []);

  const handleSimulate = useCallback(async () => {
    if (phase === 'idle') {
      await simulateGroups();
      return;
    }

    if (phase === 'groups-simulated') {
      await simulateBrackets();
      return;
    }

    resetSimulation();
  }, [phase, simulateGroups, simulateBrackets, resetSimulation]);

  const buttonLabel = useMemo(() => {
    if (phase === 'idle') return 'Simular Grupos';
    if (phase === 'groups-simulated') return 'Simular Finales';
    return 'Reiniciar';
  }, [phase]);

  const isLocked = phase === 'complete' || isSimulating || loading;

  return {
    activeTab,
    setActiveTab,
    resultsMode,
    setResultsMode: handleResultsModeChange,
    simulationMode,
    setSimulationMode: handleSimulationModeChange,
    phase,
    viewState,
    groupData,
    bracketData,
    handleSimulate,
    resetSimulation,
    buttonLabel,
    groupsData,
    matchesData,
    loading,
    error,
    isSimulating,
    isLocked,
  };
};
