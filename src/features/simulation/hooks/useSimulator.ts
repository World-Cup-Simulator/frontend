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
import { mapGroupsResponseToSimulatedGroups, mapFinalsResponseToSimulatedBracket, initializeTeamNameLookup, mergePlayedMatchesWithSimulatedGroups } from '../utils/simulationMapper';
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
  goalsA: number | null;
  goalsB: number | null;
  played: boolean;
}

interface TeamStanding {
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
}

const createEmptyStandings = (teams: { code: string; name: string; flagCode: string }[]): TeamStanding[] => {
  return teams.map((team) => ({
    teamCode: team.code,
    teamName: team.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    gc: 0,
    dg: 0,
    points: 0,
  }));
};

const applyMatchResult = (
  standings: TeamStanding[],
  match: { teamA: { code: string }; teamB: { code: string } },
  score: { goalsA: number; goalsB: number }
) => {
  const teamA = standings.find((s) => s.teamCode === match.teamA.code);
  const teamB = standings.find((s) => s.teamCode === match.teamB.code);

  if (!teamA || !teamB) return;

  teamA.played += 1;
  teamB.played += 1;
  teamA.gf += score.goalsA;
  teamA.gc += score.goalsB;
  teamB.gf += score.goalsB;
  teamB.gc += score.goalsA;
  teamA.dg = teamA.gf - teamA.gc;
  teamB.dg = teamB.gf - teamB.gc;

  if (score.goalsA > score.goalsB) {
    teamA.won += 1;
    teamB.lost += 1;
    teamA.points += 3;
  } else if (score.goalsB > score.goalsA) {
    teamB.won += 1;
    teamA.lost += 1;
    teamB.points += 3;
  } else {
    teamA.drawn += 1;
    teamB.drawn += 1;
    teamA.points += 1;
    teamB.points += 1;
  }
};

const sortStandings = (standings: TeamStanding[]): TeamStanding[] => {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.dg !== a.dg) return b.dg - a.dg;
    return b.gf - a.gf;
  });
};

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
  const [playedMatches, setPlayedMatches] = useState<Record<string, HookMatch[]>>({});
  const [initialStandings, setInitialStandings] = useState<Record<string, TeamStanding[]>>({});
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
        const playedMap: Record<string, HookMatch[]> = {};
        const standingsMap: Record<string, TeamStanding[]> = {};

        for (const group of mappedGroups) {
          const matchesResponse = await fetchService.groupmatches(group.groupCode as groupCode);
          const mappedMatches = matchesResponse.data.map((match: match) => ({
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
            goalsA: match.goalsA,
            goalsB: match.goalsB,
            played: match.played,
          }));
          matchesMap[group.groupCode] = mappedMatches;

          // Separate played matches
          playedMap[group.groupCode] = mappedMatches.filter((m) => m.played);

          // Calculate initial standings from played matches
          const standings = createEmptyStandings(group.teams);
          mappedMatches.forEach((m) => {
            if (m.played && m.goalsA !== null && m.goalsB !== null) {
              applyMatchResult(standings, m, { goalsA: m.goalsA, goalsB: m.goalsB });
            }
          });
          standingsMap[group.groupCode] = sortStandings(standings);
        }
        setMatchesData(matchesMap);
        setPlayedMatches(playedMap);
        setInitialStandings(standingsMap);
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
    // Don't clear playedMatches or initialStandings - they persist
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
      
      // Merge with played matches
      const mergedGroups = mergePlayedMatchesWithSimulatedGroups(simulatedGroups, playedMatches);
      setGroupData(mergedGroups);
      setPhase('groups-simulated');
    } catch {
      setError(true);
      resetToIdle();
    } finally {
      setIsSimulating(false);
      setViewState('idle');
    }
  }, [resultsMode, resetToIdle, playedMatches]);

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
    // Don't clear playedMatches or initialStandings - they persist for re-simulation
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
    playedMatches,
    initialStandings,
    loading,
    error,
    isSimulating,
    isLocked,
  };
};
