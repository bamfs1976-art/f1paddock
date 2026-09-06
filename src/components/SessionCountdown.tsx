import { useSchedule } from '../services/seasonStore';
import { findLiveSession, findUpcomingSession } from '../services/scheduleService';
import { countdownTo, fmtDayTime } from '../utils/time';
import { useNow } from '../hooks/useNow';

export default function SessionCountdown() {
  const now = useNow(1000);
  const schedule = useSchedule();
  const rounds = schedule.data;

  if (!rounds) {
    return (
      <div className="border border-rule bg-paper-2 p-4 label-mono text-ink-3" aria-busy={schedule.status === 'loading'}>
        {schedule.status === 'loading' ? 'LOADING SCHEDULE…' : 'SCHEDULE UNAVAILABLE'}
      </div>
    );
  }

  const live = findLiveSession(rounds, now);
  if (live) {
    return (
      <div className="border border-racing bg-paper-2 p-4 flex items-center gap-3" aria-live="polite">
        <span className="w-3 h-3 bg-racing rounded-full pulse-dot" aria-hidden="true" />
        <span className="font-mono text-sm">LIVE · {live.round.name.toUpperCase()} · {live.session.name.toUpperCase()}</span>
      </div>
    );
  }

  const upcoming = findUpcomingSession(rounds, now);
  if (!upcoming) {
    return <div className="border border-rule bg-paper-2 p-4 label-mono text-ink-3">SEASON COMPLETE</div>;
  }

  const c = countdownTo(upcoming.session.dateStart, now);

  return (
    <div className="border border-rule bg-paper-2 p-4">
      <div className="label-mono mb-2">NEXT SESSION · {upcoming.session.name.toUpperCase()} · {fmtDayTime(upcoming.session.dateStart).toUpperCase()}</div>
      <div className="flex gap-4 font-mono text-2xl tabular-nums" aria-label={`${c.days} days ${c.hours} hours ${c.minutes} minutes`}>
        <span><span className="font-bold">{c.days}</span><span className="text-ink-3 text-xs ml-1">d</span></span>
        <span><span className="font-bold">{String(c.hours).padStart(2, '0')}</span><span className="text-ink-3 text-xs ml-1">h</span></span>
        <span><span className="font-bold">{String(c.minutes).padStart(2, '0')}</span><span className="text-ink-3 text-xs ml-1">m</span></span>
        <span><span className="font-bold">{String(c.seconds).padStart(2, '0')}</span><span className="text-ink-3 text-xs ml-1">s</span></span>
      </div>
    </div>
  );
}
