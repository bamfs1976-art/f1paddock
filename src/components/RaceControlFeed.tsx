import { Flag } from 'lucide-react';
import type { RaceControlMessage } from '../types';

interface Props {
  messages: RaceControlMessage[];
  maxItems?: number;
}

const COLORS: Record<string, string> = {
  Flag: '#FFC72C',
  SafetyCar: '#FF8000',
  DRS: '#3671C6',
  Penalty: '#EF0107',
  Other: '#888888',
};

function fmtTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', { hour12: false });
  } catch {
    return '--:--:--';
  }
}

export default function RaceControlFeed({ messages, maxItems = 50 }: Props) {
  const items = messages.slice(0, maxItems);
  if (!items.length) {
    return (
      <div className="border border-dashed border-ink-3 p-6 text-center text-ink-3 flex flex-col items-center gap-2">
        <Flag size={20} aria-hidden="true" />
        <p className="label-mono">NO RACE CONTROL MESSAGES</p>
      </div>
    );
  }
  return (
    <div className="border border-ink-3 bg-paper-2 max-h-[400px] overflow-y-auto" aria-live="polite" aria-label="Race control messages">
      <ul className="divide-y divide-ink-3/40">
        {items.map((m, i) => (
          <li key={i} className="px-3 py-2 flex items-start gap-3 text-sm">
            <span className="font-mono text-[10px] text-ink-3 tabular-nums w-16 mt-0.5">{fmtTime(m.timestamp)}</span>
            <span
              className="font-mono text-[9px] uppercase px-1.5 py-0.5 text-black mt-0.5"
              style={{ background: COLORS[m.category] || COLORS.Other }}
            >
              {m.category}
            </span>
            <span className="flex-1 text-ink-2 leading-snug">{m.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
