import { useState, useCallback, useMemo } from 'react';
import { getAllGroups, getGroupMatches } from '../../../shared/data/teams';
import type { SimulatedGroup, SimulatedBracket, SimulatedMatch, SimulationPhase, SimulationMode } from '../models';

type ActiveTab = 'groups' | 'brackets';
type ResultsMode = 'with-results' | 'no-results';
type ViewState = 'idle' | 'loading';

export const useSimulator = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('groups');
  const [resultsMode, setResultsMode] = useState<ResultsMode>('no-results');
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('simple');
  const [phase, setPhase] = useState<SimulationPhase>('idle');
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [groupData, setGroupData] = useState<SimulatedGroup[]>([]);
  const [bracketData, setBracketData] = useState<SimulatedBracket | null>(null);

  const groupsData = useMemo(() => getAllGroups(), []);

  const resetToIdle = useCallback(() => {
    setPhase('idle');
    setGroupData([]);
    setBracketData(null);
  }, []);

  const handleResultsModeChange = useCallback((mode: ResultsMode) => {
    setResultsMode(mode);
    // Constraint: no-results forces simple mode
    if (mode === 'no-results') {
      setSimulationMode('simple');
    }
    // Reset simulation if already run and user changes mode
    if (phase !== 'idle') {
      resetToIdle();
    }
  }, [phase, resetToIdle]);

  const handleSimulationModeChange = useCallback((mode: SimulationMode) => {
    setSimulationMode(mode);
    // Constraint: adaptive mode forces with-results
    if (mode === 'adaptive') {
      setResultsMode('with-results');
    }
    // Reset simulation if already run and user changes mode
    if (phase !== 'idle') {
      resetToIdle();
    }
  }, [phase, resetToIdle]);

  // Mock group simulation
  const simulateGroups = useCallback(() => {
    setViewState('loading');

    setTimeout(() => {
      const simulated: SimulatedGroup[] = groupsData.map((group) => {
        const matches = getGroupMatches(groupsData.indexOf(group));
        const simulatedMatches: SimulatedMatch[] = matches.map((m) => {
          const goalsA = Math.floor(Math.random() * 4);
          const goalsB = Math.floor(Math.random() * 4);
          let winner: 'A' | 'B' | 'draw';
          if (goalsA > goalsB) winner = 'A';
          else if (goalsB > goalsA) winner = 'B';
          else winner = 'draw';

          return {
            matchId: m.matchId,
            groupCode: group.groupCode,
            teamA: m.teamA.code,
            teamB: m.teamB.code,
            goalsA,
            goalsB,
            winner,
            date: m.date,
            outcomeProbability: Math.floor(Math.random() * 40) + 50,
            scoreProbability: Math.floor(Math.random() * 30) + 10,
            decidedByPenalties: false,
            teamAWinProbability: Math.floor(Math.random() * 40) + 30,
            teamBWinProbability: Math.floor(Math.random() * 40) + 30,
          };
        });

        // Calculate standings from simulated matches
        const standings: Record<string, { code: string; points: number; gf: number; gc: number; dg: number }> = {};
        group.teams.forEach((t) => {
          standings[t.code] = { code: t.code, points: 0, gf: 0, gc: 0, dg: 0 };
        });

        simulatedMatches.forEach((m) => {
          const teamA = standings[m.teamA];
          const teamB = standings[m.teamB];
          if (!teamA || !teamB) return;

          teamA.gf += m.goalsA;
          teamA.gc += m.goalsB;
          teamB.gf += m.goalsB;
          teamB.gc += m.goalsA;

          if (m.winner === 'A') teamA.points += 3;
          else if (m.winner === 'B') teamB.points += 3;
          else { teamA.points += 1; teamB.points += 1; }
        });

        Object.values(standings).forEach((s) => { s.dg = s.gf - s.gc; });

        const sorted = Object.values(standings).sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.dg !== a.dg) return b.dg - a.dg;
          return b.gf - a.gf;
        });

        return {
          groupCode: group.groupCode,
          standings: sorted.map((s, idx) => ({
            teamCode: s.code,
            position: idx + 1,
            points: s.points,
            dg: s.dg,
            gf: s.gf,
            gc: s.gc,
            winProbability: Math.floor(Math.random() * 30) + 60 - idx * 15,
          })),
          matches: simulatedMatches,
        };
      });

      setGroupData(simulated);
      setPhase('groups-simulated');
      setViewState('idle');
    }, 1200);
  }, [groupsData]);

  // Mock bracket simulation
  const simulateBrackets = useCallback(() => {
    setViewState('loading');

    setTimeout(() => {
      const champion = groupsData[0].teams[0].code;
      const matches: Record<string, SimulatedMatch> = {};

      for (let i = 1; i <= 5; i++) {
        const matchCount = i === 1 ? 16 : i === 2 ? 8 : i === 3 ? 4 : i === 4 ? 2 : 1;
        for (let k = 1; k <= matchCount; k++) {
          const id = `${i}-${k}`;
          const goalsA = Math.floor(Math.random() * 3);
          const goalsB = Math.floor(Math.random() * 3);
          let winner: 'A' | 'B' | 'draw';
          if (goalsA > goalsB) winner = 'A';
          else if (goalsB > goalsA) winner = 'B';
          else winner = 'draw';

          matches[id] = {
            matchId: id,
            teamA: groupsData[0].teams[0].code,
            teamB: groupsData[1].teams[0].code,
            goalsA,
            goalsB,
            winner,
            date: '2026-07-01',
            outcomeProbability: Math.floor(Math.random() * 40) + 50,
            scoreProbability: Math.floor(Math.random() * 30) + 10,
            decidedByPenalties: winner === 'draw' && Math.random() > 0.5,
            teamAWinProbability: Math.floor(Math.random() * 40) + 30,
            teamBWinProbability: Math.floor(Math.random() * 40) + 30,
          };
        }
      }

      setBracketData({
        matches,
        champion,
        championProbability: Math.floor(Math.random() * 30) + 60,
      });
      setPhase('complete');
      setActiveTab('brackets');
      setViewState('idle');
    }, 1200);
  }, [groupsData]);

  const resetSimulation = useCallback(() => {
    setPhase('idle');
    setGroupData([]);
    setBracketData(null);
    setActiveTab('groups');
  }, []);

  const handleSimulate = useCallback(() => {
    if (phase === 'idle') {
      simulateGroups();
    } else if (phase === 'groups-simulated') {
      simulateBrackets();
    } else {
      resetSimulation();
    }
  }, [phase, simulateGroups, simulateBrackets, resetSimulation]);

  const buttonLabel = useMemo(() => {
    if (phase === 'idle') return 'Simular Grupos';
    if (phase === 'groups-simulated') return 'Simular Finales';
    return 'Reiniciar';
  }, [phase]);

  const isLocked = phase === 'complete';

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
    isLocked,
  };
};
