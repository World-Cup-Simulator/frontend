export type ResultsMode = 'with-results' | 'no-results';

export interface GroupData {
  groupCode: string;
  teams: { code: string; name: string; flagCode: string }[];
}
