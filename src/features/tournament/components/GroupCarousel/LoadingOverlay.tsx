import './GroupCarousel.css';

export const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm">
      <div className="animate-football-bounce">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="url(#footballGradient)" stroke="#27272a" strokeWidth="1"/>
          <path d="M32 8 L38 18 L32 28 L26 18 Z" fill="#18181b"/>
          <path d="M32 36 L38 46 L32 56 L26 46 Z" fill="#18181b"/>
          <path d="M8 32 L18 26 L28 32 L18 38 Z" fill="#18181b"/>
          <path d="M36 32 L46 26 L56 32 L46 38 Z" fill="#18181b"/>
          <path d="M18 18 L26 18 L32 8 L24 8 Z" fill="#18181b"/>
          <path d="M38 18 L46 18 L40 8 L32 8 Z" fill="#18181b"/>
          <path d="M18 46 L26 46 L32 56 L24 56 Z" fill="#18181b"/>
          <path d="M38 46 L46 46 L40 56 L32 56 Z" fill="#18181b"/>
          <defs>
            <radialGradient id="footballGradient" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff"/>
              <stop offset="50%" stopColor="#e4e4e7"/>
              <stop offset="100%" stopColor="#a1a1aa"/>
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="mt-4 w-16 h-1.5 rounded-full bg-zinc-800 animate-shadow-pulse" />
    </div>
  );
};
