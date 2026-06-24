import { useMemo } from 'react';
import { FlagImage } from '../../../shared/components/FlagImage';
import type { SimulatedGroup, SimulatedMatch } from '../models';
import { MatchCard } from './MatchCard';

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

interface HookMatch {
  matchId: number;
  teamA: { code: string; name: string; flagCode: string };
  teamB: { code: string; name: string; flagCode: string };
  date: string;
  goalsA: number | null;
  goalsB: number | null;
  played: boolean;
}

interface SimulationGroupViewProps {
  group: { groupCode: string; teams: { code: string; name: string; flagCode: string }[] };
  simulatedGroup?: SimulatedGroup;
  resultsMode: 'with-results' | 'no-results';
  allMatches?: HookMatch[];
  initialStandings?: TeamStanding[];
}

/** Map a standing position to a Tailwind background highlight class. */
const getRowBg = (position: number): string => {
  if (position === 0) return 'bg-yellow-500/15';
  if (position === 1) return 'bg-zinc-400/15';
  if (position === 2) return 'bg-amber-700/20';
  return '';
};

/** Generate placeholder matches for an un-simulated group. */
const getEmptyMatches = (
  group: { groupCode: string; teams: { code: string; name: string; flagCode: string }[] }
): SimulatedMatch[] => {
  const matchups = [
    [0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2],
  ];
  return matchups.map((matchup, index) => ({
    matchId: `match-${group.groupCode}-${index}`,
    groupCode: group.groupCode,
    teamA: group.teams[matchup[0]].code,
    teamB: group.teams[matchup[1]].code,
    goalsA: 0,
    goalsB: 0,
    winner: 'draw' as const,
    date: '',
    outcomeProbability: 0,
    scoreProbability: 0,
    decidedByPenalties: false,
    teamAWinProbability: 0,
    teamBWinProbability: 0,
  }));
};

export const SimulationGroupView = ({ group, simulatedGroup, resultsMode, allMatches, initialStandings }: SimulationGroupViewProps) => {
  // Build lookup map by team name for post-simulation lookups
  const teamByName = useMemo(() => {
    const map: Record<string, typeof group.teams[0]> = {};
    group.teams.forEach((t) => {
      map[t.name] = t;
    });
    return map;
  }, [group]);

  // Get team info - use name lookup after simulation, code lookup before
  const getTeamInfo = (code: string) => {
    if (simulatedGroup) {
      // After simulation, code is actually the team name
      return teamByName[code];
    }
    // Before simulation, lookup by FIFA code
    return group.teams.find((t) => t.code === code);
  };

  const tableGridCols = resultsMode === 'with-results'
    ? 'grid-cols-[28px_1fr_36px_36px_36px_36px]'
    : 'grid-cols-[28px_1fr_36px]';

  const hasSimulation = !!simulatedGroup;
  const hasMatches = (allMatches?.length ?? 0) > 0;

  // Build matches to display
  const matches = useMemo(() => {
    if (hasSimulation && simulatedGroup) {
      // After simulation: use merged matches from hook
      return simulatedGroup.matches;
    }

    if (!hasMatches || !allMatches) {
      // No matches data: show empty placeholders
      return getEmptyMatches(group);
    }

    // Use allMatches directly - they already have played flag and scores
    return allMatches.map((match) => ({
      matchId: String(match.matchId),
      groupCode: group.groupCode,
      teamA: match.teamA.name,
      teamB: match.teamB.name,
      goalsA: match.goalsA ?? 0,
      goalsB: match.goalsB ?? 0,
      winner: match.played
        ? ((match.goalsA ?? 0) > (match.goalsB ?? 0) ? 'A' as const : (match.goalsB ?? 0) > (match.goalsA ?? 0) ? 'B' as const : 'draw' as const)
        : 'draw' as const,
      date: match.date,
      outcomeProbability: 0,
      scoreProbability: 0,
      decidedByPenalties: false,
      played: match.played,
    }));
  }, [hasSimulation, simulatedGroup, hasMatches, allMatches, group]);

  return (
    <div className="flex flex-col bg-zinc-800/50 rounded-2xl border border-zinc-700/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-700/50">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
          Grupo {group.groupCode}
        </h3>
      </div>

      {/* Standings */}
      <div className="px-4 py-2">
        {/* Header */}
        <div className={`grid ${tableGridCols} gap-2 text-[10px] font-medium text-zinc-500 mb-1 px-1`}>
          <span>Pos</span>
          <span>Equipo</span>
          <span className="text-center">Pts</span>
          {resultsMode === 'with-results' && (
            <>
              <span className="text-center">DG</span>
              <span className="text-center">GF</span>
              <span className="text-center">GC</span>
            </>
          )}
        </div>

        {hasSimulation ? (
          // After simulation: use API standings
          simulatedGroup.standings.map((standing, index) => {
            const team = getTeamInfo(standing.teamCode);
            return (
              <div
                key={standing.teamCode}
                className={`grid ${tableGridCols} gap-2 items-center py-1.5 px-1 text-left rounded-lg transition-all duration-200
                  ${getRowBg(index)}
                `}
              >
                <span className="text-xs font-bold text-zinc-400 text-center">{standing.position}º</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  {team && <FlagImage code={team.code} alt={team.name} className="h-3.5 w-5 shrink-0" />}
                  <span className="text-xs font-medium text-zinc-200 truncate">{team?.name || standing.teamCode}</span>
                </div>
                <span className="text-xs font-bold text-zinc-100 text-center">{standing.points}</span>
                {resultsMode === 'with-results' && (
                  <>
                    <span className="text-xs text-zinc-300 text-center">{standing.dg}</span>
                    <span className="text-xs text-zinc-300 text-center">{standing.gf}</span>
                    <span className="text-xs text-zinc-300 text-center">{standing.gc}</span>
                  </>
                )}
              </div>
            );
          })
        ) : hasMatches && initialStandings ? (
          // Before simulation but has played matches: show calculated standings
          initialStandings.map((standing, index) => {
            const team = group.teams.find((t) => t.code === standing.teamCode);
            return (
              <div
                key={standing.teamCode}
                className={`grid ${tableGridCols} gap-2 items-center py-1.5 px-1 text-left rounded-lg transition-all duration-200
                  ${getRowBg(index)}
                `}
              >
                <span className="text-xs font-bold text-zinc-400 text-center">{index + 1}º</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  {team && <FlagImage code={team.code} alt={team.name} className="h-3.5 w-5 shrink-0" />}
                  <span className="text-xs font-medium text-zinc-200 truncate">{team?.name || standing.teamName}</span>
                </div>
                <span className="text-xs font-bold text-zinc-100 text-center">{standing.points}</span>
                {resultsMode === 'with-results' && (
                  <>
                    <span className="text-xs text-zinc-300 text-center">{standing.dg}</span>
                    <span className="text-xs text-zinc-300 text-center">{standing.gf}</span>
                    <span className="text-xs text-zinc-300 text-center">{standing.gc}</span>
                  </>
                )}
              </div>
            );
          })
        ) : (
          // No played matches: show empty placeholders
          group.teams.map((team, idx) => (
            <div key={team.code} className={`grid ${tableGridCols} gap-2 items-center py-1.5 px-1 text-left rounded-lg transition-all duration-200 ${getRowBg(idx)}`}>
              <span className="text-xs font-bold text-zinc-400 text-center">{idx + 1}º</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <FlagImage code={team.code} alt={team.name} className="h-3.5 w-5 shrink-0" />
                <span className="text-xs font-medium text-zinc-200 truncate">{team.name}</span>
              </div>
              <span className="text-xs text-zinc-500 text-center">-</span>
              {resultsMode === 'with-results' && (
                <>
                  <span className="text-xs text-zinc-500 text-center">-</span>
                  <span className="text-xs text-zinc-500 text-center">-</span>
                  <span className="text-xs text-zinc-500 text-center">-</span>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Matches - Always visible */}
      <div className="px-4 py-3 border-t border-zinc-700/50">
        <div className="flex flex-col gap-2">
          {matches.map((match) => (
            <MatchCard
              key={match.matchId}
              match={match}
              getTeamInfo={getTeamInfo}
              hasSimulation={hasSimulation}
              resultsMode={resultsMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
