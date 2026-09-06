import type { WeatherData } from '../types';
import { useSchedule, useDrivers } from '../services/seasonStore';
import { findLiveSession, findUpcomingSession } from '../services/scheduleService';
import { countdownTo, fmtDayTime, fmtLongDate } from '../utils/time';
import { useNow } from '../hooks/useNow';
import SkeletonLoader from './ui/SkeletonLoader';

interface Props {
  weather?: WeatherData | null;
}

// The hero is a status bar: the next Grand Prix as the headline, the next
// session with a live countdown, the championship leader and whether a
// session is live right now. Every time is the visitor's local time with the
// zone abbreviation from Intl; nothing here assumes BST.
export default function Hero({ weather }: Props) {
  const now = useNow(1000);
  const schedule = useSchedule();
  const { drivers, status: standingsStatus } = useDrivers();

  const rounds = schedule.data;
  const live = rounds ? findLiveSession(rounds, now) : null;
  const upcoming = rounds ? findUpcomingSession(rounds, now) : null;
  const headlineRound = live?.round ?? upcoming?.round ?? null;
  const countdown = upcoming ? countdownTo(upcoming.session.dateStart, now) : null;

  const leader = drivers[0];
  const second = drivers[1];
  const leaderGap = leader && second ? leader.pts - second.pts : null;

  return (
    <section className="diagonal-bg border-b-2 border-ink py-10 px-6 sm:px-10 relative overflow-hidden" aria-label="Season status">
      <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="speed-line absolute h-[1px] w-screen bg-racing"
            style={{ top: `${20 + i * 18}%`, animationDelay: `${i * 0.7}s` }}
          />
        ))}
      </div>
      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="label-mono">{fmtLongDate(new Date(now))}</span>
          {headlineRound && (
            <span className="label-mono">ROUND {headlineRound.round} OF {rounds?.length ?? 22}{headlineRound.isSprint ? ' · SPRINT WEEKEND' : ''}</span>
          )}
        </div>

        {schedule.status === 'loading' && !rounds ? (
          <div className="max-w-xl" aria-busy="true"><SkeletonLoader type="bar" height="56px" /></div>
        ) : headlineRound ? (
          <div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-tight">{headlineRound.name}</h1>
            <p className="font-mono text-sm sm:text-base text-ink-2 mt-2">
              {live
                ? `${live.session.name}, in progress until ${fmtDayTime(live.session.dateEnd)}`
                : upcoming
                  ? `${upcoming.session.name}, ${fmtDayTime(upcoming.session.dateStart)}`
                  : 'No further sessions scheduled'}
            </p>
          </div>
        ) : (
          <div>
            <h1 className="font-serif text-4xl sm:text-6xl leading-tight">{rounds ? 'Season complete' : 'Schedule unavailable'}</h1>
            <p className="font-mono text-sm text-ink-2 mt-2">
              {rounds ? 'Every round of the season has finished.' : 'The race schedule could not be loaded. Retrying in a minute.'}
            </p>
          </div>
        )}

        <dl className="grid sm:grid-cols-3 gap-px bg-rule border border-rule max-w-3xl">
          <div className="bg-paper-2 px-4 py-3">
            <dt className="label-mono">Leader</dt>
            <dd className="font-mono mt-1">
              {standingsStatus === 'loading' ? (
                <SkeletonLoader type="bar" height="20px" width="140px" />
              ) : leader ? (
                <>
                  <span className="font-bold">{leader.name}</span>
                  <span className="block text-ink-2 text-sm tabular-nums">
                    {leader.pts} pts{leaderGap !== null ? ` · +${leaderGap} on ${second?.code ?? 'P2'}` : ''}
                  </span>
                </>
              ) : (
                <span className="text-ink-2">Standings unavailable</span>
              )}
            </dd>
          </div>

          <div className="bg-paper-2 px-4 py-3">
            <dt className="label-mono">Next session</dt>
            <dd className="font-mono mt-1">
              {!rounds ? (
                <span className="text-ink-2">{schedule.status === 'loading' ? 'Loading…' : 'Unavailable'}</span>
              ) : upcoming && countdown ? (
                <>
                  <span className="font-bold tabular-nums" aria-label={`${countdown.days} days ${countdown.hours} hours ${countdown.minutes} minutes`}>
                    {countdown.days}d {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m
                  </span>
                  <span className="block text-ink-2 text-sm">{upcoming.session.name} · {upcoming.round.name}</span>
                </>
              ) : (
                <span className="text-ink-2">Season complete</span>
              )}
            </dd>
          </div>

          <div className="bg-paper-2 px-4 py-3">
            <dt className="label-mono">Live status</dt>
            <dd className="font-mono mt-1" aria-live="polite">
              {live ? (
                <span className="flex items-center gap-2 font-bold">
                  <span className="inline-block w-2.5 h-2.5 bg-racing rounded-full pulse-dot" aria-hidden="true" />
                  <span className="text-racing text-lg leading-none">LIVE</span>
                  <span className="text-ink text-sm">{live.session.name}</span>
                </span>
              ) : upcoming ? (
                <span className="text-ink-2 text-sm">Next live: {fmtDayTime(upcoming.session.dateStart)}</span>
              ) : (
                <span className="text-ink-2 text-sm">{rounds ? 'No sessions scheduled' : 'Unavailable'}</span>
              )}
            </dd>
          </div>
        </dl>

        {weather && (
          <p className="label-mono text-ink-2">
            TRACK: {Math.round(weather.track_temperature)}°C  ·  AIR: {Math.round(weather.air_temperature)}°C  ·  HUMIDITY: {Math.round(weather.humidity)}%
          </p>
        )}
      </div>
    </section>
  );
}
