import { Thermometer, Droplets, Wind, CloudRain } from 'lucide-react';
import type { WeatherData } from '../types';

interface Props {
  weather: WeatherData | null;
  compact?: boolean;
}

export default function WeatherBar({ weather, compact }: Props) {
  if (!weather) {
    return (
      <div className={`label-mono text-ink-3 ${compact ? '' : 'border border-ink-3 px-3 py-2'}`}>
        WEATHER DATA UNAVAILABLE
      </div>
    );
  }
  return (
    <div className={`flex flex-wrap items-center gap-4 font-mono text-xs ${compact ? '' : 'border border-ink-3 bg-paper-2 px-4 py-2'}`} aria-label="Track weather">
      <span className="flex items-center gap-1.5"><Thermometer size={12} aria-hidden="true" /> AIR <strong>{Math.round(weather.air_temperature)}°C</strong></span>
      <span className="flex items-center gap-1.5"><Thermometer size={12} className="text-racing" aria-hidden="true" /> TRACK <strong>{Math.round(weather.track_temperature)}°C</strong></span>
      <span className="flex items-center gap-1.5"><Droplets size={12} aria-hidden="true" /> HUMIDITY <strong>{Math.round(weather.humidity)}%</strong></span>
      <span className="flex items-center gap-1.5"><Wind size={12} aria-hidden="true" /> WIND <strong>{weather.wind_speed.toFixed(1)} m/s</strong></span>
      {weather.rainfall > 0 && (
        <span className="flex items-center gap-1.5 text-blue-400"><CloudRain size={12} aria-hidden="true" /> RAIN</span>
      )}
    </div>
  );
}
