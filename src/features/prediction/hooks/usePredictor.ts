import { useState, useCallback, useMemo } from 'react';
import { getAllGroups, getGroupMatches } from '../../../shared/data/teams';
import type { ThirdPlaceTeam, BracketMatch, BracketTeam } from '../models';

type ActiveTab = 'groups' | 'brackets';
type ResultsMode = 'with-results' | 'no-results';
type ViewState = 'idle' | 'loading';

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

interface MatchScore {
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

  const [clickOrders, setClickOrders] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    groupsData.forEach((g) => {
      initial[g.groupCode] = [];
    });
    return initial;
  });

  const [scores, setScores] = useState<Record<string, MatchScore>>({});

  const [selectedThirdPlaces, setSelectedThirdPlaces] = useState<string[]>([]);

  const [bracketMatches, setBracketMatches] = useState<Record<string, BracketMatch>>({});

  const handleResultsModeChange = useCallback((mode: ResultsMode) => {
    setResultsMode(mode);
    setClickOrders(() => {
      const initial: Record<string, string[]> = {};
      groupsData.forEach((g) => {
        initial[g.groupCode] = [];
      });
      return initial;
    });
    setScores({});
    setSelectedThirdPlaces([]);
    setBracketMatches({});
  }, [groupsData]);

  const handleTeamClick = useCallback((groupCode: string, teamCode: string) => {
    setClickOrders((prev) => {
      const current = prev[groupCode] || [];
      if (current.includes(teamCode)) {
        return {
          ...prev,
          [groupCode]: current.filter((c) => c !== teamCode),
        };
      }
      if (current.length >= 4) {
        return prev;
      }
      return {
        ...prev,
        [groupCode]: [...current, teamCode],
      };
    });
  }, []);

  const handleScoreChange = useCallback((matchId: string, goalsA: number, goalsB: number) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: { matchId, goalsA, goalsB },
    }));
  }, []);

  const calculateStandings = useCallback((groupIndex: number): TeamStanding[] => {
    const group = groupsData[groupIndex];

    const standings: Record<string, TeamStanding> = {};
    group.teams.forEach((t) => {
      standings[t.code] = {
        teamCode: t.code,
        teamName: t.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        gc: 0,
        dg: 0,
        points: 0,
      };
    });

    const matches = getGroupMatches(groupIndex);
    matches.forEach((m) => {
      const score = scores[m.matchId];
      if (!score) return;

      const teamA = standings[m.teamA.code];
      const teamB = standings[m.teamB.code];

      if (!teamA || !teamB) return;

      teamA.played += 1;
      teamB.played += 1;
      teamA.gf += score.goalsA;
      teamA.gc += score.goalsB;
      teamB.gf += score.goalsB;
      teamB.gc += score.goalsA;

      if (score.goalsA > score.goalsB) {
        teamA.won += 1;
        teamA.points += 3;
        teamB.lost += 1;
      } else if (score.goalsA < score.goalsB) {
        teamB.won += 1;
        teamB.points += 3;
        teamA.lost += 1;
      } else {
        teamA.drawn += 1;
        teamA.points += 1;
        teamB.drawn += 1;
        teamB.points += 1;
      }
    });

    Object.values(standings).forEach((s) => {
      s.dg = s.gf - s.gc;
    });

    return Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.gf - a.gf;
    });
  }, [groupsData, scores]);

  const isReadyForBrackets = useMemo(() => {
    if (resultsMode === 'no-results') {
      return groupsData.every((g) => (clickOrders[g.groupCode] || []).length === 4);
    }
    const totalMatches = groupsData.reduce((sum, _, idx) => sum + getGroupMatches(idx).length, 0);
    return Object.keys(scores).length === totalMatches;
  }, [resultsMode, groupsData, clickOrders, scores]);

  const getThirdPlaceTeams = useCallback((): ThirdPlaceTeam[] => {
    const thirdPlaces: ThirdPlaceTeam[] = [];

    groupsData.forEach((g, index) => {
      if (resultsMode === 'with-results') {
        const standings = calculateStandings(index);
        if (standings[2]) {
          thirdPlaces.push({
            teamCode: standings[2].teamCode,
            teamName: standings[2].teamName,
            groupCode: g.groupCode,
            points: standings[2].points,
            gf: standings[2].gf,
            gc: standings[2].gc,
            dg: standings[2].dg,
            selected: selectedThirdPlaces.includes(standings[2].teamCode),
          });
        }
      } else {
        const order = clickOrders[g.groupCode] || [];
        if (order[2]) {
          const team = g.teams.find((t) => t.code === order[2]);
          if (team) {
            thirdPlaces.push({
              teamCode: team.code,
              teamName: team.name,
              groupCode: g.groupCode,
              points: 0,
              gf: 0,
              gc: 0,
              dg: 0,
              selected: selectedThirdPlaces.includes(team.code),
            });
          }
        }
      }
    });

    return thirdPlaces;
  }, [groupsData, resultsMode, calculateStandings, clickOrders, selectedThirdPlaces]);

  const toggleThirdPlace = useCallback((teamCode: string) => {
    setSelectedThirdPlaces((prev) => {
      if (prev.includes(teamCode)) {
        return prev.filter((c) => c !== teamCode);
      }
      if (prev.length >= 8) {
        return prev;
      }
      return [...prev, teamCode];
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /* Bracket Logic                                                       */
  /* ------------------------------------------------------------------ */

  function clearDownstream(matches: Record<string, BracketMatch>, startMatchId: string): Record<string, BracketMatch> {
    const startMatch = matches[startMatchId];
    if (!startMatch || !startMatch.nextMatchId) return matches;

    const nextId = startMatch.nextMatchId;
    const nextMatch = matches[nextId];
    if (!nextMatch) return matches;

    const updated: Record<string, BracketMatch> = {
      ...matches,
      [nextId]: {
        ...nextMatch,
        goalsA: undefined,
        goalsB: undefined,
        winner: undefined,
        isTieBreaker: undefined,
      },
    };

    return clearDownstream(updated, nextId);
  }

  const generateBracket = useCallback((thirdPlaceCodes: string[]) => {
    const matches: Record<string, BracketMatch> = {};

    const getTeamInfo = (teamCode: string): BracketTeam | undefined => {
      for (const g of groupsData) {
        const team = g.teams.find((t) => t.code === teamCode);
        if (team) {
          return { code: team.code, name: team.name, flagCode: team.flagCode };
        }
      }
      return undefined;
    };

    const getTeamFromSource = (source: string): BracketTeam | undefined => {
      const position = parseInt(source[0], 10);
      const groupCode = source[1];
      const groupIdx = groupCode.charCodeAt(0) - 65;
      const group = groupsData[groupIdx];
      if (!group) return undefined;

      if (resultsMode === 'no-results') {
        const order = clickOrders[groupCode] || [];
        const teamCode = order[position - 1];
        if (!teamCode) return undefined;
        return getTeamInfo(teamCode);
      }

      const standings = calculateStandings(groupIdx);
      const standing = standings[position - 1];
      if (!standing) return undefined;
      return getTeamInfo(standing.teamCode);
    };

    const getThirdPlaceGroupCode = (teamCode: string): string => {
      for (const g of groupsData) {
        if (g.teams.some((t) => t.code === teamCode)) {
          return g.groupCode;
        }
      }
      return '';
    };

    // R32 match definitions: key, teamA source, teamB source, thirdPlace index (if teamB is 3rd), nextMatchId
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
      const teamA = getTeamFromSource(def.teamASource);
      const teamB = def.thirdPlaceIdx !== undefined
        ? getTeamInfo(thirdPlaceCodes[def.thirdPlaceIdx])
        : getTeamFromSource(def.teamBSource);

      const teamBSourceLabel = def.thirdPlaceIdx !== undefined
        ? (teamB ? `3${getThirdPlaceGroupCode(teamB.code)}` : '3')
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

    // R16
    for (let key = 1; key <= 8; key++) {
      const id = `2-${key}`;
      matches[id] = {
        id,
        stage: 2,
        key,
        nextMatchId: `3-${Math.ceil(key / 2)}`,
      };
    }

    // QF
    for (let key = 1; key <= 4; key++) {
      const id = `3-${key}`;
      matches[id] = {
        id,
        stage: 3,
        key,
        nextMatchId: `4-${Math.ceil(key / 2)}`,
      };
    }

    // SF
    for (let key = 1; key <= 2; key++) {
      const id = `4-${key}`;
      matches[id] = {
        id,
        stage: 4,
        key,
        nextMatchId: '5-1',
      };
    }

    // Final
    matches['5-1'] = {
      id: '5-1',
      stage: 5,
      key: 1,
      nextMatchId: null,
    };

    setBracketMatches(matches);
  }, [groupsData, clickOrders, resultsMode, calculateStandings]);

  const advanceTeam = useCallback((matchId: string, teamCode: string) => {
    setBracketMatches((prev) => {
      const match = prev[matchId];
      if (!match) return prev;

      const winnerTeam = teamCode === match.teamA?.code ? match.teamA : match.teamB;
      if (!winnerTeam) return prev;

      let updated: Record<string, BracketMatch> = {
        ...prev,
        [matchId]: {
          ...match,
          winner: teamCode,
          isTieBreaker: false,
        },
      };

      if (match.nextMatchId) {
        const nextMatch = updated[match.nextMatchId];
        if (nextMatch) {
          const slot = match.key % 2 === 1 ? 'teamA' : 'teamB';
          updated = {
            ...updated,
            [match.nextMatchId]: {
              ...nextMatch,
              [slot]: winnerTeam,
            },
          };
        }
        updated = clearDownstream(updated, matchId);
      }

      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      let updated: Record<string, BracketMatch> = {
        ...prev,
        [matchId]: {
          ...match,
          goalsA,
          goalsB,
          winner,
          isTieBreaker,
        },
      };

      if (winner && winnerTeam && match.nextMatchId) {
        const nextMatch = updated[match.nextMatchId];
        if (nextMatch) {
          const slot = match.key % 2 === 1 ? 'teamA' : 'teamB';
          updated = {
            ...updated,
            [match.nextMatchId]: {
              ...nextMatch,
              [slot]: winnerTeam,
            },
          };
        }
        updated = clearDownstream(updated, matchId);
      }

      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetBracket = useCallback(() => {
    setBracketMatches((prev) => {
      const updated: Record<string, BracketMatch> = {};
      Object.values(prev).forEach((match) => {
        if (match.stage === 1) {
          // Keep R32 team assignments, clear results only
          updated[match.id] = {
            ...match,
            goalsA: undefined,
            goalsB: undefined,
            winner: undefined,
            isTieBreaker: undefined,
          };
        } else {
          // Clear teams and results from later rounds
          updated[match.id] = {
            ...match,
            teamA: undefined,
            teamB: undefined,
            goalsA: undefined,
            goalsB: undefined,
            winner: undefined,
            isTieBreaker: undefined,
          };
        }
      });
      return updated;
    });
  }, []);

  const resetAllPredictions = useCallback(() => {
    setActiveTab('groups');
    setClickOrders(() => {
      const initial: Record<string, string[]> = {};
      groupsData.forEach((g) => {
        initial[g.groupCode] = [];
      });
      return initial;
    });
    setScores({});
    setSelectedThirdPlaces([]);
    setBracketMatches({});
  }, [groupsData]);

  const handleBuildBrackets = useCallback(() => {
    if (!isReadyForBrackets) return;

    if (resultsMode === 'no-results') {
      setIsThirdPlacesModalOpen(true);
    } else {
      const thirdPlaces = getThirdPlaceTeams();
      const autoSelected = thirdPlaces
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.dg !== a.dg) return b.dg - a.dg;
          return b.gf - a.gf;
        })
        .slice(0, 8)
        .map((t) => t.teamCode);

      setSelectedThirdPlaces(autoSelected);
      generateBracket(autoSelected);
      setViewState('loading');
      setTimeout(() => {
        setActiveTab('brackets');
        setViewState('idle');
      }, 800);
    }
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
