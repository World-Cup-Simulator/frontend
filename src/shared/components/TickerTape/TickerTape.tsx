import './TickerTape.css';
import type { MatchTick, TickerTapeProps } from '../../models';
import { FlagImage } from '../FlagImage';

const TickerItem = ({ match }: { match: MatchTick }) => {
  return (
    <div className="flex flex-col items-center justify-center shrink-0 px-4 py-1 h-full border-r border-zinc-800/50">
      <div className="flex items-center gap-2">
        <FlagImage
          code={match.homeTeam.code}
          alt={match.homeTeam.name}
          className="h-4 w-6"
        />
        <span className="text-sm font-medium uppercase whitespace-nowrap text-zinc-200">
          {match.homeTeam.code}
        </span>
        {match.score ? (
          <span className="text-sm font-bold whitespace-nowrap text-zinc-100">
            {match.score.home} - {match.score.away}
          </span>
        ) : (
          <span className="text-sm font-medium whitespace-nowrap text-zinc-400">-</span>
        )}
        <span className="text-sm font-medium uppercase whitespace-nowrap text-zinc-200">
          {match.awayTeam.code}
        </span>
        <FlagImage
          code={match.awayTeam.code}
          alt={match.awayTeam.name}
          className="h-4 w-6"
        />
      </div>
      <span className="text-xs whitespace-nowrap text-zinc-200">
        {match.date}
      </span>
    </div>
  );
};

export const TickerTape = ({ matches }: TickerTapeProps) => {
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="h-16 overflow-hidden bg-[#111113] backdrop-blur-sm border-b border-zinc-800/50">
      <div className="flex items-center h-full animate-marquee">
        {sortedMatches.map((match) => (
          <TickerItem key={`${match.id}-a`} match={match} />
        ))}
        {sortedMatches.map((match) => (
          <TickerItem key={`${match.id}-b`} match={match} />
        ))}
      </div>
    </div>
  );
};
