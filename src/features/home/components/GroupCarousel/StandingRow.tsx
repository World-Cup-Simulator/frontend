import type { TeamStanding } from '../../models';
import { FlagImage } from '../../../../shared/components/FlagImage';

interface StandingRowProps {
  standing: TeamStanding;
  rank: number;
}

export const StandingRow = ({ standing, rank }: StandingRowProps) => {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="w-5 text-xs font-bold text-zinc-500">{rank}</span>
      <FlagImage
        code={standing.teamCode}
        alt={standing.teamName}
        className="h-3.5 w-5"
      />
      <span className="text-xs font-medium text-zinc-200 truncate max-w-[100px]">
        {standing.teamName}
      </span>
      <span className="ml-auto text-xs font-bold text-zinc-100">
        {standing.points} pts
      </span>
    </div>
  );
};
