import { Calendar, Trophy, Activity, Newspaper, MessageSquare } from 'lucide-react';

export type Tab = 'calendar' | 'standings' | 'live' | 'intel' | 'chat';

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
  liveActive?: boolean;
}

const TABS: { id: Tab; label: string; Icon: typeof Calendar }[] = [
  { id: 'calendar',  label: 'Calendar',  Icon: Calendar },
  { id: 'standings', label: 'Standings', Icon: Trophy },
  { id: 'live',      label: 'Live',      Icon: Activity },
  { id: 'intel',     label: 'Intel',     Icon: Newspaper },
  { id: 'chat',      label: 'Chat',      Icon: MessageSquare },
];

export default function MobileNav({ active, onChange, liveActive }: Props) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper-2 border-t-2 border-ink grid grid-cols-5"
      aria-label="Primary navigation"
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`relative py-2 flex flex-col items-center gap-1 ${isActive ? 'text-ink' : 'text-ink-2'}`}
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
          >
            <Icon size={18} className={isActive ? 'text-racing' : undefined} aria-hidden="true" />
            <span className="label-mono">{label.toUpperCase()}</span>
            {id === 'live' && liveActive && (
              <span className="absolute top-1 right-4 w-2 h-2 bg-racing rounded-full pulse-dot" aria-hidden="true" />
            )}
            {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-racing" aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}
