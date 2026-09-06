import type { Driver, Team, Race, NewsItem } from './types';

export const TEAM_COLORS: Record<string, string> = {
  'Mercedes': '#27F4D2',
  'Ferrari': '#E8002D',
  'McLaren': '#FF8000',
  'Red Bull': '#3671C6',
  'Haas': '#B6BABD',
  'Alpine': '#0093CC',
  'Racing Bulls': '#6692FF',
  'Audi': '#00877C',
  'Williams': '#64C4FF',
  'Cadillac': '#D9C27E',
  'Aston Martin': '#229971',
};

export const DRIVERS: Driver[] = [
  {
    id: 'ant', pos: 1, name: 'Andrea Kimi Antonelli', code: 'ANT', number: 12, team: 'Mercedes',
    country: '🇮🇹', pts: 75, gap: 'LEADER', color: TEAM_COLORS['Mercedes'],
    bio: 'The youngest championship leader in Formula 1 history. Two wins from three rounds (China and Japan), pole-to-flag in Suzuka, and the heir apparent at Mercedes is delivering on every promise made about him.',
    careerStats: { wins: 2, podiums: 4, titles: 0, races: 32 }, posChange: 1,
  },
  {
    id: 'rus', pos: 2, name: 'George Russell', code: 'RUS', number: 63, team: 'Mercedes',
    country: '🇬🇧', pts: 68, gap: -7, color: TEAM_COLORS['Mercedes'],
    bio: 'Won the season opener in Melbourne and has been on the podium twice since. Briefly the championship leader, now playing the senior team-mate role behind a fast rookie. The W17 is the class of the field.',
    careerStats: { wins: 5, podiums: 22, titles: 0, races: 141 }, posChange: -1,
  },
  {
    id: 'lec', pos: 3, name: 'Charles Leclerc', code: 'LEC', number: 16, team: 'Ferrari',
    country: '🇲🇨', pts: 55, gap: -20, color: TEAM_COLORS['Ferrari'],
    bio: 'Three podiums from three races. The SF-26 is the second-best car of the new era and Leclerc is delivering every weekend. The Madring debut in September could be the home win Ferrari need.',
    careerStats: { wins: 9, podiums: 47, titles: 0, races: 158 }, posChange: 1,
  },
  {
    id: 'ham', pos: 4, name: 'Lewis Hamilton', code: 'HAM', number: 44, team: 'Ferrari',
    country: '🇬🇧', pts: 43, gap: -32, color: TEAM_COLORS['Ferrari'],
    bio: 'Year two in red. A podium in China and consistent points-paying drives. Hamilton is happier with the SF-26 than he was with the SF-25 and the eighth title narrative is alive again.',
    careerStats: { wins: 105, podiums: 206, titles: 7, races: 369 }, posChange: 1,
  },
  {
    id: 'nor', pos: 5, name: 'Lando Norris', code: 'NOR', number: 1, team: 'McLaren',
    country: '🇬🇧', pts: 33, gap: -42, color: TEAM_COLORS['McLaren'],
    bio: 'The reigning World Champion with #1 on the car has had the worst opening to a title defence in years. The MCL40 has not adapted to the new regulations as cleanly as Mercedes or Ferrari. Recovery starts in Miami.',
    careerStats: { wins: 12, podiums: 41, titles: 1, races: 145 }, posChange: -4,
  },
  {
    id: 'pia', pos: 6, name: 'Oscar Piastri', code: 'PIA', number: 81, team: 'McLaren',
    country: '🇦🇺', pts: 28, gap: -47, color: TEAM_COLORS['McLaren'],
    bio: 'A P2 in Suzuka was the highlight. McLaren are quietly the third-fastest car this year and Piastri is matching Norris on race pace.',
    careerStats: { wins: 5, podiums: 25, titles: 0, races: 91 }, posChange: -4,
  },
  {
    id: 'bea', pos: 7, name: 'Oliver Bearman', code: 'BEA', number: 87, team: 'Haas',
    country: '🇬🇧', pts: 17, gap: -58, color: TEAM_COLORS['Haas'],
    bio: 'Survived a 50G accident at Suzuka and bounced back with points in Miami. Comfortably out-performing his team-mate and the Haas resurgence story of the year.',
    careerStats: { wins: 0, podiums: 0, titles: 0, races: 30 }, posChange: 11,
  },
  {
    id: 'gas', pos: 8, name: 'Pierre Gasly', code: 'GAS', number: 10, team: 'Alpine',
    country: '🇫🇷', pts: 16, gap: -59, color: TEAM_COLORS['Alpine'],
    bio: 'Alpine are quietly back in the points fight. Gasly has scored in every race and currently outranks Verstappen on the championship table.',
    careerStats: { wins: 1, podiums: 5, titles: 0, races: 175 }, posChange: 3,
  },
  {
    id: 'ver', pos: 9, name: 'Max Verstappen', code: 'VER', number: 3, team: 'Red Bull',
    country: '🇳🇱', pts: 16, gap: -59, color: TEAM_COLORS['Red Bull'],
    bio: 'The four-time champion is having the worst start to a season since his debut year. The RB22 has not extracted the new power unit and Verstappen sits ninth, three races in.',
    careerStats: { wins: 67, podiums: 117, titles: 4, races: 222 }, posChange: -6,
  },
  {
    id: 'law', pos: 10, name: 'Liam Lawson', code: 'LAW', number: 30, team: 'Racing Bulls',
    country: '🇳🇿', pts: 10, gap: -65, color: TEAM_COLORS['Racing Bulls'],
    bio: 'Reborn at Racing Bulls. Senior to a rookie team-mate and finally driving with confidence again. Two points-scoring drives from the opening triple-header.',
    careerStats: { wins: 0, podiums: 0, titles: 0, races: 26 }, posChange: 9,
  },
  {
    id: 'lin', pos: 11, name: 'Arvid Lindblad', code: 'LIN', number: 41, team: 'Racing Bulls',
    country: '🇬🇧', pts: 4, gap: -71, color: TEAM_COLORS['Racing Bulls'],
    bio: 'The British-Swedish rookie has scored on debut weekend and matched Lawson on pace at Suzuka. Red Bull\'s next generation is here.',
    careerStats: { wins: 0, podiums: 0, titles: 0, races: 4 }, posChange: 8,
  },
  {
    id: 'had', pos: 12, name: 'Isack Hadjar', code: 'HAD', number: 6, team: 'Red Bull',
    country: '🇫🇷', pts: 4, gap: -71, color: TEAM_COLORS['Red Bull'],
    bio: 'Promoted to partner Verstappen but the RB22 has been a hostile place for both drivers. Four points and the lessons of life next to a four-time champion.',
    careerStats: { wins: 0, podiums: 0, titles: 0, races: 28 }, posChange: 5,
  },
  {
    id: 'bor', pos: 13, name: 'Gabriel Bortoleto', code: 'BOR', number: 5, team: 'Audi',
    country: '🇧🇷', pts: 2, gap: -73, color: TEAM_COLORS['Audi'],
    bio: 'Year two for the 2024 F2 champion. Audi\'s development trajectory is steeper than the rest of the back of the grid.',
    careerStats: { wins: 0, podiums: 0, titles: 0, races: 28 }, posChange: 2,
  },
  {
    id: 'sai', pos: 14, name: 'Carlos Sainz', code: 'SAI', number: 55, team: 'Williams',
    country: '🇪🇸', pts: 2, gap: -73, color: TEAM_COLORS['Williams'],
    bio: 'A tougher start to year two at Williams than expected. The FW48 is mid-pack at best and the Spaniard has only one points finish so far.',
    careerStats: { wins: 4, podiums: 27, titles: 0, races: 222 }, posChange: -5,
  },
  {
    id: 'oco', pos: 15, name: 'Esteban Ocon', code: 'OCO', number: 31, team: 'Haas',
    country: '🇫🇷', pts: 1, gap: -74, color: TEAM_COLORS['Haas'],
    bio: 'Senior driver at Haas but comprehensively out-paced by Bearman so far this year.',
    careerStats: { wins: 1, podiums: 4, titles: 0, races: 180 }, posChange: 2,
  },
  {
    id: 'col', pos: 16, name: 'Franco Colapinto', code: 'COL', number: 43, team: 'Alpine',
    country: '🇦🇷', pts: 1, gap: -74, color: TEAM_COLORS['Alpine'],
    bio: 'A first F1 point in his proper full season. Alpine are giving him time and the Argentine is starting to repay it.',
    careerStats: { wins: 0, podiums: 0, titles: 0, races: 35 }, posChange: 6,
  },
  {
    id: 'hul', pos: 17, name: 'Nico Hülkenberg', code: 'HUL', number: 27, team: 'Audi',
    country: '🇩🇪', pts: 0, gap: -75, color: TEAM_COLORS['Audi'],
    bio: 'Senior driver at the Audi factory entry. Yet to score and is already trailing his team-mate. The development pressure is on.',
    careerStats: { wins: 0, podiums: 1, titles: 0, races: 250 }, posChange: -1,
  },
  {
    id: 'alb', pos: 18, name: 'Alex Albon', code: 'ALB', number: 23, team: 'Williams',
    country: '🇹🇭', pts: 0, gap: -75, color: TEAM_COLORS['Williams'],
    bio: 'A pointless start. The Williams package is not delivering and Albon is being out-qualified by Sainz at every venue.',
    careerStats: { wins: 0, podiums: 2, titles: 0, races: 111 }, posChange: -8,
  },
  {
    id: 'bot', pos: 19, name: 'Valtteri Bottas', code: 'BOT', number: 77, team: 'Cadillac',
    country: '🇫🇮', pts: 0, gap: -75, color: TEAM_COLORS['Cadillac'],
    bio: 'Back on the grid with the new American factory entry. Cadillac have not yet scored a point but the Finn is feeding the development team valuable data every weekend.',
    careerStats: { wins: 10, podiums: 67, titles: 0, races: 248 }, posChange: 0,
  },
  {
    id: 'per', pos: 20, name: 'Sergio Perez', code: 'PER', number: 11, team: 'Cadillac',
    country: '🇲🇽', pts: 0, gap: -75, color: TEAM_COLORS['Cadillac'],
    bio: 'The Mexican veteran returned to F1 with Cadillac. A debut campaign that has been honest about where the team is — at the back, learning fast.',
    careerStats: { wins: 6, podiums: 39, titles: 0, races: 281 }, posChange: 0,
  },
  {
    id: 'alo', pos: 21, name: 'Fernando Alonso', code: 'ALO', number: 14, team: 'Aston Martin',
    country: '🇪🇸', pts: 0, gap: -75, color: TEAM_COLORS['Aston Martin'],
    bio: 'A dismal start to the season. Aston Martin have not delivered the regulation reset. Alonso has not finished higher than 11th in three rounds.',
    careerStats: { wins: 32, podiums: 106, titles: 2, races: 416 }, posChange: -13,
  },
  {
    id: 'str', pos: 22, name: 'Lance Stroll', code: 'STR', number: 18, team: 'Aston Martin',
    country: '🇨🇦', pts: 0, gap: -75, color: TEAM_COLORS['Aston Martin'],
    bio: 'Pointless and out-paced by Alonso. The toughest opening to a season of his career.',
    careerStats: { wins: 0, podiums: 3, titles: 0, races: 201 }, posChange: -1,
  },
];

export const TEAMS: Team[] = [
  { id: 'mercedes',     pos: 1,  name: 'Mercedes',     engine: 'Mercedes', country: '🇩🇪', pts: 143, color: TEAM_COLORS['Mercedes'],     posChange: 0 },
  { id: 'ferrari',      pos: 2,  name: 'Ferrari',      engine: 'Ferrari',  country: '🇮🇹', pts: 98,  color: TEAM_COLORS['Ferrari'],      posChange: 0 },
  { id: 'mclaren',      pos: 3,  name: 'McLaren',      engine: 'Mercedes', country: '🇬🇧', pts: 61,  color: TEAM_COLORS['McLaren'],      posChange: 0 },
  { id: 'red-bull',     pos: 4,  name: 'Red Bull',     engine: 'Ford',     country: '🇦🇹', pts: 20,  color: TEAM_COLORS['Red Bull'],     posChange: 0 },
  { id: 'haas',         pos: 5,  name: 'Haas',         engine: 'Ferrari',  country: '🇺🇸', pts: 18,  color: TEAM_COLORS['Haas'],         posChange: 4 },
  { id: 'alpine',       pos: 6,  name: 'Alpine',       engine: 'Renault',  country: '🇫🇷', pts: 17,  color: TEAM_COLORS['Alpine'],       posChange: 1 },
  { id: 'racing-bulls', pos: 7,  name: 'Racing Bulls', engine: 'Ford',     country: '🇮🇹', pts: 14,  color: TEAM_COLORS['Racing Bulls'], posChange: 2 },
  { id: 'audi',         pos: 8,  name: 'Audi',         engine: 'Audi',     country: '🇩🇪', pts: 2,   color: TEAM_COLORS['Audi'],         posChange: 0 },
  { id: 'williams',     pos: 9,  name: 'Williams',     engine: 'Mercedes', country: '🇬🇧', pts: 2,   color: TEAM_COLORS['Williams'],     posChange: -4 },
  { id: 'cadillac',     pos: 10, name: 'Cadillac',     engine: 'Ferrari',  country: '🇺🇸', pts: 0,   color: TEAM_COLORS['Cadillac'],     posChange: 0 },
  { id: 'aston-martin', pos: 11, name: 'Aston Martin', engine: 'Honda',    country: '🇬🇧', pts: 0,   color: TEAM_COLORS['Aston Martin'], posChange: -5 },
];

export const CALENDAR: Race[] = [
  {
    round: 1, country: 'Australia', flag: '🇦🇺', circuit: 'Albert Park Circuit', circuitId: 'melbourne',
    date: '2026-03-08', location: 'Melbourne', laps: 58, distance: '306.124 km',
    isDone: true, winner: 'George Russell', weather: 'Dry · 21°C',
    podiumDetailed: [
      { driver: 'RUS', team: 'Mercedes', gap: '+0.000' },
      { driver: 'ANT', team: 'Mercedes', gap: '+2.974' },
      { driver: 'LEC', team: 'Ferrari',  gap: '+15.519' },
    ],
    fastestLap: { driver: 'RUS', time: '1:18.991' },
    tyreCompounds: ['soft', 'medium', 'hard'],
  },
  {
    round: 2, country: 'China', flag: '🇨🇳', circuit: 'Shanghai International Circuit', circuitId: 'shanghai',
    date: '2026-03-15', location: 'Shanghai', laps: 56, distance: '305.066 km',
    isDone: true, winner: 'Andrea Kimi Antonelli', weather: 'Dry · 24°C',
    podiumDetailed: [
      { driver: 'ANT', team: 'Mercedes', gap: '+0.000' },
      { driver: 'RUS', team: 'Mercedes', gap: '+5.515' },
      { driver: 'HAM', team: 'Ferrari',  gap: '+25.267' },
    ],
    fastestLap: { driver: 'ANT', time: '1:32.008' },
    tyreCompounds: ['soft', 'medium'],
  },
  {
    round: 3, country: 'Japan', flag: '🇯🇵', circuit: 'Suzuka International Racing Course', circuitId: 'suzuka',
    date: '2026-03-29', location: 'Suzuka', laps: 53, distance: '307.471 km',
    isDone: true, winner: 'Andrea Kimi Antonelli', weather: 'Dry · 18°C',
    podiumDetailed: [
      { driver: 'ANT', team: 'Mercedes', gap: '+0.000' },
      { driver: 'PIA', team: 'McLaren',  gap: '+13.722' },
      { driver: 'LEC', team: 'Ferrari',  gap: '+15.270' },
    ],
    fastestLap: { driver: 'ANT', time: '1:30.412' },
    tyreCompounds: ['medium', 'hard'],
  },
  {
    round: 4, country: 'United States', flag: '🇺🇸', circuit: 'Miami International Autodrome', circuitId: 'miami',
    date: '2026-05-03', location: 'Miami', laps: 57, distance: '308.326 km',
    isNext: true,
    sessions: [
      { type: 'FP1',                date: '2026-05-01', time: '12:00 ET / 17:00 BST', status: 'completed' },
      { type: 'Sprint Qualifying',  date: '2026-05-01', time: '16:30 ET / 21:30 BST', status: 'completed' },
      { type: 'Sprint',             date: '2026-05-02', time: '12:00 ET / 17:00 BST', status: 'completed' },
      { type: 'Qualifying',         date: '2026-05-02', time: '16:00 ET / 21:00 BST', status: 'completed' },
      { type: 'Race',               date: '2026-05-03', time: '13:00 ET / 18:00 BST', status: 'live' },
    ],
  },
  { round: 5,  country: 'Canada',         flag: '🇨🇦', circuit: 'Circuit Gilles Villeneuve',     circuitId: 'montreal',    date: '2026-05-24', location: 'Montréal' },
  { round: 6,  country: 'Monaco',         flag: '🇲🇨', circuit: 'Circuit de Monaco',             circuitId: 'monaco',      date: '2026-06-07', location: 'Monte Carlo' },
  { round: 7,  country: 'Catalunya',      flag: '🇪🇸', circuit: 'Circuit de Barcelona-Catalunya',circuitId: 'barcelona',   date: '2026-06-14', location: 'Barcelona' },
  { round: 8,  country: 'Austria',        flag: '🇦🇹', circuit: 'Red Bull Ring',                 circuitId: 'spielberg',   date: '2026-06-28', location: 'Spielberg' },
  { round: 9,  country: 'United Kingdom', flag: '🇬🇧', circuit: 'Silverstone Circuit',           circuitId: 'silverstone', date: '2026-07-05', location: 'Silverstone' },
  { round: 10, country: 'Belgium',        flag: '🇧🇪', circuit: 'Circuit de Spa-Francorchamps',  circuitId: 'spa',         date: '2026-07-19', location: 'Spa' },
  { round: 11, country: 'Hungary',        flag: '🇭🇺', circuit: 'Hungaroring',                   circuitId: 'hungary',     date: '2026-07-26', location: 'Budapest' },
  { round: 12, country: 'Netherlands',    flag: '🇳🇱', circuit: 'Circuit Zandvoort',             circuitId: 'zandvoort',   date: '2026-08-23', location: 'Zandvoort' },
  { round: 13, country: 'Italy',          flag: '🇮🇹', circuit: 'Autodromo Nazionale Monza',     circuitId: 'monza',       date: '2026-09-06', location: 'Monza' },
  { round: 14, country: 'Spain',          flag: '🇪🇸', circuit: 'Madring (Circuito IFEMA Madrid)', circuitId: 'madrid',    date: '2026-09-13', location: 'Madrid' },
  { round: 15, country: 'Azerbaijan',     flag: '🇦🇿', circuit: 'Baku City Circuit',             circuitId: 'baku',        date: '2026-09-26', location: 'Baku' },
  { round: 16, country: 'Singapore',      flag: '🇸🇬', circuit: 'Marina Bay Street Circuit',     circuitId: 'singapore',   date: '2026-10-11', location: 'Singapore' },
  { round: 17, country: 'United States',  flag: '🇺🇸', circuit: 'Circuit of the Americas',       circuitId: 'cota',        date: '2026-10-25', location: 'Austin' },
  { round: 18, country: 'Mexico',         flag: '🇲🇽', circuit: 'Autódromo Hermanos Rodríguez',  circuitId: 'mexico',      date: '2026-11-01', location: 'Mexico City' },
  { round: 19, country: 'Brazil',         flag: '🇧🇷', circuit: 'Interlagos',                    circuitId: 'interlagos',  date: '2026-11-08', location: 'São Paulo' },
  { round: 20, country: 'United States',  flag: '🇺🇸', circuit: 'Las Vegas Strip Circuit',       circuitId: 'lasvegas',    date: '2026-11-21', location: 'Las Vegas' },
  { round: 21, country: 'Qatar',          flag: '🇶🇦', circuit: 'Lusail International Circuit',  circuitId: 'lusail',      date: '2026-11-29', location: 'Lusail' },
  { round: 22, country: 'Abu Dhabi',      flag: '🇦🇪', circuit: 'Yas Marina Circuit',            circuitId: 'yasmarina',   date: '2026-12-06', location: 'Abu Dhabi' },
];

export const NEWS: NewsItem[] = [
  { id: 1, kicker: 'CHAMPIONSHIP', headline: 'Antonelli leads after Suzuka — youngest leader in F1 history', body: 'Andrea Kimi Antonelli, 19, has become the youngest driver ever to lead the Formula 1 World Championship. Two consecutive wins in China and Japan, both from pole, and a 7-point cushion over team-mate George Russell. Mercedes have built the dominant car of the new regulation era and the rookie generation is delivering on every promise.', type: 'lead' },
  { id: 2, kicker: 'STRATEGY', headline: 'Mercedes have a 45-point cushion in the constructors\' fight', body: 'Three races, three wins, both drivers in the top two. The W17 is the most efficient deployment of the new 350kW MGU-K and the team is converting that into pace and reliability. Ferrari are 45 points back; McLaren are a distant third on 61.' },
  { id: 3, kicker: 'PADDOCK', headline: 'Verstappen and Norris stuck in the wrong half of the points', body: 'The four-time champion sits ninth on 16 points after a tough triple-header. Reigning champion Norris is fifth on 33. Neither McLaren nor Red Bull has solved the new aero / power-unit balance the way Mercedes and Ferrari have.' },
  { id: 4, kicker: 'TECHNICAL', headline: 'The MGU-K Hybrid+ is reshaping race strategy', body: 'The retirement of the MGU-H and the move to a 50/50 power split has changed the calculus on energy deployment. Mercedes have the most efficient deployment software in the field and the lap-time advantage shows on tracks with long acceleration phases.' },
  { id: 5, kicker: 'DRIVER', headline: 'Bearman bounces back from a 50G crash to score in Miami', body: 'A heavy accident at Suzuka briefly threatened his weekend but the Briton bounced back, scored points in Miami sprint and now sits seventh in the championship. Haas have built the surprise package of 2026.' },
];

// Driver identity. DRIVER_NUMBER_MAP (OpenF1 car number to app id) and
// DRIVER_CODE_MAP (Jolpica three-letter code to app id) are the only places
// where the two upstream identities are reconciled. Never key on surname.
export const DRIVER_NUMBER_MAP: Record<number, string> = {
  1: 'nor', 81: 'pia',
  3: 'ver', 6: 'had',
  16: 'lec', 44: 'ham',
  63: 'rus', 12: 'ant',
  14: 'alo', 18: 'str',
  55: 'sai', 23: 'alb',
  10: 'gas', 43: 'col',
  31: 'oco', 87: 'bea',
  27: 'hul', 5: 'bor',
  41: 'lin', 30: 'law',
  11: 'per', 77: 'bot',
};

export const DRIVER_CODE_MAP: Record<string, string> = {
  NOR: 'nor', PIA: 'pia',
  VER: 'ver', HAD: 'had',
  LEC: 'lec', HAM: 'ham',
  RUS: 'rus', ANT: 'ant',
  ALO: 'alo', STR: 'str',
  SAI: 'sai', ALB: 'alb',
  GAS: 'gas', COL: 'col',
  OCO: 'oco', BEA: 'bea',
  HUL: 'hul', BOR: 'bor',
  LIN: 'lin', LAW: 'law',
  PER: 'per', BOT: 'bot',
};

// Jolpica constructor ids to the team names used across the app and in
// TEAM_COLORS. Both the pre-2026 and 2026 ids are listed where they differ.
export const CONSTRUCTOR_ID_MAP: Record<string, string> = {
  mercedes: 'Mercedes',
  ferrari: 'Ferrari',
  mclaren: 'McLaren',
  red_bull: 'Red Bull',
  haas: 'Haas',
  alpine: 'Alpine',
  rb: 'Racing Bulls',
  racing_bulls: 'Racing Bulls',
  audi: 'Audi',
  sauber: 'Audi',
  williams: 'Williams',
  cadillac: 'Cadillac',
  aston_martin: 'Aston Martin',
};
