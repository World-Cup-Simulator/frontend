import { useState } from 'react';
import { MatchNode } from './MatchNode';
import { ChampionBanner } from '../../../../shared/components/ChampionBanner';
import type { BracketMatch, BracketTeam } from '../../models';
import { stageLabels, collectMatches } from '../../utils/bracketViewUtils';

interface TournamentBracketProps {
  bracketMatches: Record<string, BracketMatch>;
  bracketChampion?: BracketTeam;
  resultsMode: 'no-results' | 'with-results';
  advanceTeam: (matchId: string, teamCode: string) => void;
  updateBracketScore: (matchId: string, goalsA: number, goalsB: number) => void;
  resetBracket: () => void;
  resetAllPredictions: () => void;
  onGoToGroups: () => void;
}

/** Calculate tabIndex for match inputs to ensure logical tab navigation by round */
const getMatchTabIndices = (stage: number, key: number): { teamA: number; teamB: number } => {
  // Calculate base offset for each stage
  // R32 (stage 1): keys 1-16, indices 1-32
  // R16 (stage 2): keys 1-8, indices 33-48
  // QF (stage 3): keys 1-4, indices 49-56
  // SF (stage 4): keys 1-2, indices 57-60
  // Final (stage 5): key 1, indices 61-62
  const stageOffsets: Record<number, number> = {
    1: 0,    // R32 starts at 1
    2: 32,   // R16 starts at 33
    3: 48,   // QF starts at 49
    4: 56,   // SF starts at 57
    5: 60,   // Final starts at 61
  };

  const baseOffset = stageOffsets[stage] || 0;
  const teamAIndex = baseOffset + (key - 1) * 2 + 1;
  const teamBIndex = baseOffset + (key - 1) * 2 + 2;

  return { teamA: teamAIndex, teamB: teamBIndex };
};

export const TournamentBracket = ({
  bracketMatches,
  bracketChampion,
  resultsMode,
  advanceTeam,
  updateBracketScore,
  resetBracket,
  resetAllPredictions,
  onGoToGroups,
}: TournamentBracketProps) => {
  const [mobileRound, setMobileRound] = useState(1);

  const hasBracket = Object.keys(bracketMatches).length > 0;

  const topR32 = collectMatches(bracketMatches, 1, [1, 2, 3, 4, 5, 6, 7, 8]);
  const topR16 = collectMatches(bracketMatches, 2, [1, 2, 3, 4]);
  const topQF = collectMatches(bracketMatches, 3, [1, 2]);
  const topSF = collectMatches(bracketMatches, 4, [1]);

  const botR32 = collectMatches(bracketMatches, 1, [9, 10, 11, 12, 13, 14, 15, 16]);
  const botR16 = collectMatches(bracketMatches, 2, [5, 6, 7, 8]);
  const botQF = collectMatches(bracketMatches, 3, [3, 4]);
  const botSF = collectMatches(bracketMatches, 4, [2]);

  const finalMatch = bracketMatches['5-1'];

  const mobileMatches = Object.values(bracketMatches).filter((m) => m.stage === mobileRound);

  if (!hasBracket) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-full max-w-md bg-zinc-800/30 rounded-2xl border border-zinc-700/50 p-8 flex flex-col items-center text-center gap-4">
          <p className="text-zinc-400 text-sm">
            Todavía no generaste las llaves. Completá la fase de grupos y hacé click en "Armar Llaves".
          </p>
          <button
            type="button"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all duration-200"
            onClick={onGoToGroups}
          >
            Ir a Grupos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-zinc-100">Llaves del Torneo</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg border border-zinc-700/50 transition-all duration-200"
            onClick={resetBracket}
          >
            Reiniciar Llaves
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg border border-zinc-700/50 transition-all duration-200"
            onClick={resetAllPredictions}
          >
            Reiniciar Grupos
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:grid grid-cols-5 gap-4">
        {/* Top Half */}
        <div className="flex flex-col gap-2 justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-1">{stageLabels[1]}</span>
          {topR32.map((match) => {
            const indices = getMatchTabIndices(match.stage, match.key);
            return (
              <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} teamAInputTabIndex={indices.teamA} teamBInputTabIndex={indices.teamB} />
            );
          })}
        </div>
        <div className="flex flex-col gap-6 justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-1">{stageLabels[2]}</span>
          {topR16.map((match) => {
            const indices = getMatchTabIndices(match.stage, match.key);
            return (
              <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} teamAInputTabIndex={indices.teamA} teamBInputTabIndex={indices.teamB} />
            );
          })}
        </div>
        <div className="flex flex-col gap-12 justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-1">{stageLabels[3]}</span>
          {topQF.map((match) => {
            const indices = getMatchTabIndices(match.stage, match.key);
            return (
              <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} teamAInputTabIndex={indices.teamA} teamBInputTabIndex={indices.teamB} />
            );
          })}
        </div>
        <div className="flex flex-col gap-24 justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-1">{stageLabels[4]}</span>
          {topSF.map((match) => {
            const indices = getMatchTabIndices(match.stage, match.key);
            return (
              <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} teamAInputTabIndex={indices.teamA} teamBInputTabIndex={indices.teamB} />
            );
          })}
        </div>

        {/* Final – spans both rows and centers vertically */}
        <div className="row-span-2 flex flex-col justify-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center">{stageLabels[5]}</span>
          {finalMatch && (
            <MatchNode
              match={finalMatch}
              mode={resultsMode}
              onTeamClick={advanceTeam}
              onScoreChange={updateBracketScore}
              teamAInputTabIndex={61}
              teamBInputTabIndex={62}
            />
          )}
          {bracketChampion && <ChampionBanner champion={bracketChampion} />}
        </div>

        {/* Bottom Half */}
        <div className="flex flex-col gap-2 justify-center">
          {botR32.map((match) => {
            const indices = getMatchTabIndices(match.stage, match.key);
            return (
              <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} teamAInputTabIndex={indices.teamA} teamBInputTabIndex={indices.teamB} />
            );
          })}
        </div>
        <div className="flex flex-col gap-6 justify-center">
          {botR16.map((match) => {
            const indices = getMatchTabIndices(match.stage, match.key);
            return (
              <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} teamAInputTabIndex={indices.teamA} teamBInputTabIndex={indices.teamB} />
            );
          })}
        </div>
        <div className="flex flex-col gap-12 justify-center">
          {botQF.map((match) => {
            const indices = getMatchTabIndices(match.stage, match.key);
            return (
              <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} teamAInputTabIndex={indices.teamA} teamBInputTabIndex={indices.teamB} />
            );
          })}
        </div>
        <div className="flex flex-col gap-24 justify-center">
          {botSF.map((match) => {
            const indices = getMatchTabIndices(match.stage, match.key);
            return (
              <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} teamAInputTabIndex={indices.teamA} teamBInputTabIndex={indices.teamB} />
            );
          })}
        </div>
      </div>

      {/* Mobile View */}
      <div className="flex md:hidden flex-col gap-4">
        {/* Round Selector */}
        <div className="flex overflow-x-auto gap-1 pb-1">
          {[1, 2, 3, 4, 5].map((stage) => (
            <button
              key={stage}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200
                ${mobileRound === stage
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }
              `}
              onClick={() => setMobileRound(stage)}
            >
              {stageLabels[stage]}
            </button>
          ))}
        </div>

        {/* Mobile Matches */}
        <div className="flex flex-col gap-3">
          {mobileMatches.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-8">No hay partidos en esta ronda</p>
          )}
          {mobileMatches.map((match) => (
            <MatchNode
              key={match.id}
              match={match}
              mode={resultsMode}
              onTeamClick={advanceTeam}
              onScoreChange={updateBracketScore}
            />
          ))}
          {mobileRound === 5 && bracketChampion && (
            <ChampionBanner champion={bracketChampion} />
          )}
        </div>
      </div>
    </div>
  );
};
