import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface BaseLayoutProps {
  children: React.ReactNode;
}

const TrophyIcon = () => (
  <img
    src="/favicon.svg"
    alt="World Cup Simulator"
    className="h-6 w-6"
  />
);

const PredictionsIcon = () => (
  <svg
    className="h-4 w-4 text-zinc-400"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M3 0a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3zm1 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m1.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M12 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3M5.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M4 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
  </svg>
);

const SimulationsIcon = () => (
  <svg
    className="h-4 w-4 text-zinc-400"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path fillRule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H11a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 5 7h2.5V6A1.5 1.5 0 0 1 6 4.5zm-3 8A1.5 1.5 0 0 1 4.5 10h1A1.5 1.5 0 0 1 7 11.5v1A1.5 1.5 0 0 1 5.5 14h-1A1.5 1.5 0 0 1 3 12.5zm6 0a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 9 12.5z" />
  </svg>
);

export const BaseLayout = ({ children }: BaseLayoutProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleToggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleOptionClick = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="relative min-h-screen bg-zinc-900">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-zinc-800/50 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              onClick={handleToggleDropdown}
              aria-label="Open menu"
              aria-expanded={isDropdownOpen}
            >
              <TrophyIcon />
            </button>

            <div
              className={`
                absolute left-0 top-12 w-48 py-2
                bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-lg
                transition-all duration-200 ease-out origin-top-left
                ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
              `}
            >
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-zinc-200 hover:bg-zinc-800/50 transition-colors duration-200"
                onClick={() => handleOptionClick('/predict')}
              >
                <PredictionsIcon />
                Predicciones
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-zinc-200 hover:bg-zinc-800/50 transition-colors duration-200"
                onClick={() => handleOptionClick('/simulation')}
              >
                <SimulationsIcon />
                Simulaciones
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-lg font-bold tracking-tight text-zinc-100 hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
          >
            World Cup Simulator
          </button>
        </div>
      </header>

      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
};
