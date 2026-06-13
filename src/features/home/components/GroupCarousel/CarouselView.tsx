import { useRef, useCallback } from 'react';
import type { GroupData, MatchSummary } from '../../models';
import { GroupCard } from './GroupCard';

interface CarouselViewProps {
  groups: GroupData[];
  matches: MatchSummary[];
  activeIndex: number;
  onNavigate: (index: number) => void;
}

export const CarouselView = ({ groups, matches, activeIndex, onNavigate }: CarouselViewProps) => {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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

        return (
          <div
            key={`${group.groupCode}-${groupIndex}`}
            className={getCardStyle(offset)}
            onClick={() => {
              if (offset === -1) onNavigate((activeIndex - 1 + groups.length) % groups.length);
              if (offset === 1) onNavigate((activeIndex + 1) % groups.length);
            }}
            onTouchStart={offset === 0 ? handleTouchStart : undefined}
            onTouchMove={offset === 0 ? handleTouchMove : undefined}
            onTouchEnd={offset === 0 ? handleTouchEnd : undefined}
            role="button"
            tabIndex={offset === 0 ? 0 : -1}
            aria-label={offset === 0 ? `Grupo ${group.groupCode} activo` : `Ver grupo ${group.groupCode}`}
          >
            <GroupCard group={group} matches={matches} variant="carousel" isActive={offset === 0} />
          </div>
        );
      })}
    </div>
  );
};
