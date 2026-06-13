/** Map a standing position to a Tailwind background highlight class. */
export const getRowBg = (position: number): string => {
  if (position === 0) return 'bg-yellow-500/15';
  if (position === 1) return 'bg-zinc-400/15';
  if (position === 2) return 'bg-amber-700/20';
  return '';
};

/** Convert a raw input string into a sanitized goal value (capped at 20). */
export const sanitizeScoreInput = (rawValue: string): { num: number; display: string } => {
  const digitsOnly = rawValue.replace(/\D/g, '');
  const num = digitsOnly === '' ? 0 : parseInt(digitsOnly, 10);
  const capped = Math.min(num, 20);
  const display = capped === 0 && digitsOnly === '' ? '' : capped.toString();
  return { num: capped, display };
};
