import { useState } from 'react';
import { MatchNode } from './MatchNode';
import { ChampionBanner } from './ChampionBanner';
import type { BracketMatch, BracketTeam } from '../../models';

const stageLabels: Record<number, string> = {
  1: '16.º de final',
  2: '8.º de final',
  3: '4.º de final',
  4: 'Semifinal',
  5: 'Final',
};

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

  const getMatch = (stage: number, key: number): BracketMatch | undefined =>
    bracketMatches[`${stage}-${key}`];

  const topR32 = ([1, 2, 3, 4, 5, 6, 7, 8].map((k) => getMatch(1, k)).filter(Boolean) as BracketMatch[]);
  const topR16 = ([1, 2, 3, 4].map((k) => getMatch(2, k)).filter(Boolean) as BracketMatch[]);
  const topQF = ([1, 2].map((k) => getMatch(3, k)).filter(Boolean) as BracketMatch[]);
  const topSF = ([1].map((k) => getMatch(4, k)).filter(Boolean) as BracketMatch[]);

  const botR32 = ([9, 10, 11, 12, 13, 14, 15, 16].map((k) => getMatch(1, k)).filter(Boolean) as BracketMatch[]);
  const botR16 = ([5, 6, 7, 8].map((k) => getMatch(2, k)).filter(Boolean) as BracketMatch[]);
  const botQF = ([3, 4].map((k) => getMatch(3, k)).filter(Boolean) as BracketMatch[]);
  const botSF = ([2].map((k) => getMatch(4, k)).filter(Boolean) as BracketMatch[]);

  const finalMatch = getMatch(5, 1);

  const mobileMatches = (Object.values(bracketMatches) as BracketMatch[]).filter((m) => m.stage === mobileRound);

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
          {topR32.map((match) => (
            <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} />
          ))}
        </div>
        <div className="flex flex-col gap-6 justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-1">{stageLabels[2]}</span>
          {topR16.map((match) => (
            <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} />
          ))}
        </div>
        <div className="flex flex-col gap-12 justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-1">{stageLabels[3]}</span>
          {topQF.map((match) => (
            <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} />
          ))}
        </div>
        <div className="flex flex-col gap-24 justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-1">{stageLabels[4]}</span>
          {topSF.map((match) => (
            <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} />
          ))}
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
            />
          )}
          {bracketChampion && <ChampionBanner champion={bracketChampion} />}
        </div>

        {/* Bottom Half */}
        <div className="flex flex-col gap-2 justify-center">
          {botR32.map((match) => (
            <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} />
          ))}
        </div>
        <div className="flex flex-col gap-6 justify-center">
          {botR16.map((match) => (
            <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} />
          ))}
        </div>
        <div className="flex flex-col gap-12 justify-center">
          {botQF.map((match) => (
            <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} />
          ))}
        </div>
        <div className="flex flex-col gap-24 justify-center">
          {botSF.map((match) => (
            <MatchNode key={match.id} match={match} mode={resultsMode} onTeamClick={advanceTeam} onScoreChange={updateBracketScore} />
          ))}
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
