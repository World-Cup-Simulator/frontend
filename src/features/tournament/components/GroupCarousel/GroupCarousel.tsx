import { useState, useEffect, useCallback, useRef } from 'react';
import type { GroupData, MatchSummary } from '../../models';
import { CarouselView } from './CarouselView';
import { ExpandedView } from './ExpandedView';
import { LoadingOverlay } from './LoadingOverlay';

interface GroupCarouselProps {
  groups: GroupData[];
  matches: MatchSummary[];
  currentView: 'carousel' | 'expanded';
}

export const GroupCarousel = ({
  groups,
  matches,
  currentView,
}: GroupCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayView, setDisplayView] = useState(currentView);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isUserInteracting = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoRotate = useCallback(() => {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
      autoRotateRef.current = null;
    }
  }, []);

  const startAutoRotate = useCallback(() => {
    clearAutoRotate();
    autoRotateRef.current = setInterval(() => {
      if (!isUserInteracting.current) {
        setActiveIndex((prev) => (prev + 1) % groups.length);
      }
    }, 8000);
  }, [clearAutoRotate, groups.length]);

  const handleNavigate = useCallback((index: number) => {
    setActiveIndex(index);
    isUserInteracting.current = true;
    clearAutoRotate();
    startAutoRotate();
    setTimeout(() => {
      isUserInteracting.current = false;
    }, 10000);
  }, [clearAutoRotate, startAutoRotate]);

  useEffect(() => {
    if (currentView === displayView) return;
    if (isTransitioning) return;

    setIsTransitioning(true);

    transitionTimerRef.current = setTimeout(() => {
      setDisplayView(currentView);
      setIsTransitioning(false);
      transitionTimerRef.current = null;
    }, 500);

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [currentView, displayView]);

  useEffect(() => {
    if (displayView !== 'carousel') {
      clearAutoRotate();
      return;
    }

    startAutoRotate();
    return () => clearAutoRotate();
  }, [displayView, clearAutoRotate, startAutoRotate]);

  useEffect(() => {
    return () => {
      clearAutoRotate();
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [clearAutoRotate]);

  return (
    <div className="relative">
      {isTransitioning && <LoadingOverlay />}

      {displayView === 'carousel' && (
        <CarouselView
          groups={groups}
          matches={matches}
          activeIndex={activeIndex}
          onNavigate={handleNavigate}
        />
      )}

      {displayView === 'expanded' && (
        <ExpandedView groups={groups} matches={matches} />
      )}
    </div>
  );
};
