export interface TeamSeed {
  name: string;
  code: string;
  flagCode: string;
}

export const teams: TeamSeed[] = [
  { name: 'Argentina', code: 'ARG', flagCode: 'ar' },
  { name: 'Brazil', code: 'BRA', flagCode: 'br' },
  { name: 'Germany', code: 'GER', flagCode: 'de' },
  { name: 'France', code: 'FRA', flagCode: 'fr' },
  { name: 'Spain', code: 'ESP', flagCode: 'es' },
  { name: 'England', code: 'ENG', flagCode: 'gb-eng' },
  { name: 'Portugal', code: 'POR', flagCode: 'pt' },
  { name: 'Netherlands', code: 'NED', flagCode: 'nl' },
  { name: 'Belgium', code: 'BEL', flagCode: 'be' },
  { name: 'Italy', code: 'ITA', flagCode: 'it' },
  { name: 'Uruguay', code: 'URU', flagCode: 'uy' },
  { name: 'Croatia', code: 'CRO', flagCode: 'hr' },
  { name: 'Morocco', code: 'MAR', flagCode: 'ma' },
  { name: 'Japan', code: 'JPN', flagCode: 'jp' },
  { name: 'USA', code: 'USA', flagCode: 'us' },
  { name: 'Mexico', code: 'MEX', flagCode: 'mx' },
  { name: 'Senegal', code: 'SEN', flagCode: 'sn' },
  { name: 'Poland', code: 'POL', flagCode: 'pl' },
  { name: 'Switzerland', code: 'SUI', flagCode: 'ch' },
  { name: 'Ghana', code: 'GHA', flagCode: 'gh' },
  { name: 'Cameroon', code: 'CMR', flagCode: 'cm' },
  { name: 'Ecuador', code: 'ECU', flagCode: 'ec' },
  { name: 'Australia', code: 'AUS', flagCode: 'au' },
  { name: 'Canada', code: 'CAN', flagCode: 'ca' },
  { name: 'Costa Rica', code: 'CRC', flagCode: 'cr' },
  { name: 'Tunisia', code: 'TUN', flagCode: 'tn' },
  { name: 'Qatar', code: 'QAT', flagCode: 'qa' },
  { name: 'Iran', code: 'IRN', flagCode: 'ir' },
  { name: 'South Korea', code: 'KOR', flagCode: 'kr' },
  { name: 'Serbia', code: 'SRB', flagCode: 'rs' },
  { name: 'Nigeria', code: 'NGA', flagCode: 'ng' },
  { name: 'Denmark', code: 'DEN', flagCode: 'dk' },
  { name: 'Saudi Arabia', code: 'KSA', flagCode: 'sa' },
  { name: 'Wales', code: 'WAL', flagCode: 'gb-wls' },
  { name: 'Ukraine', code: 'UKR', flagCode: 'ua' },
  { name: 'Scotland', code: 'SCO', flagCode: 'gb-sct' },
  { name: 'Hungary', code: 'HUN', flagCode: 'hu' },
  { name: 'Algeria', code: 'ALG', flagCode: 'dz' },
  { name: 'Egypt', code: 'EGY', flagCode: 'eg' },
  { name: 'Colombia', code: 'COL', flagCode: 'co' },
  { name: 'Chile', code: 'CHI', flagCode: 'cl' },
  { name: 'Paraguay', code: 'PAR', flagCode: 'py' },
  { name: 'Peru', code: 'PER', flagCode: 'pe' },
  { name: 'Panama', code: 'PAN', flagCode: 'pa' },
  { name: 'Jamaica', code: 'JAM', flagCode: 'jm' },
  { name: 'New Zealand', code: 'NZL', flagCode: 'nz' },
  { name: 'Venezuela', code: 'VEN', flagCode: 've' },
  { name: 'Iraq', code: 'IRQ', flagCode: 'iq' },
];

const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export const getGroupTeams = (groupIndex: number): TeamSeed[] => {
  return teams.slice(groupIndex * 4, (groupIndex + 1) * 4);
};

export const getAllGroups = (): { groupCode: string; teams: TeamSeed[] }[] => {
  return groupLetters.map((letter, index) => ({
    groupCode: letter,
    teams: getGroupTeams(index),
  }));
};

const matchups = [
  [0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2],
];

export const getGroupMatches = (groupIndex: number): {
  matchId: string;
  teamA: TeamSeed;
  teamB: TeamSeed;
  date: string;
}[] => {
  const groupTeams = getGroupTeams(groupIndex);
  const startDate = new Date('2026-06-10');

  return matchups.map((matchup, index) => {
    const matchDate = new Date(startDate);
    matchDate.setDate(startDate.getDate() + groupIndex * 3 + index);

    return {
      matchId: `match-${groupIndex}-${index}`,
      teamA: groupTeams[matchup[0]],
      teamB: groupTeams[matchup[1]],
      date: matchDate.toISOString().split('T')[0],
    };
  });
};
