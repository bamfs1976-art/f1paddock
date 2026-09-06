export interface Driver {
  id: string;
  pos: number;
  name: string;
  code: string;
  team: string;
  country: string;
  pts: number;
  gap: number | string;
  color: string;
  isFav?: boolean;
  bio?: string;
  careerStats?: { wins: number; podiums: number; titles: number; races: number };
  image?: string;
  posChange?: number;
  number?: number;
  wins?: number;
}

export interface Team {
  id: string;
  pos: number;
  name: string;
  engine: string;
  country: string;
  pts: number;
  color: string;
  isFav?: boolean;
  posChange?: number;
  wins?: number;
}

// Static circuit metadata, one entry per round, edited by hand in constants.ts.
export interface Race {
  round: number;
  country: string;
  flag: string;
  circuit: string;
  circuitId?: string;   // key into CircuitMap paths
  ergastId?: string;    // Jolpica circuitId, used to match schedule rows
  date: string;         // fallback race date, yyyy-mm-dd
  location?: string;
  laps?: number;
  distance?: string;
}

// A session in the merged schedule (see scheduleService).
export interface ScheduleSession {
  name: string;          // real session name: Practice 1, Sprint Qualifying, Qualifying, Race
  dateStart: string;     // ISO datetime
  dateEnd: string;       // ISO datetime; estimated when the source has no end time
  sessionKey?: number;   // OpenF1 session key when known
  source: 'openf1' | 'jolpica' | 'static';
}

// One round of the season merged from static metadata, Jolpica and OpenF1.
export interface ScheduleRound extends Race {
  name: string;          // "Italian Grand Prix"
  meetingKey?: number;
  raceStart?: string;    // ISO datetime of the race start when known
  isSprint: boolean;
  sessions: ScheduleSession[];
}

export interface Stint {
  driver_number: number;
  stint_number: number;
  lap_start: number;
  lap_end: number;
  compound: string;
  tyre_age_at_start?: number;
}

export interface NewsItem {
  id: number;
  kicker: string;
  headline: string;
  body: string;
  type?: 'lead' | 'neutral';
}

export interface PitStop {
  driverCode: string;
  lap: number;
  duration: number;
  tyreFrom?: string;
  tyreTo?: string;
}

export interface RaceControlMessage {
  timestamp: string;
  category: 'Flag' | 'SafetyCar' | 'DRS' | 'Penalty' | 'Other';
  message: string;
  flag?: string;
  driver?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface TickerItem {
  sym: string;
  val: string;
  pts: string;
}

export interface PaddockIntelData {
  news: NewsItem[];
  paddockIntel: string;
  ticker: TickerItem[];
  racePreview?: {
    circuit: string;
    keyStorylines: string;
    tyreExpectation: string;
    weatherOutlook: string;
  };
}

export interface DriverAnalysis {
  summary: string;
  paceRating: { driverA: number; driverB: number };
  consistencyRating: { driverA: number; driverB: number };
  tyreManagement: { driverA: number; driverB: number };
  raceCraft: { driverA: number; driverB: number };
  verdict: string;
}

export interface LiveSyncState {
  timestamp: number;
  latency: number;
  positions: { driver_number: number; position: number }[];
  weather: WeatherData | null;
  raceControl: RaceControlMessage[];
  pitStops: PitStop[];
  sessionKey: number | null;
  sessionName: string | null;
}

export interface WeatherData {
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  pressure?: number;
  rainfall: number;
  wind_direction?: number;
  wind_speed: number;
}

export interface TelemetryData {
  speed: number;
  gear: number;
  rpm: number;
  drs: boolean;
  throttle: number;
  brake: number;
}

export interface LapData {
  lap_number: number;
  lap_duration: number | null;
  duration_sector_1?: number | null;
  duration_sector_2?: number | null;
  duration_sector_3?: number | null;
  is_pit_out_lap?: boolean;
  compound?: string;
}

export interface UserPreferences {
  favourite_drivers: string[];
  favourite_teams: string[];
  theme: 'dark' | 'light';
}

// Live standings and results from Jolpica (see standingsService).
export interface DriverStanding {
  position: number;
  points: number;
  wins: number;
  driverId: string;   // Jolpica id, e.g. "antonelli"
  id: string;         // app id from DRIVER_CODE_MAP, e.g. "ant"
  code: string;       // three-letter code, e.g. "ANT"
  number: number;     // permanent number as reported by Jolpica (0 when absent)
  name: string;
  team: string;       // app team name, e.g. "Racing Bulls"
  color: string;
}

export interface ConstructorStanding {
  position: number;
  points: number;
  wins: number;
  constructorId: string;
  name: string;
  color: string;
}

export interface PodiumEntry {
  code: string;
  id: string;
  name: string;
  team: string;
  gap: string; // "+0.000" for the winner, "+2.974" or a status such as "+1 Lap"
}

export interface RoundResult {
  round: number;
  raceName: string;
  date: string;
  circuitId: string;
  circuitName: string;
  winner?: string;
  winnerTime?: string;
  podium: PodiumEntry[];
  fastestLap?: { code: string; id: string; time: string };
}
