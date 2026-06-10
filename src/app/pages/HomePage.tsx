import { TickerTape } from '../../shared/components/TickerTape';
import type { MatchTick } from '../../shared/models';

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
];

const generateMockMatches = (): MatchTick[] => {
  const matches: MatchTick[] = [];
  const startDate = new Date('2026-06-10');

  for (let i = 0; i < 72; i++) {
    const homeTeam = teams[i % teams.length];
    const awayTeam = teams[(i + 1 + Math.floor(i / teams.length)) % teams.length];

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

const GroupCarouselPlaceholder = () => {
  const groups = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D'];

  return (
    <div className="flex items-center justify-center gap-4 h-80">
      {groups.map((group) => (
        <div
          key={group}
          className="h-64 w-48 flex items-center justify-center bg-zinc-800/50 rounded-2xl border border-zinc-700/50 text-zinc-500 text-sm font-medium transition-all duration-200 ease-out hover:bg-zinc-700/50"
        >
          {group}
        </div>
      ))}
    </div>
  );
};

export const HomePage = () => {
  const mockMatches = generateMockMatches();

  return (
    <div className="flex flex-col pt-16">
      <TickerTape matches={mockMatches} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
        <section className="flex flex-col items-center text-center gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
            Simulador Mundial 2026
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl">
            Predice resultados, simula escenarios y descubre quién podría
            levantar la copa en el Mundial 2026.
          </p>
        </section>

        <section>
          <GroupCarouselPlaceholder />
        </section>

        <section className="flex flex-row gap-4 justify-center">
          <button
            type="button"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all duration-200 ease-out"
            onClick={() => console.log('Predecir clicked')}
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
    </div>
  );
};
