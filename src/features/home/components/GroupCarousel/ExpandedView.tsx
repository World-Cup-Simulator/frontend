import type { GroupData, MatchSummary } from '../../models';
import { GroupCard } from './GroupCard';

interface ExpandedViewProps {
  groups: GroupData[];
  matches: MatchSummary[];
  onToggleView?: () => void;
}

export const ExpandedView = ({ groups, matches, onToggleView }: ExpandedViewProps) => {
  // Guard against empty groups
  if (groups.length === 0) {
    return <div className="min-h-[520px] w-full" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {groups.map((group, index) => (
        <div key={group.groupCode} className="relative">
          {index === 0 && onToggleView && (
            <button
              type="button"
              onClick={onToggleView}
              className="absolute top-2 right-2 z-40 flex min-[700px]:hidden items-center justify-center w-6 h-6 text-zinc-400 hover:text-zinc-200 transition-colors duration-200"
              aria-label="Ver Carrusel"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707M15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707" />
              </svg>
            </button>
          )}
          <GroupCard
            group={group}
            matches={matches}
            variant="grid"
          />
        </div>
      ))}
    </div>
  );
};
