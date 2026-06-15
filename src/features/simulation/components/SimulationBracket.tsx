import { useState } from 'react';
import { SimulationMatchNode } from './SimulationMatchNode';
import { ChampionBanner } from '../../../shared/components/ChampionBanner';
import type { SimulatedBracket, SimulatedMatch } from '../models';
import { getFifaCodeFromName } from '../utils/simulationMapper';
import { getIsoCodeFromFifa } from '../../../shared/utils/flagMapper';

const stageLabels: Record<number, string> = {
  1: '16.º de final',
  2: '8.º de final',
  3: '4.º de final',
  4: 'Semifinal',
  5: 'Final',
};

interface SimulationBracketProps {
  bracketData: SimulatedBracket;
  resultsMode: 'with-results' | 'no-results';
}

export const SimulationBracket = ({ bracketData, resultsMode }: SimulationBracketProps) => {
  const [mobileRound, setMobileRound] = useState(1);

  const getMatch = (stage: number, key: number): SimulatedMatch | undefined =>
    bracketData.matches[`${stage}-${key}`];

  const topR32 = ([1, 2, 3, 4, 5, 6, 7, 8].map((k) => getMatch(1, k)).filter(Boolean) as SimulatedMatch[]);
  const topR16 = ([1, 2, 3, 4].map((k) => getMatch(2, k)).filter(Boolean) as SimulatedMatch[]);
  const topQF = ([1, 2].map((k) => getMatch(3, k)).filter(Boolean) as SimulatedMatch[]);
  const topSF = ([1].map((k) => getMatch(4, k)).filter(Boolean) as SimulatedMatch[]);

  const botR32 = ([9, 10, 11, 12, 13, 14, 15, 16].map((k) => getMatch(1, k)).filter(Boolean) as SimulatedMatch[]);
  const botR16 = ([5, 6, 7, 8].map((k) => getMatch(2, k)).filter(Boolean) as SimulatedMatch[]);
  const botQF = ([3, 4].map((k) => getMatch(3, k)).filter(Boolean) as SimulatedMatch[]);
  const botSF = ([2].map((k) => getMatch(4, k)).filter(Boolean) as SimulatedMatch[]);

  const finalMatch = getMatch(5, 1);

  const mobileMatches = (Object.values(bracketData.matches) as SimulatedMatch[]).filter((m) => {
    const matchStage = parseInt(m.matchId.split('-')[0], 10);
    return matchStage === mobileRound;
  });

  const championFifaCode = getFifaCodeFromName(bracketData.champion);
  const championTeam = {
    code: championFifaCode,
    name: bracketData.champion,
    flagCode: getIsoCodeFromFifa(championFifaCode),
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Desktop View */}
      <div className="hidden md:grid grid-cols-5 gap-4">
        {/* Top Half */}
        <div className="flex flex-col gap-2 justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-1">{stageLabels[1]}</span>
          {topR32.map((match) => (
            <SimulationMatchNode key={match.matchId} match={match} resultsMode={resultsMode} />
          ))}
        </div>
        <div className="flex flex-col gap-6 justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-1">{stageLabels[2]}</span>
          {topR16.map((match) => (
            <SimulationMatchNode key={match.matchId} match={match} resultsMode={resultsMode} />
          ))}
        </div>
        <div className="flex flex-col gap-12 justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-1">{stageLabels[3]}</span>
          {topQF.map((match) => (
            <SimulationMatchNode key={match.matchId} match={match} resultsMode={resultsMode} />
          ))}
        </div>
        <div className="flex flex-col gap-24 justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-1">{stageLabels[4]}</span>
          {topSF.map((match) => (
            <SimulationMatchNode key={match.matchId} match={match} resultsMode={resultsMode} />
          ))}
        </div>

        {/* Final */}
        <div className="row-span-2 flex flex-col justify-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center">{stageLabels[5]}</span>
          {finalMatch && (
            <SimulationMatchNode match={finalMatch} resultsMode={resultsMode} />
          )}
          <ChampionBanner champion={championTeam} />
        </div>

        {/* Bottom Half */}
        <div className="flex flex-col gap-2 justify-center">
          {botR32.map((match) => (
            <SimulationMatchNode key={match.matchId} match={match} resultsMode={resultsMode} />
          ))}
        </div>
        <div className="flex flex-col gap-6 justify-center">
          {botR16.map((match) => (
            <SimulationMatchNode key={match.matchId} match={match} resultsMode={resultsMode} />
          ))}
        </div>
        <div className="flex flex-col gap-12 justify-center">
          {botQF.map((match) => (
            <SimulationMatchNode key={match.matchId} match={match} resultsMode={resultsMode} />
          ))}
        </div>
        <div className="flex flex-col gap-24 justify-center">
          {botSF.map((match) => (
            <SimulationMatchNode key={match.matchId} match={match} resultsMode={resultsMode} />
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="flex md:hidden flex-col gap-4">
        <div className="flex overflow-x-auto gap-1 pb-1">
          {[1, 2, 3, 4, 5].map((stage) => (
            <button
              key={stage}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200
                ${mobileRound === stage ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}
              `}
              onClick={() => setMobileRound(stage)}
            >
              {stageLabels[stage]}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {mobileMatches.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-8">No hay partidos en esta ronda</p>
          )}
          {mobileMatches.map((match) => (
            <SimulationMatchNode key={match.matchId} match={match} resultsMode={resultsMode} />
          ))}
          {mobileRound === 5 && (
            <ChampionBanner champion={championTeam} />
          )}
        </div>
      </div>
    </div>
  );
};
