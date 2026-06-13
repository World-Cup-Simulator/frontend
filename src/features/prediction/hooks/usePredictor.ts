import { useState, useCallback, useMemo } from 'react';
import { getAllGroups, getGroupMatches } from '../../../shared/data/teams';
import type { ThirdPlaceTeam, BracketMatch, TeamStanding } from '../models';
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

type ActiveTab = 'groups' | 'brackets';
type ResultsMode = 'with-results' | 'no-results';
type ViewState = 'idle' | 'loading';

interface ScoreEntry {
  matchId: string;
  goalsA: number;
  goalsB: number;
}

export const usePredictor = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('groups');
  const [resultsMode, setResultsMode] = useState<ResultsMode>('no-results');
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [isThirdPlacesModalOpen, setIsThirdPlacesModalOpen] = useState(false);

  const groupsData = useMemo(() => getAllGroups(), []);

  const [clickOrders, setClickOrders] = useState<Record<string, string[]>>(() =>
    createInitialClickOrders(groupsData)
  );

  const [scores, setScores] = useState<Record<string, ScoreEntry>>({});

  const [selectedThirdPlaces, setSelectedThirdPlaces] = useState<string[]>([]);

  const [bracketMatches, setBracketMatches] = useState<Record<string, BracketMatch>>({});

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

  const handleScoreChange = useCallback((matchId: string, goalsA: number, goalsB: number) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: { matchId, goalsA, goalsB },
    }));
  }, []);

  /** Compute the current standings for a group based on entered scores. */
  const calculateStandings = useCallback((groupIndex: number): TeamStanding[] => {
    const group = groupsData[groupIndex];
    const standings = createEmptyStandings(group.teams);

    const matches = getGroupMatches(groupIndex);
    matches.forEach((m) => {
      const score = scores[m.matchId];
      if (!score) return;
      applyMatchResult(standings, m, score);
    });

    return sortStandings(standings);
  }, [groupsData, scores]);

  const isReadyForBrackets = useMemo(() => {
    if (resultsMode === 'no-results') {
      return groupsData.every((g) => (clickOrders[g.groupCode] || []).length === 4);
    }
    const totalMatches = groupsData.reduce((sum, _, idx) => sum + getGroupMatches(idx).length, 0);
    return Object.keys(scores).length === totalMatches;
  }, [resultsMode, groupsData, clickOrders, scores]);

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
  const generateBracket = useCallback((thirdPlaceCodes: string[]) => {
    const matches = buildEmptyBracket();

    const r32Defs = [
      { key: 1, teamASource: '1E', teamBSource: '3', thirdPlaceIdx: 0, nextMatchId: '2-1' },
      { key: 2, teamASource: '1I', teamBSource: '3', thirdPlaceIdx: 1, nextMatchId: '2-1' },
      { key: 3, teamASource: '2A', teamBSource: '2B', nextMatchId: '2-2' },
      { key: 4, teamASource: '1F', teamBSource: '2C', nextMatchId: '2-2' },
      { key: 5, teamASource: '2K', teamBSource: '2L', nextMatchId: '2-3' },
      { key: 6, teamASource: '1H', teamBSource: '2J', nextMatchId: '2-3' },
      { key: 7, teamASource: '1D', teamBSource: '3', thirdPlaceIdx: 2, nextMatchId: '2-4' },
      { key: 8, teamASource: '1G', teamBSource: '3', thirdPlaceIdx: 3, nextMatchId: '2-4' },
      { key: 9, teamASource: '1C', teamBSource: '2F', nextMatchId: '2-5' },
      { key: 10, teamASource: '2E', teamBSource: '2I', nextMatchId: '2-5' },
      { key: 11, teamASource: '1A', teamBSource: '3', thirdPlaceIdx: 4, nextMatchId: '2-6' },
      { key: 12, teamASource: '1L', teamBSource: '3', thirdPlaceIdx: 5, nextMatchId: '2-6' },
      { key: 13, teamASource: '1J', teamBSource: '2H', nextMatchId: '2-7' },
      { key: 14, teamASource: '2D', teamBSource: '2G', nextMatchId: '2-7' },
      { key: 15, teamASource: '1B', teamBSource: '3', thirdPlaceIdx: 6, nextMatchId: '2-8' },
      { key: 16, teamASource: '1K', teamBSource: '3', thirdPlaceIdx: 7, nextMatchId: '2-8' },
    ];

    r32Defs.forEach((def) => {
      const id = `1-${def.key}`;
      const teamA = resolveTeamFromSource(def.teamASource, groupsData, clickOrders, resultsMode, calculateStandings);
      const teamB = def.thirdPlaceIdx !== undefined
        ? findTeamInGroups(thirdPlaceCodes[def.thirdPlaceIdx], groupsData)
        : resolveTeamFromSource(def.teamBSource, groupsData, clickOrders, resultsMode, calculateStandings);

      const teamBSourceLabel = def.thirdPlaceIdx !== undefined
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
  const handleBuildBrackets = useCallback(() => {
    if (!isReadyForBrackets) return;

    if (resultsMode === 'no-results') {
      setIsThirdPlacesModalOpen(true);
      return;
    }

    const thirdPlaces = getThirdPlaceTeams();
    const autoSelected = selectTopThirdPlaces(thirdPlaces);

    setSelectedThirdPlaces(autoSelected);
    generateBracket(autoSelected);
    setViewState('loading');
    setTimeout(() => {
      setActiveTab('brackets');
      setViewState('idle');
    }, 800);
  }, [resultsMode, isReadyForBrackets, getThirdPlaceTeams, generateBracket]);

  const confirmThirdPlaces = useCallback(() => {
    if (selectedThirdPlaces.length !== 8) return;
    setIsThirdPlacesModalOpen(false);
    generateBracket(selectedThirdPlaces);
    setViewState('loading');
    setTimeout(() => {
      setActiveTab('brackets');
      setViewState('idle');
    }, 800);
  }, [selectedThirdPlaces, generateBracket]);

  const bracketChampion = useMemo(() => {
    const final = bracketMatches['5-1'];
    if (!final || !final.winner) return undefined;
    return final.teamA?.code === final.winner ? final.teamA : final.teamB;
  }, [bracketMatches]);

  return {
    activeTab,
    setActiveTab,
    resultsMode,
    setResultsMode: handleResultsModeChange,
    viewState,
    isThirdPlacesModalOpen,
    setIsThirdPlacesModalOpen,
    groupsData,
    clickOrders,
    scores,
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
  };
};
