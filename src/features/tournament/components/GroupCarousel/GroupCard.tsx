import type { GroupData, MatchSummary } from '../../models';
import { StandingRow } from './StandingRow';
import { MatchRow } from './MatchRow';

interface GroupCardProps {
  group: GroupData;
  matches: MatchSummary[];
  variant?: 'carousel' | 'grid';
  isActive?: boolean;
}

export const GroupCard = ({ group, matches, variant = 'grid', isActive = false }: GroupCardProps) => {
  const groupMatches = matches.filter((m) => m.groupCode === group.groupCode);

  const isCarousel = variant === 'carousel';

  return (
    <div
      className={`flex flex-col rounded-2xl border border-zinc-700/50 overflow-hidden shadow-xl
        ${isActive ? 'bg-zinc-800' : 'bg-zinc-800/50'}
        ${isCarousel ? 'w-80' : 'w-full'}
      `}
    >
      <div className="px-4 py-3 border-b border-zinc-700/50">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
          Grupo {group.groupCode}
        </h3>
      </div>

      <div className="px-4 py-2">
        {group.standings.map((standing, index) => (
          <StandingRow key={standing.teamCode} standing={standing} rank={index + 1} />
        ))}
      </div>

      <div className="px-4 py-2 border-t border-zinc-700/50">
        {groupMatches.map((match) => (
          <MatchRow key={match.matchId} match={match} />
        ))}
      </div>
    </div>
  );
};
