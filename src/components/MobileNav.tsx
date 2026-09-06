import { TABS, type Tab } from '../navigation';

export type { Tab };

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
  liveActive?: boolean;
}

export default function MobileNav({ active, onChange, liveActive }: Props) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper-2 border-t-2 border-ink grid grid-cols-5"
      aria-label="Primary navigation"
    >
      {TABS.map(({ id, label, Icon }) => {
        const tab = id as Tab;
        const isActive = active === tab;
        return (
          <button
            key={id}
            onClick={() => onChange(tab)}
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
