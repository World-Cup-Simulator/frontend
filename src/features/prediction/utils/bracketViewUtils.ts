import type { BracketMatch } from '../models';

export const stageLabels: Record<number, string> = {
  1: '16.º de final',
  2: '8.º de final',
  3: '4.º de final',
  4: 'Semifinal',
  5: 'Final',
};

/** Pull a list of bracket matches by stage and ordered keys. */
export const collectMatches = (
  bracketMatches: Record<string, BracketMatch>,
  stage: number,
  keys: number[]
): BracketMatch[] => {
  return keys.map((k) => bracketMatches[`${stage}-${k}`]).filter(Boolean) as BracketMatch[];
};
