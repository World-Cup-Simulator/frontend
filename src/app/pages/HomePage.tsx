import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TickerTape } from '../../shared/components/TickerTape';
import type { MatchTick } from '../../shared/models';
import { GroupCarousel } from '../../features/home/components/GroupCarousel';
import type { GroupData, MatchSummary } from '../../features/home/models';

const teams = [
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

interface TeamSeed {
  name: string;
  code: string;
  flagCode: string;
}

const generateMockMatches = (teamList: TeamSeed[]): MatchTick[] => {
  const matches: MatchTick[] = [];
  const startDate = new Date('2026-06-10');

  for (let i = 0; i < 72; i++) {
    const homeTeam = teamList[i % teamList.length];
    const awayTeam = teamList[(i + 1 + Math.floor(i / teamList.length)) % teamList.length];

    const matchDate = new Date(startDate);
    matchDate.setDate(startDate.getDate() + Math.floor(i / 4));

    const hasScore = Math.random() > 0.4;

    matches.push({
      id: `match-${i + 1}`,
      homeTeam: { name: homeTeam.name, code: homeTeam.code, flagCode: homeTeam.flagCode },
      awayTeam: { name: awayTeam.name, code: awayTeam.code, flagCode: awayTeam.flagCode },
      score: hasScore
        ? {
            home: Math.floor(Math.random() * 5),
            away: Math.floor(Math.random() * 5),
          }
        : undefined,
      date: matchDate.toISOString().split('T')[0],
    });
  }

  return matches;
};

const generateMockGroups = (teamList: TeamSeed[]): GroupData[] => {
  const groups: GroupData[] = [];
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  for (let g = 0; g < 12; g++) {
    const groupTeams = teamList.slice(g * 4, (g + 1) * 4);
    if (groupTeams.length < 4) continue;

    const standings: GroupData['standings'] = groupTeams.map((team, index) => ({
      teamName: team.name,
      teamCode: team.code,
      points: [9, 6, 3, 0][index] || Math.floor(Math.random() * 10),
    }));

    groups.push({
      groupCode: groupLetters[g],
      standings: standings.sort((a, b) => b.points - a.points),
    });
  }

  return groups;
};

const generateMockMatchSummaries = (teamList: TeamSeed[]): MatchSummary[] => {
  const matches: MatchSummary[] = [];
  const startDate = new Date('2026-06-10');
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  for (let g = 0; g < 12; g++) {
    const groupTeams = teamList.slice(g * 4, (g + 1) * 4);
    if (groupTeams.length < 4) continue;

    const matchups = [
      [0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2],
    ];

    matchups.forEach((matchup, index) => {
      const teamA = groupTeams[matchup[0]];
      const teamB = groupTeams[matchup[1]];
      const matchDate = new Date(startDate);
      matchDate.setDate(startDate.getDate() + g * 3 + index);

      matches.push({
        matchId: `match-${g}-${index}`,
        round: 'Fase de Grupos',
        date: matchDate.toISOString().split('T')[0],
        groupCode: groupLetters[g],
        teamAName: teamA.name,
        teamBName: teamB.name,
        teamACode: teamA.code,
        teamBCode: teamB.code,
        goalsA: Math.floor(Math.random() * 5),
        goalsB: Math.floor(Math.random() * 5),
      });
    });
  }

  return matches;
};

export const HomePage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'carousel' | 'expanded'>('carousel');
  const mockMatches = generateMockMatches(teams);
  const mockGroups = generateMockGroups(teams);
  const mockMatchSummaries = generateMockMatchSummaries(teams);

  return (
    <div className="flex flex-col pt-16">
      <TickerTape matches={mockMatches} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        <section className="flex flex-col items-center text-center gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
            Simulador Mundial 2026
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl">
            Predice resultados, simula escenarios y descubre quién podría
            levantar la copa en el Mundial 2026.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <GroupCarousel
            groups={mockGroups}
            matches={mockMatchSummaries}
            currentView={view}
          />
        </section>

        <section className="flex flex-row gap-4 justify-center">
          <button
            type="button"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all duration-200 ease-out"
            onClick={() => navigate('/predict')}
          >
            Predecir
          </button>
          <button
            type="button"
            className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all duration-200 ease-out"
            onClick={() => console.log('Simular clicked')}
          >
            Simular
          </button>
        </section>
      </div>

      <button
        type="button"
        className="fixed bottom-8 right-8 z-50 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium rounded-xl border border-zinc-700/50 transition-all duration-200 ease-out shadow-lg"
        onClick={() => setView(view === 'carousel' ? 'expanded' : 'carousel')}
      >
        {view === 'carousel' ? 'Ver Grilla' : 'Ver Carrusel'}
      </button>
    </div>
  );
};
