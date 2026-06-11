import { useState, useCallback, useMemo } from 'react';
import { getAllGroups, getGroupMatches } from '../../../shared/data/teams';
import type { ThirdPlaceTeam } from '../models';

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
    setScores((prev) => {
      const current = prev[matchId];

      if (goalsA === 0 && goalsB === 0 && !current) {
        return prev;
      }

      return {
        ...prev,
        [matchId]: { matchId, goalsA, goalsB },
      };
    });
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
      setViewState('loading');
      setTimeout(() => {
        setActiveTab('brackets');
        setViewState('idle');
      }, 800);
    }
  }, [resultsMode, isReadyForBrackets, getThirdPlaceTeams]);

  const confirmThirdPlaces = useCallback(() => {
    if (selectedThirdPlaces.length !== 8) return;
    setIsThirdPlacesModalOpen(false);
    setViewState('loading');
    setTimeout(() => {
      setActiveTab('brackets');
      setViewState('idle');
    }, 800);
  }, [selectedThirdPlaces]);

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
  };
};
