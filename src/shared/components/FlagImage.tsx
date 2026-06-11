import { useState } from 'react';
import { getFlagUrl } from '../utils/flagMapper';

interface FlagImageProps {
  code: string;
  alt: string;
  className?: string;
}

export const FlagImage = ({ code, alt, className = '' }: FlagImageProps) => {
  const [hasError, setHasError] = useState(false);
  const url = getFlagUrl(code);

  if (!url || hasError) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-zinc-700 rounded-sm text-[8px] font-bold text-zinc-400 shrink-0 ${className}`}
        title={alt}
      >
        {code.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`object-cover rounded-sm shrink-0 ${className}`}
      onError={() => setHasError(true)}
    />
  );
};
