import { useEffect, useState } from 'react';
import { CALENDAR } from '../constants';
import type { WeatherData } from '../types';

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

function nextSession() {
  const next = CALENDAR.find((r) => r.isNext) || CALENDAR.find((r) => !r.isDone);
  if (!next) return null;
  const target = new Date(next.date + 'T15:00:00Z');
  const diff = target.getTime() - Date.now();
  if (diff < 0) return { label: 'RACE LIVE', country: next.country };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return { label: `RACE . ${next.country.toUpperCase()} GP . in ${days}d ${hours}h`, country: next.country };
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
  const session = nextSession();
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
            <span className="label-mono text-racing flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-racing rounded-full pulse-dot" />
              {liveStatus}
            </span>
          )}
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-tight">
          {greeting()},<br />
          <span className="text-ink-2">welcome to the paddock.</span>
        </h1>
        {session && (
          <p className="label-mono text-ink">{session.label}</p>
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
