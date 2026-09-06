import { useEffect, useState } from 'react';
import type { WeatherData } from '../types';
import { useSchedule } from '../services/seasonStore';
import { findLiveSession, findUpcomingSession } from '../services/scheduleService';
import { countdownTo } from '../utils/time';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function nowLabel(d: Date) {
  return d
    .toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()
    .replace(/,/g, ' .');
}

interface Props {
  weather?: WeatherData | null;
  liveStatus?: string | null;
}

export default function Hero({ weather, liveStatus }: Props) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const schedule = useSchedule();
  let sessionLabel: string | null = null;
  if (schedule.data) {
    const live = findLiveSession(schedule.data, now.getTime());
    const upcoming = findUpcomingSession(schedule.data, now.getTime());
    if (live) {
      sessionLabel = `LIVE . ${live.round.name.toUpperCase()} . ${live.session.name.toUpperCase()}`;
    } else if (upcoming) {
      const c = countdownTo(upcoming.session.dateStart, now.getTime());
      sessionLabel = `${upcoming.session.name.toUpperCase()} . ${upcoming.round.name.toUpperCase()} . in ${c.days}d ${c.hours}h`;
    }
  }
  return (
    <section className="diagonal-bg border-b-2 border-ink py-10 px-6 sm:px-10 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="speed-line absolute h-[1px] w-screen bg-racing"
            style={{ top: `${20 + i * 18}%`, animationDelay: `${i * 0.7}s` }}
          />
        ))}
      </div>
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="label-mono">{nowLabel(now)}</span>
          {liveStatus && (
            <span className="label-mono text-ink flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-racing rounded-full pulse-dot" />
              {liveStatus}
            </span>
          )}
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-tight">
          {greeting()},<br />
          <span className="text-ink-2">welcome to the paddock.</span>
        </h1>
        {sessionLabel && (
          <p className="label-mono text-ink">{sessionLabel}</p>
        )}
        {weather && (
          <p className="label-mono text-ink-2">
            TRACK: {Math.round(weather.track_temperature)}°C  ·  AIR: {Math.round(weather.air_temperature)}°C  ·  HUMIDITY: {Math.round(weather.humidity)}%
          </p>
        )}
      </div>
    </section>
  );
}
