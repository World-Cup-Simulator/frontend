import { useRef, useCallback } from 'react';
import type { GroupData, MatchSummary } from '../../models';
import { GroupCard } from './GroupCard';

interface CarouselViewProps {
  groups: GroupData[];
  matches: MatchSummary[];
  activeIndex: number;
  onNavigate: (index: number) => void;
  onToggleView?: () => void;
}

export const CarouselView = ({ groups, matches, activeIndex, onNavigate, onToggleView }: CarouselViewProps) => {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        onNavigate((activeIndex + 1) % groups.length);
      } else {
        onNavigate((activeIndex - 1 + groups.length) % groups.length);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }, [activeIndex, groups.length, onNavigate]);

  // Guard against empty groups - must be after all hooks
  if (groups.length === 0) {
    return <div className="relative h-[520px] w-full" />;
  }

  const getIndices = () => {
    const total = groups.length;
    return [
      (activeIndex - 2 + total) % total,
      (activeIndex - 1 + total) % total,
      activeIndex,
      (activeIndex + 1) % total,
      (activeIndex + 2) % total,
    ];
  };

  const indices = getIndices();

  const getCardStyle = (offset: number) => {
    const baseClasses = 'absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out';

    switch (offset) {
      case -2:
        return `${baseClasses} left-1/2 -translate-x-[170%] scale-[0.65] opacity-0 z-0 pointer-events-none`;
      case -1:
        return `${baseClasses} left-1/2 -translate-x-[105%] md:-translate-x-[95%] scale-[0.82] opacity-50 z-10 cursor-pointer hover:opacity-70`;
      case 0:
        return `${baseClasses} left-1/2 -translate-x-1/2 scale-100 opacity-100 z-30 cursor-grab active:cursor-grabbing`;
      case 1:
        return `${baseClasses} left-1/2 translate-x-[5%] md:translate-x-[15%] scale-[0.82] opacity-50 z-10 cursor-pointer hover:opacity-70`;
      case 2:
        return `${baseClasses} left-1/2 translate-x-[70%] md:translate-x-[90%] scale-[0.65] opacity-0 z-0 pointer-events-none`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="relative h-[520px] w-full overflow-hidden">
      {indices.map((groupIndex, offsetIndex) => {
        const offset = offsetIndex - 2;
        const group = groups[groupIndex];

        const isCenterCard = offset === 0;

        return (
          <div
            key={`${group.groupCode}-${groupIndex}`}
            className={getCardStyle(offset)}
            onClick={() => {
              if (offset === -1) onNavigate((activeIndex - 1 + groups.length) % groups.length);
              if (offset === 1) onNavigate((activeIndex + 1) % groups.length);
            }}
            onTouchStart={isCenterCard ? handleTouchStart : undefined}
            onTouchMove={isCenterCard ? handleTouchMove : undefined}
            onTouchEnd={isCenterCard ? handleTouchEnd : undefined}
            role="button"
            tabIndex={isCenterCard ? 0 : -1}
            aria-label={isCenterCard ? `Grupo ${group.groupCode} activo` : `Ver grupo ${group.groupCode}`}
          >
            {isCenterCard && onToggleView && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleView();
                }}
                className="absolute top-2 right-2 z-40 flex min-[700px]:hidden items-center justify-center w-6 h-6 text-zinc-400 hover:text-zinc-200 transition-colors duration-200"
                aria-label="Ver Grilla"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707" />
                </svg>
              </button>
            )}
            <GroupCard group={group} matches={matches} variant="carousel" isActive={isCenterCard} />
          </div>
        );
      })}
    </div>
  );
};
