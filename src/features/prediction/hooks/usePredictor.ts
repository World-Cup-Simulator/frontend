import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { fetchService } from '../../../shared/services/fetchService';
import type { groupsDisplayResponse } from '../../../shared/models/teamTypes';
import type { match } from '../../../shared/models/matchTypes';
import type { ThirdPlaceTeam, BracketMatch, TeamStanding, ThirdPlaceInput, ThirdPlaceSlot } from '../models';
import type { groupCode } from '../../../shared/models/teamTypes';
import {
  createInitialClickOrders,
  findTeamInGroups,
  findGroupCodeForTeam,
  resolveTeamFromSource,
  propagateToNextMatch,
  buildEmptyBracket,
  selectTopThirdPlaces,
} from '../utils/bracketUtils';
import { createEmptyStandings, applyMatchResult, sortStandings } from '../utils/standingsUtils';
import { mapApiGroupToHookFormat, mapApiMatchToHookFormat, type HookGroupData, type HookMatch } from '../utils/predictionMapper';

type ActiveTab = 'groups' | 'brackets';
type ResultsMode = 'with-results' | 'no-results';
type ViewState = 'idle' | 'loading';

interface ScoreEntry {
  matchId: number;
  goalsA: number;
  goalsB: number;
}

export const usePredictor = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('groups');
  const [resultsMode, setResultsMode] = useState<ResultsMode>('no-results');
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [isThirdPlacesModalOpen, setIsThirdPlacesModalOpen] = useState(false);

  // Data states
  const [groupsData, setGroupsData] = useState<HookGroupData[]>([]);
  const [matchesData, setMatchesData] = useState<Record<string, HookMatch[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scores, setScores] = useState<Record<number, ScoreEntry>>({});

  // Fetch groups and matches on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);

        // First fetch groups
        const groupsResponse = await fetchService.groups();
        const mappedGroups = groupsResponse.data.map((group: groupsDisplayResponse) => mapApiGroupToHookFormat(group));
        setGroupsData(mappedGroups);

        // Then fetch matches for each group
        const matchesMap: Record<string, HookMatch[]> = {};
        const initialScores: Record<number, ScoreEntry> = {};

        for (const group of mappedGroups) {
          const matchesResponse = await fetchService.groupmatches(group.groupCode as groupCode);
          const mappedMatches = matchesResponse.data.map((match: match) => mapApiMatchToHookFormat(match));
          matchesMap[group.groupCode] = mappedMatches;

          // Initialize scores from played matches
          mappedMatches.forEach((m) => {
            if (m.played && m.goalsA !== null && m.goalsB !== null) {
              initialScores[m.matchId] = {
                matchId: m.matchId,
                goalsA: m.goalsA,
                goalsB: m.goalsB,
              };
            }
          });
        }
        setMatchesData(matchesMap);
        setScores(initialScores);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize click orders when groups data is loaded - using ref to track initialization
  const isClickOrdersInitialized = useRef(false);
  const [clickOrders, setClickOrders] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (groupsData.length > 0 && !isClickOrdersInitialized.current) {
      isClickOrdersInitialized.current = true;
      setClickOrders(createInitialClickOrders(groupsData));
    }
  }, [groupsData]);

  const [selectedThirdPlaces, setSelectedThirdPlaces] = useState<string[]>([]);

  const [bracketMatches, setBracketMatches] = useState<Record<string, BracketMatch>>({});
  const [isGeneratingBracket, setIsGeneratingBracket] = useState(false);
  const [bracketError, setBracketError] = useState(false);

  const handleResultsModeChange = useCallback((mode: ResultsMode) => {
    setResultsMode(mode);
    setClickOrders(() => createInitialClickOrders(groupsData));
    setScores({});
    setSelectedThirdPlaces([]);
    setBracketMatches({});
  }, [groupsData]);

  const handleTeamClick = useCallback((groupCode: string, teamCode: string) => {
    setClickOrders((prev) => {
      const current = prev[groupCode] || [];

      if (current.includes(teamCode)) {
        return { ...prev, [groupCode]: current.filter((c) => c !== teamCode) };
      }

      if (current.length >= 4) return prev;

      return { ...prev, [groupCode]: [...current, teamCode] };
    });
  }, []);

  const handleScoreChange = useCallback((matchId: number, goalsA: number, goalsB: number) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: { matchId, goalsA, goalsB },
    }));
  }, []);

  /** Compute the current standings for a group based on entered scores. */
  const calculateStandings = useCallback((groupIndex: number): TeamStanding[] => {
    const group = groupsData[groupIndex];
    if (!group) return [];

    const standings = createEmptyStandings(group.teams);
    const matches = matchesData[group.groupCode] || [];

    matches.forEach((m) => {
      // Use scores state if available, otherwise use match's own goals if played
      const score = scores[m.matchId] ?? (m.played ? {
        matchId: m.matchId,
        goalsA: m.goalsA ?? 0,
        goalsB: m.goalsB ?? 0,
      } : null);

      if (!score) return;
      applyMatchResult(standings, m, score);
    });

    return sortStandings(standings);
  }, [groupsData, matchesData, scores]);

  const isReadyForBrackets = useMemo(() => {
    if (groupsData.length === 0) return false;
    if (resultsMode === 'no-results') {
      return groupsData.every((g) => (clickOrders[g.groupCode] || []).length === 4);
    }
    const totalMatches = Object.values(matchesData).reduce((sum, matches) => sum + matches.length, 0);

    // Count matches with scores from either user input or played API matches
    const scoredMatchIds = new Set([
      ...Object.keys(scores).map(Number),
      ...Object.values(matchesData).flat().filter(m => m.played).map(m => m.matchId),
    ]);

    return scoredMatchIds.size === totalMatches;
  }, [resultsMode, groupsData, clickOrders, scores, matchesData]);

  /** Gather the third-place team from every group, ready for bracket generation. */
  const getThirdPlaceTeams = useCallback((): ThirdPlaceTeam[] => {
    return groupsData.flatMap((g, index) => {
      if (resultsMode === 'with-results') {
        const standings = calculateStandings(index);
        const third = standings[2];
        if (!third) return [];

        return [{
          teamCode: third.teamCode,
          teamName: third.teamName,
          groupCode: g.groupCode,
          points: third.points,
          gf: third.gf,
          gc: third.gc,
          dg: third.dg,
          selected: selectedThirdPlaces.includes(third.teamCode),
        }];
      }

      const order = clickOrders[g.groupCode] || [];
      const teamCode = order[2];
      if (!teamCode) return [];

      const team = g.teams.find((t) => t.code === teamCode);
      if (!team) return [];

      return [{
        teamCode: team.code,
        teamName: team.name,
        groupCode: g.groupCode,
        points: 0,
        gf: 0,
        gc: 0,
        dg: 0,
        selected: selectedThirdPlaces.includes(team.code),
      }];
    });
  }, [groupsData, resultsMode, calculateStandings, clickOrders, selectedThirdPlaces]);

  const toggleThirdPlace = useCallback((teamCode: string) => {
    setSelectedThirdPlaces((prev) => {
      if (prev.includes(teamCode)) {
        return prev.filter((c) => c !== teamCode);
      }

      if (prev.length >= 8) return prev;

      return [...prev, teamCode];
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /* Bracket Logic                                                       */
  /* ------------------------------------------------------------------ */

  /** Generate the full bracket tree given the 8 advancing third-place teams. */
  const generateBracket = useCallback((slots: ThirdPlaceSlot[], thirdPlacesData: ThirdPlaceTeam[]) => {
    const matches = buildEmptyBracket();

    const r32Defs = [
      { key: 1, teamASource: '1E', teamBSource: '3', nextMatchId: '2-1' },
      { key: 2, teamASource: '1I', teamBSource: '3', nextMatchId: '2-1' },
      { key: 3, teamASource: '2A', teamBSource: '2B', nextMatchId: '2-2' },
      { key: 4, teamASource: '1F', teamBSource: '2C', nextMatchId: '2-2' },
      { key: 5, teamASource: '2K', teamBSource: '2L', nextMatchId: '2-3' },
      { key: 6, teamASource: '1H', teamBSource: '2J', nextMatchId: '2-3' },
      { key: 7, teamASource: '1D', teamBSource: '3', nextMatchId: '2-4' },
      { key: 8, teamASource: '1G', teamBSource: '3', nextMatchId: '2-4' },
      { key: 9, teamASource: '1C', teamBSource: '2F', nextMatchId: '2-5' },
      { key: 10, teamASource: '2E', teamBSource: '2I', nextMatchId: '2-5' },
      { key: 11, teamASource: '1A', teamBSource: '3', nextMatchId: '2-6' },
      { key: 12, teamASource: '1L', teamBSource: '3', nextMatchId: '2-6' },
      { key: 13, teamASource: '1J', teamBSource: '2H', nextMatchId: '2-7' },
      { key: 14, teamASource: '2D', teamBSource: '2G', nextMatchId: '2-7' },
      { key: 15, teamASource: '1B', teamBSource: '3', nextMatchId: '2-8' },
      { key: 16, teamASource: '1K', teamBSource: '3', nextMatchId: '2-8' },
    ];

    r32Defs.forEach((def) => {
      const id = `1-${def.key}`;
      const teamA = resolveTeamFromSource(def.teamASource, groupsData, clickOrders, resultsMode, calculateStandings);

      // Check if this match has a third-place team assigned via API
      const slotAssignment = slots.find(s => s.key === def.key);
      const teamB = slotAssignment !== undefined
        ? findTeamInGroups(thirdPlacesData[slotAssignment.index]?.teamCode, groupsData)
        : resolveTeamFromSource(def.teamBSource, groupsData, clickOrders, resultsMode, calculateStandings);

      const teamBSourceLabel = slotAssignment !== undefined
        ? (teamB ? `3${findGroupCodeForTeam(teamB.code, groupsData)}` : '3')
        : def.teamBSource;

      matches[id] = {
        id,
        stage: 1,
        key: def.key,
        nextMatchId: def.nextMatchId,
        teamASource: def.teamASource,
        teamBSource: teamBSourceLabel,
        teamA,
        teamB,
      };
    });

    setBracketMatches(matches);
  }, [groupsData, clickOrders, resultsMode, calculateStandings]);

  /** Manually advance a team as the winner of a bracket match (no-results mode). */
  const advanceTeam = useCallback((matchId: string, teamCode: string) => {
    setBracketMatches((prev) => {
      const match = prev[matchId];
      if (!match) return prev;

      const winnerTeam = teamCode === match.teamA?.code ? match.teamA : match.teamB;
      if (!winnerTeam) return prev;

      const updated: Record<string, BracketMatch> = {
        ...prev,
        [matchId]: { ...match, winner: teamCode, isTieBreaker: false },
      };

      if (!match.nextMatchId) return updated;

      return propagateToNextMatch(updated, matchId, winnerTeam);
    });
  }, []);

  /** Update the score of a bracket match and automatically advance the winner. */
  const updateBracketScore = useCallback((matchId: string, goalsA: number, goalsB: number) => {
    setBracketMatches((prev) => {
      const match = prev[matchId];
      if (!match) return prev;

      let winner: string | undefined;
      let isTieBreaker = false;

      if (goalsA > goalsB) {
        winner = match.teamA?.code;
      } else if (goalsB > goalsA) {
        winner = match.teamB?.code;
      } else {
        isTieBreaker = true;
      }

      const winnerTeam = winner === match.teamA?.code ? match.teamA : match.teamB;

      const updated: Record<string, BracketMatch> = {
        ...prev,
        [matchId]: { ...match, goalsA, goalsB, winner, isTieBreaker },
      };

      if (!winner || !winnerTeam || !match.nextMatchId) return updated;

      return propagateToNextMatch(updated, matchId, winnerTeam);
    });
  }, []);

  /** Wipe all bracket results while keeping R32 team assignments intact. */
  const resetBracket = useCallback(() => {
    setBracketMatches((prev) => {
      const updated: Record<string, BracketMatch> = {};

      Object.values(prev).forEach((match) => {
        const isR32 = match.stage === 1;

        updated[match.id] = isR32
          ? { ...match, goalsA: undefined, goalsB: undefined, winner: undefined, isTieBreaker: undefined }
          : {
              ...match,
              teamA: undefined,
              teamB: undefined,
              goalsA: undefined,
              goalsB: undefined,
              winner: undefined,
              isTieBreaker: undefined,
            };
      });

      return updated;
    });
  }, []);

  const resetAllPredictions = useCallback(() => {
    setActiveTab('groups');
    setClickOrders(() => createInitialClickOrders(groupsData));
    setScores({});
    setSelectedThirdPlaces([]);
    setBracketMatches({});
  }, [groupsData]);

  /** Orchestrate the transition from group phase to bracket phase. */
  const handleBuildBrackets = useCallback(async () => {
    if (!isReadyForBrackets) return;

    if (resultsMode === 'no-results') {
      setIsThirdPlacesModalOpen(true);
      return;
    }

    setIsGeneratingBracket(true);
    setBracketError(false);

    try {
      // Get all third-place teams and rank them
      const thirdPlaces = getThirdPlaceTeams();
      const rankedTeamCodes = selectTopThirdPlaces(thirdPlaces);

      // Get full data for ranked teams
      const rankedTeamsData = rankedTeamCodes
        .map(code => thirdPlaces.find(t => t.teamCode === code))
        .filter((t): t is ThirdPlaceTeam => !!t);

      // Build input array - index represents ranking (0 = best)
      const input: ThirdPlaceInput[] = rankedTeamsData.map((team, index) => ({
        index,
        group: team.groupCode
      }));

      // Call API to get slot assignments
      const response = await fetchService.thirds(input);

      // Generate bracket with API response
      generateBracket(response.data, rankedTeamsData);
      setSelectedThirdPlaces(rankedTeamCodes);

      setViewState('loading');
      setTimeout(() => {
        setActiveTab('brackets');
        setViewState('idle');
      }, 800);
    } catch {
      setBracketError(true);
      setActiveTab('brackets');
    } finally {
      setIsGeneratingBracket(false);
    }
  }, [resultsMode, isReadyForBrackets, getThirdPlaceTeams, generateBracket]);

  const confirmThirdPlaces = useCallback(async () => {
    if (selectedThirdPlaces.length !== 8) return;

    setIsGeneratingBracket(true);
    setBracketError(false);

    try {
      // Get full team data for all third-place teams
      const allThirdPlaces = getThirdPlaceTeams();

      // Filter to only selected teams and maintain selection order
      const selectedTeamsData = selectedThirdPlaces
        .map(code => allThirdPlaces.find(t => t.teamCode === code))
        .filter((t): t is ThirdPlaceTeam => !!t);

      // Build input array - index represents the order (0 = first selected = best)
      const input: ThirdPlaceInput[] = selectedTeamsData.map((team, index) => ({
        index,
        group: team.groupCode
      }));

      // Call API to get slot assignments
      const response = await fetchService.thirds(input);

      // Generate bracket with API response
      generateBracket(response.data, selectedTeamsData);

      setIsThirdPlacesModalOpen(false);
      setViewState('loading');
      setTimeout(() => {
        setActiveTab('brackets');
        setViewState('idle');
      }, 800);
    } catch {
      setBracketError(true);
      setIsThirdPlacesModalOpen(false);
      setActiveTab('brackets');
    } finally {
      setIsGeneratingBracket(false);
    }
  }, [selectedThirdPlaces, getThirdPlaceTeams, generateBracket]);

  const bracketChampion = useMemo(() => {
    const final = bracketMatches['5-1'];
    if (!final || !final.winner) return undefined;
    return final.teamA?.code === final.winner ? final.teamA : final.teamB;
  }, [bracketMatches]);

  const resetBracketError = useCallback(() => {
    setBracketError(false);
  }, []);

  return {
    activeTab,
    setActiveTab,
    resultsMode,
    setResultsMode: handleResultsModeChange,
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
  };
};
