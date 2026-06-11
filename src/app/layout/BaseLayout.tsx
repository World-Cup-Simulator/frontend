import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface BaseLayoutProps {
  children: React.ReactNode;
}

const TrophyIcon = () => (
  <svg
    className="h-6 w-6 text-zinc-200"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16m-2-8.34V17c0 .55-.47.98-.97 1.21C15.15 18.75 14 20.24 14 22M8 13.66V17c0 .55.47.98.97 1.21C10.15 18.75 12 20.24 12 22M18 2H6v7a6 6 0 0 0 12 0V2Z"
    />
  </svg>
);

const SmallTrophyIcon = () => (
  <svg
    className="h-4 w-4 text-zinc-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16m-2-8.34V17c0 .55-.47.98-.97 1.21C15.15 18.75 14 20.24 14 22M8 13.66V17c0 .55.47.98.97 1.21C10.15 18.75 12 20.24 12 22M18 2H6v7a6 6 0 0 0 12 0V2Z"
    />
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
                <SmallTrophyIcon />
                Predicciones
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-zinc-200 hover:bg-zinc-800/50 transition-colors duration-200"
                onClick={() => handleOptionClick('/')}
              >
                <SmallTrophyIcon />
                Simulaciones
              </button>
            </div>
          </div>

          <h1 className="text-lg font-bold tracking-tight text-zinc-100">
            World Cup Simulator
          </h1>
        </div>
      </header>

      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
};
