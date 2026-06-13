import type { GroupData, MatchSummary } from '../../models';
import { GroupCard } from './GroupCard';

interface ExpandedViewProps {
  groups: GroupData[];
  matches: MatchSummary[];
}

export const ExpandedView = ({ groups, matches }: ExpandedViewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {groups.map((group) => (
        <GroupCard
          key={group.groupCode}
          group={group}
          matches={matches}
          variant="grid"
        />
      ))}
    </div>
  );
};
