import type { BracketTeam } from '../../models';

interface ChampionBannerProps {
  champion: BracketTeam;
}

export const ChampionBanner = ({ champion }: ChampionBannerProps) => {
  return (
    <div className="flex flex-col items-center gap-3 py-6 px-4 bg-gradient-to-b from-amber-500/10 to-transparent rounded-xl border border-amber-500/20 animate-pulse">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
        CAMPEÓN
      </span>

      <div className="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-400 shrink-0"
        >
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>

        <div className="flex items-center gap-2">
          <img
            src={`https://flagcdn.com/w40/${champion.flagCode.toLowerCase()}.png`}
            alt={champion.name}
            className="h-6 w-9 rounded-sm object-cover shadow-lg shadow-amber-500/20"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-2xl font-bold text-amber-300 tracking-tight">
            {champion.name}
          </span>
        </div>
      </div>
    </div>
  );
};
