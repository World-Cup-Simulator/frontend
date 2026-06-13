import { useState, useCallback, useMemo } from 'react';
import { getAllGroups, getGroupMatches } from '../../../shared/data/teams';
import type { SimulatedGroup, SimulatedBracket, SimulationPhase, SimulationMode } from '../models';
import {
  buildRandomGroupMatch,
  buildRandomKnockoutMatch,
  getMatchCountForStage,
} from '../utils/simMatchUtils';
import { createEmptySimStandings, applySimMatchResult, sortSimStandings } from '../utils/simStandingsUtils';

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

  /** Run a mock group stage and derive standings from the random results. */
  const simulateGroups = useCallback(() => {
    setViewState('loading');

    setTimeout(() => {
      const simulated: SimulatedGroup[] = groupsData.map((group) => {
        const matches = getGroupMatches(groupsData.indexOf(group));

        const simulatedMatches = matches.map((m) =>
          buildRandomGroupMatch(m.matchId, m.teamA.code, m.teamB.code, m.date, group.groupCode)
        );

        const standings = createEmptySimStandings(group.teams);
        simulatedMatches.forEach((m) => applySimMatchResult(standings, m));

        const sorted = sortSimStandings(standings);

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

  /** Run a mock knockout stage with randomised bracket results. */
  const simulateBrackets = useCallback(() => {
    setViewState('loading');

    setTimeout(() => {
      const champion = groupsData[0].teams[0].code;
      const matches: Record<string, import('../models').SimulatedMatch> = {};

      for (let stage = 1; stage <= 5; stage++) {
        const matchCount = getMatchCountForStage(stage);
        for (let key = 1; key <= matchCount; key++) {
          const id = `${stage}-${key}`;
          matches[id] = buildRandomKnockoutMatch(
            id,
            groupsData[0].teams[0].code,
            groupsData[1].teams[0].code,
            '2026-07-01'
          );
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
      return;
    }

    if (phase === 'groups-simulated') {
      simulateBrackets();
      return;
    }

    resetSimulation();
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
