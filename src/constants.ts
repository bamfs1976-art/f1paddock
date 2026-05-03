import type { Driver, Team, Race, NewsItem } from './types';

export const TEAM_COLORS: Record<string, string> = {
  'Red Bull': '#3671C6',
  'Mercedes': '#27F4D2',
  'Ferrari': '#E8002D',
  'McLaren': '#FF8000',
  'Aston Martin': '#229971',
  'Alpine': '#0093CC',
  'Williams': '#64C4FF',
  'Haas': '#B6BABD',
  'Racing Bulls': '#6692FF',
  'Audi': '#00877C',
};

export const DRIVERS: Driver[] = [
  {
    id: 'nor', pos: 1, name: 'Lando Norris', code: 'NOR', number: 4, team: 'McLaren',
    country: '🇬🇧', pts: 122, gap: 'LEADER', color: TEAM_COLORS['McLaren'],
    bio: 'Norris arrived at the 2026 season with the form of a champion-in-waiting and has converted it. Three wins in the opening five rounds, ruthless qualifying speed, and the most consistent race pace on the grid.',
    careerStats: { wins: 11, podiums: 38, titles: 0, races: 142 }, posChange: 1,
  },
  {
    id: 'ver', pos: 2, name: 'Max Verstappen', code: 'VER', number: 1, team: 'Red Bull',
    country: '🇳🇱', pts: 109, gap: -13, color: TEAM_COLORS['Red Bull'],
    bio: 'The four-time champion is wringing every tenth from a Red Bull that no longer dominates. Two wins, a hostile defence in Suzuka, and a championship still firmly in reach.',
    careerStats: { wins: 67, podiums: 117, titles: 4, races: 220 }, posChange: -1,
  },
  {
    id: 'pia', pos: 3, name: 'Oscar Piastri', code: 'PIA', number: 81, team: 'McLaren',
    country: '🇦🇺', pts: 98, gap: -24, color: TEAM_COLORS['McLaren'],
    bio: 'A win in China and four podiums anchor the second McLaren campaign. Cooler than ever in wheel-to-wheel battle.',
    careerStats: { wins: 5, podiums: 22, titles: 0, races: 88 }, posChange: 0,
  },
  {
    id: 'lec', pos: 4, name: 'Charles Leclerc', code: 'LEC', number: 16, team: 'Ferrari',
    country: '🇲🇨', pts: 86, gap: -36, color: TEAM_COLORS['Ferrari'],
    bio: 'The senior Ferrari driver is rebuilding his title campaign with a car that finally rotates the way he asked for. A Monza-tested understanding of the new aero rules has paid off.',
    careerStats: { wins: 9, podiums: 44, titles: 0, races: 156 }, posChange: 1,
  },
  {
    id: 'ham', pos: 5, name: 'Lewis Hamilton', code: 'HAM', number: 44, team: 'Ferrari',
    country: '🇬🇧', pts: 71, gap: -51, color: TEAM_COLORS['Ferrari'],
    bio: 'Year two in red. Hamilton is finding the SF-26 to his liking and has out-qualified Leclerc twice. The pursuit of an eighth title remains alive.',
    careerStats: { wins: 105, podiums: 203, titles: 7, races: 367 }, posChange: 0,
  },
  {
    id: 'rus', pos: 6, name: 'George Russell', code: 'RUS', number: 63, team: 'Mercedes',
    country: '🇬🇧', pts: 64, gap: -58, color: TEAM_COLORS['Mercedes'],
    bio: 'Mercedes are back in the picture with the new power unit. Russell has converted that into a podium and steady top-five finishes.',
    careerStats: { wins: 4, podiums: 19, titles: 0, races: 138 }, posChange: -1,
  },
  {
    id: 'ant', pos: 7, name: 'Andrea Kimi Antonelli', code: 'ANT', number: 12, team: 'Mercedes',
    country: '🇮🇹', pts: 48, gap: -74, color: TEAM_COLORS['Mercedes'],
    bio: 'Year two for Antonelli. The Italian has matured into a consistent points scorer and out-paced Russell in two qualifying sessions.',
    careerStats: { wins: 0, podiums: 2, titles: 0, races: 29 }, posChange: 2,
  },
  {
    id: 'alo', pos: 8, name: 'Fernando Alonso', code: 'ALO', number: 14, team: 'Aston Martin',
    country: '🇪🇸', pts: 41, gap: -81, color: TEAM_COLORS['Aston Martin'],
    bio: 'Newey-led Aston Martin has built a competitive package and Alonso is extracting every ounce. A podium in Australia signalled intent.',
    careerStats: { wins: 32, podiums: 107, titles: 2, races: 414 }, posChange: 1,
  },
  {
    id: 'sai', pos: 9, name: 'Carlos Sainz', code: 'SAI', number: 55, team: 'Williams',
    country: '🇪🇸', pts: 33, gap: -89, color: TEAM_COLORS['Williams'],
    bio: 'Sainz is delivering on the Williams gamble. The FW48 has a strong race pace and the Spaniard has scored in every points-paying race.',
    careerStats: { wins: 4, podiums: 27, titles: 0, races: 220 }, posChange: 3,
  },
  {
    id: 'gas', pos: 10, name: 'Pierre Gasly', code: 'GAS', number: 10, team: 'Alpine',
    country: '🇫🇷', pts: 22, gap: -100, color: TEAM_COLORS['Alpine'],
    bio: 'Alpine\'s reset year is starting to bear fruit. Gasly leads the team\'s recovery with a steady run of points.',
    careerStats: { wins: 1, podiums: 5, titles: 0, races: 173 }, posChange: 0,
  },
  {
    id: 'alb', pos: 11, name: 'Alex Albon', code: 'ALB', number: 23, team: 'Williams',
    country: '🇹🇭', pts: 19, gap: -103, color: TEAM_COLORS['Williams'],
    bio: 'Albon continues to extract midfield podium contention from the Williams package and has out-qualified Sainz once.',
    careerStats: { wins: 0, podiums: 2, titles: 0, races: 109 }, posChange: -2,
  },
  {
    id: 'hul', pos: 12, name: 'Nico Hülkenberg', code: 'HUL', number: 27, team: 'Audi',
    country: '🇩🇪', pts: 14, gap: -108, color: TEAM_COLORS['Audi'],
    bio: 'Audi\'s factory entry has impressed in straight-line speed. Hülkenberg has scored points in three of five races.',
    careerStats: { wins: 0, podiums: 1, titles: 0, races: 248 }, posChange: 1,
  },
  {
    id: 'tsu', pos: 13, name: 'Yuki Tsunoda', code: 'TSU', number: 22, team: 'Red Bull',
    country: '🇯🇵', pts: 12, gap: -110, color: TEAM_COLORS['Red Bull'],
    bio: 'A second season alongside Verstappen. Tsunoda has out-qualified Max once and is closing the gap.',
    careerStats: { wins: 0, podiums: 0, titles: 0, races: 110 }, posChange: 0,
  },
  {
    id: 'str', pos: 14, name: 'Lance Stroll', code: 'STR', number: 18, team: 'Aston Martin',
    country: '🇨🇦', pts: 9, gap: -113, color: TEAM_COLORS['Aston Martin'],
    bio: 'Stroll has scored in two races but has been comprehensively out-paced by Alonso.',
    careerStats: { wins: 0, podiums: 3, titles: 0, races: 199 }, posChange: -2,
  },
  {
    id: 'bor', pos: 15, name: 'Gabriel Bortoleto', code: 'BOR', number: 5, team: 'Audi',
    country: '🇧🇷', pts: 6, gap: -116, color: TEAM_COLORS['Audi'],
    bio: 'The 2024 F2 champion is in his second F1 season. Two points-scoring drives and signs of clear progress.',
    careerStats: { wins: 0, podiums: 0, titles: 0, races: 26 }, posChange: 1,
  },
  {
    id: 'oco', pos: 16, name: 'Esteban Ocon', code: 'OCO', number: 31, team: 'Haas',
    country: '🇫🇷', pts: 4, gap: -118, color: TEAM_COLORS['Haas'],
    bio: 'Senior driver at Haas. A lone points finish in Bahrain is the highlight of a tough start.',
    careerStats: { wins: 1, podiums: 4, titles: 0, races: 178 }, posChange: 0,
  },
  {
    id: 'had', pos: 17, name: 'Isack Hadjar', code: 'HAD', number: 6, team: 'Racing Bulls',
    country: '🇫🇷', pts: 3, gap: -119, color: TEAM_COLORS['Racing Bulls'],
    bio: 'Year two for Hadjar at Racing Bulls. Strong qualifying form has not yet translated into results.',
    careerStats: { wins: 0, podiums: 0, titles: 0, races: 26 }, posChange: 1,
  },
  {
    id: 'bea', pos: 18, name: 'Oliver Bearman', code: 'BEA', number: 87, team: 'Haas',
    country: '🇬🇧', pts: 2, gap: -120, color: TEAM_COLORS['Haas'],
    bio: 'A rookie season made up for in qualifying speed. Bearman has out-qualified Ocon twice.',
    careerStats: { wins: 0, podiums: 0, titles: 0, races: 28 }, posChange: 2,
  },
  {
    id: 'law', pos: 19, name: 'Liam Lawson', code: 'LAW', number: 30, team: 'Racing Bulls',
    country: '🇳🇿', pts: 1, gap: -121, color: TEAM_COLORS['Racing Bulls'],
    bio: 'Lawson is finding his rhythm after a tough opening to the year.',
    careerStats: { wins: 0, podiums: 0, titles: 0, races: 24 }, posChange: -1,
  },
  {
    id: 'col', pos: 20, name: 'Franco Colapinto', code: 'COL', number: 43, team: 'Alpine',
    country: '🇦🇷', pts: 0, gap: -122, color: TEAM_COLORS['Alpine'],
    bio: 'A pointless start to a full Alpine season. The pace is there in qualifying but race day has not delivered.',
    careerStats: { wins: 0, podiums: 0, titles: 0, races: 33 }, posChange: 0,
  },
];

export const TEAMS: Team[] = [
  { id: 'mclaren', pos: 1, name: 'McLaren', engine: 'Mercedes', country: '🇬🇧', pts: 220, color: TEAM_COLORS['McLaren'], posChange: 0 },
  { id: 'ferrari', pos: 2, name: 'Ferrari', engine: 'Ferrari', country: '🇮🇹', pts: 157, color: TEAM_COLORS['Ferrari'], posChange: 1 },
  { id: 'redbull', pos: 3, name: 'Red Bull', engine: 'Ford', country: '🇦🇹', pts: 121, color: TEAM_COLORS['Red Bull'], posChange: -1 },
  { id: 'mercedes', pos: 4, name: 'Mercedes', engine: 'Mercedes', country: '🇩🇪', pts: 112, color: TEAM_COLORS['Mercedes'], posChange: 0 },
  { id: 'aston-martin', pos: 5, name: 'Aston Martin', engine: 'Honda', country: '🇬🇧', pts: 50, color: TEAM_COLORS['Aston Martin'], posChange: 1 },
  { id: 'williams', pos: 6, name: 'Williams', engine: 'Mercedes', country: '🇬🇧', pts: 52, color: TEAM_COLORS['Williams'], posChange: 1 },
  { id: 'alpine', pos: 7, name: 'Alpine', engine: 'Renault', country: '🇫🇷', pts: 22, color: TEAM_COLORS['Alpine'], posChange: -2 },
  { id: 'audi', pos: 8, name: 'Audi', engine: 'Audi', country: '🇩🇪', pts: 20, color: TEAM_COLORS['Audi'], posChange: 0 },
  { id: 'racing-bulls', pos: 9, name: 'Racing Bulls', engine: 'Ford', country: '🇮🇹', pts: 4, color: TEAM_COLORS['Racing Bulls'], posChange: -1 },
  { id: 'haas', pos: 10, name: 'Haas', engine: 'Ferrari', country: '🇺🇸', pts: 6, color: TEAM_COLORS['Haas'], posChange: 0 },
];

export const CALENDAR: Race[] = [
  {
    round: 1, country: 'Bahrain', flag: '🇧🇭', circuit: 'Bahrain International Circuit', circuitId: 'bahrain',
    date: '2026-03-08', location: 'Sakhir', laps: 57, distance: '308.238 km',
    isDone: true, winner: 'Lando Norris', weather: 'Dry · 28°C',
    podiumDetailed: [
      { driver: 'NOR', team: 'McLaren', gap: '+0.000' },
      { driver: 'VER', team: 'Red Bull', gap: '+4.218' },
      { driver: 'PIA', team: 'McLaren', gap: '+9.044' },
    ],
    fastestLap: { driver: 'NOR', time: '1:31.247' },
    tyreCompounds: ['soft', 'medium', 'hard'],
  },
  {
    round: 2, country: 'Saudi Arabia', flag: '🇸🇦', circuit: 'Jeddah Corniche Circuit', circuitId: 'jeddah',
    date: '2026-03-22', location: 'Jeddah', laps: 50, distance: '308.450 km',
    isDone: true, winner: 'Max Verstappen', weather: 'Dry · 30°C',
    podiumDetailed: [
      { driver: 'VER', team: 'Red Bull', gap: '+0.000' },
      { driver: 'NOR', team: 'McLaren', gap: '+1.876' },
      { driver: 'LEC', team: 'Ferrari', gap: '+8.412' },
    ],
    fastestLap: { driver: 'VER', time: '1:29.011' },
    tyreCompounds: ['soft', 'medium', 'hard'],
  },
  {
    round: 3, country: 'Australia', flag: '🇦🇺', circuit: 'Albert Park Circuit', circuitId: 'melbourne',
    date: '2026-04-05', location: 'Melbourne', laps: 58, distance: '306.124 km',
    isDone: true, winner: 'Lando Norris', weather: 'Dry · 21°C',
    podiumDetailed: [
      { driver: 'NOR', team: 'McLaren', gap: '+0.000' },
      { driver: 'PIA', team: 'McLaren', gap: '+2.910' },
      { driver: 'ALO', team: 'Aston Martin', gap: '+11.502' },
    ],
    fastestLap: { driver: 'PIA', time: '1:18.991' },
    tyreCompounds: ['soft', 'medium', 'hard'],
  },
  {
    round: 4, country: 'Japan', flag: '🇯🇵', circuit: 'Suzuka International Racing Course', circuitId: 'suzuka',
    date: '2026-04-12', location: 'Suzuka', laps: 53, distance: '307.471 km',
    isDone: true, winner: 'Max Verstappen', weather: 'Dry · 18°C',
    podiumDetailed: [
      { driver: 'VER', team: 'Red Bull', gap: '+0.000' },
      { driver: 'NOR', team: 'McLaren', gap: '+0.812' },
      { driver: 'LEC', team: 'Ferrari', gap: '+6.221' },
    ],
    fastestLap: { driver: 'VER', time: '1:30.412' },
    tyreCompounds: ['medium', 'hard'],
  },
  {
    round: 5, country: 'China', flag: '🇨🇳', circuit: 'Shanghai International Circuit', circuitId: 'shanghai',
    date: '2026-04-26', location: 'Shanghai', laps: 56, distance: '305.066 km',
    isDone: true, winner: 'Oscar Piastri', weather: 'Dry · 24°C',
    podiumDetailed: [
      { driver: 'PIA', team: 'McLaren', gap: '+0.000' },
      { driver: 'NOR', team: 'McLaren', gap: '+3.108' },
      { driver: 'HAM', team: 'Ferrari', gap: '+9.667' },
    ],
    fastestLap: { driver: 'NOR', time: '1:32.008' },
    tyreCompounds: ['soft', 'medium'],
  },
  {
    round: 6, country: 'United States', flag: '🇺🇸', circuit: 'Miami International Autodrome', circuitId: 'miami',
    date: '2026-05-10', location: 'Miami', laps: 57, distance: '308.326 km',
    isNext: true,
    sessions: [
      { type: 'FP1',                date: '2026-05-08', time: '12:30 ET', status: 'upcoming' },
      { type: 'Sprint Qualifying',  date: '2026-05-08', time: '16:30 ET', status: 'upcoming' },
      { type: 'Sprint',             date: '2026-05-09', time: '12:00 ET', status: 'upcoming' },
      { type: 'Qualifying',         date: '2026-05-09', time: '16:00 ET', status: 'upcoming' },
      { type: 'Race',               date: '2026-05-10', time: '16:00 ET', status: 'upcoming' },
    ],
  },
  { round: 7,  country: 'Italy',         flag: '🇮🇹', circuit: 'Imola',                       circuitId: 'imola',     date: '2026-05-24', location: 'Imola' },
  { round: 8,  country: 'Monaco',        flag: '🇲🇨', circuit: 'Circuit de Monaco',           circuitId: 'monaco',    date: '2026-05-31', location: 'Monte Carlo' },
  { round: 9,  country: 'Spain',         flag: '🇪🇸', circuit: 'Circuit de Barcelona-Catalunya', circuitId: 'barcelona', date: '2026-06-14', location: 'Barcelona' },
  { round: 10, country: 'Canada',        flag: '🇨🇦', circuit: 'Circuit Gilles Villeneuve',    circuitId: 'montreal',  date: '2026-06-28', location: 'Montréal' },
  { round: 11, country: 'Austria',       flag: '🇦🇹', circuit: 'Red Bull Ring',                circuitId: 'spielberg', date: '2026-07-05', location: 'Spielberg' },
  { round: 12, country: 'United Kingdom',flag: '🇬🇧', circuit: 'Silverstone Circuit',          circuitId: 'silverstone', date: '2026-07-19', location: 'Silverstone' },
  { round: 13, country: 'Belgium',       flag: '🇧🇪', circuit: 'Circuit de Spa-Francorchamps', circuitId: 'spa',       date: '2026-08-02', location: 'Spa' },
  { round: 14, country: 'Hungary',       flag: '🇭🇺', circuit: 'Hungaroring',                  circuitId: 'hungary',   date: '2026-08-23', location: 'Budapest' },
  { round: 15, country: 'Netherlands',   flag: '🇳🇱', circuit: 'Circuit Zandvoort',            circuitId: 'zandvoort', date: '2026-09-06', location: 'Zandvoort' },
  { round: 16, country: 'Italy',         flag: '🇮🇹', circuit: 'Autodromo Nazionale Monza',    circuitId: 'monza',     date: '2026-09-13', location: 'Monza' },
  { round: 17, country: 'Azerbaijan',    flag: '🇦🇿', circuit: 'Baku City Circuit',            circuitId: 'baku',      date: '2026-09-27', location: 'Baku' },
  { round: 18, country: 'Singapore',     flag: '🇸🇬', circuit: 'Marina Bay Street Circuit',    circuitId: 'singapore', date: '2026-10-11', location: 'Singapore' },
  { round: 19, country: 'United States', flag: '🇺🇸', circuit: 'Circuit of the Americas',      circuitId: 'cota',      date: '2026-10-25', location: 'Austin' },
  { round: 20, country: 'Mexico',        flag: '🇲🇽', circuit: 'Autódromo Hermanos Rodríguez', circuitId: 'mexico',    date: '2026-11-01', location: 'Mexico City' },
  { round: 21, country: 'Brazil',        flag: '🇧🇷', circuit: 'Interlagos',                   circuitId: 'interlagos', date: '2026-11-15', location: 'São Paulo' },
  { round: 22, country: 'United States', flag: '🇺🇸', circuit: 'Las Vegas Strip Circuit',      circuitId: 'lasvegas',  date: '2026-11-21', location: 'Las Vegas' },
  { round: 23, country: 'Qatar',         flag: '🇶🇦', circuit: 'Lusail International Circuit', circuitId: 'lusail',    date: '2026-11-29', location: 'Lusail' },
  { round: 24, country: 'Abu Dhabi',     flag: '🇦🇪', circuit: 'Yas Marina Circuit',           circuitId: 'yasmarina', date: '2026-12-06', location: 'Abu Dhabi' },
];

export const NEWS: NewsItem[] = [
  { id: 1, kicker: 'STRATEGY', headline: 'McLaren\'s 2026 dominance: aero balance is the difference', body: 'Five races into the new regulations, McLaren has converted its winter wind-tunnel programme into the most balanced car on the grid. Norris and Piastri are the only pairing to score in every race so far. The MCL40\'s active aero package responds 0.04 seconds faster to throttle inputs than the Red Bull, which is buying the team three to five tenths a lap on medium-speed corners.', type: 'lead' },
  { id: 2, kicker: 'TECHNICAL', headline: 'The MGU-K Hybrid+ is reshaping race strategy', body: 'The retirement of the MGU-H and the move to a 50/50 power split has changed the calculus on energy deployment. Teams are now front-loading electrical boost into qualifying and managing carefully across stints. Ferrari\'s SF-26 is reported to have the most efficient deployment software in the field.' },
  { id: 3, kicker: 'PADDOCK', headline: 'Audi factory entry impresses in straight-line speed', body: 'The Sauber-to-Audi transition has produced a power unit that is, on paper, the strongest in the field on top speed. Hülkenberg has converted that into points in three of five rounds. The chassis side remains a development priority.' },
  { id: 4, kicker: 'DRIVER', headline: 'Antonelli enters his second season with a quiet edge', body: 'The Italian rookie of 2025 has come back in 2026 with a calmer head and faster hands. Two qualifying head-to-heads against Russell so far. Mercedes are pleased with how he is handling the rebuilt power unit.' },
  { id: 5, kicker: 'REGULATION', headline: 'Active aero working as advertised — for some', body: 'The new movable wings have produced clean overtakes and tight racing in Bahrain and Suzuka. But teams that misread the activation logic in qualifying have lost up to two tenths a lap. McLaren and Ferrari have led on this front.' },
];

export const DRIVER_NUMBER_MAP: Record<number, string> = {
  1: 'ver', 4: 'nor', 16: 'lec', 44: 'ham', 63: 'rus',
  81: 'pia', 14: 'alo', 27: 'hul', 12: 'ant', 10: 'gas',
  22: 'tsu', 18: 'str', 23: 'alb', 55: 'sai', 31: 'oco',
  87: 'bea', 6: 'had', 30: 'law', 5: 'bor', 43: 'col',
};
