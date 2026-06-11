import type { MatchSummary } from '../../models';
import { FlagImage } from '../../../../shared/components/FlagImage';

interface MatchRowProps {
  match: MatchSummary;
}

export const MatchRow = ({ match }: MatchRowProps) => {
  return (
    <div className="flex flex-col items-center py-2 border-b border-zinc-700/30 last:border-b-0">
      <span className="text-[9px] text-zinc-500 mb-1">
        {match.date}
      </span>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 w-full">
        <div className="flex items-center gap-1.5 justify-start min-w-0">
          <FlagImage
            code={match.teamACode}
            alt={match.teamAName}
            className="h-3 w-4.5"
          />
          <span className="text-[11px] font-medium text-zinc-200 truncate">
            {match.teamAName}
          </span>
        </div>

        <span className="text-[11px] font-bold text-zinc-100 px-1">
          {match.goalsA}-{match.goalsB}
        </span>

        <div className="flex items-center gap-1.5 justify-end min-w-0">
          <span className="text-[11px] font-medium text-zinc-200 truncate text-right">
            {match.teamBName}
          </span>
          <FlagImage
            code={match.teamBCode}
            alt={match.teamBName}
            className="h-3 w-4.5"
          />
        </div>
      </div>
    </div>
  );
};
