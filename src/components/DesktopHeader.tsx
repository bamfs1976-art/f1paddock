import { useEffect, useState } from 'react';
import { DESKTOP_LINKS, SECTION_IDS } from '../navigation';
import ThemeToggle from './ThemeToggle';

interface Props {
  theme: 'dark' | 'light';
  onToggleTheme: (next: 'dark' | 'light') => void;
}

const HEADER_HEIGHT = 56;

export default function DesktopHeader({ theme, onToggleTheme }: Props) {
  const [active, setActive] = useState<string>('calendar');

  // Highlight the link whose section currently owns the most of the viewport
  // below the header. Observed once; sections are static for the page's life.
  useEffect(() => {
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set((e.target as HTMLElement).id, e.isIntersecting ? e.intersectionRatio : 0);
        let best = '';
        let bestRatio = 0;
        for (const id of SECTION_IDS) {
          const r = visible.get(id) ?? 0;
          if (r > bestRatio) { best = id; bestRatio = r; }
        }
        if (best) setActive(best);
      },
      { rootMargin: `-${HEADER_HEIGHT}px 0px -40% 0px`, threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const scrollTo = (anchor: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(anchor);
    if (!el) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
    window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', `#${anchor}`);
  };

  return (
    <header
      className="hidden md:flex sticky top-0 z-40 bg-paper-2 border-b-2 border-ink items-center justify-between px-6 sm:px-10"
      style={{ height: HEADER_HEIGHT }}
    >
      <a href="#top" onClick={scrollTo('top')} className="font-serif text-lg leading-none whitespace-nowrap" aria-label="F1 Paddock Intelligence, back to top">
        F1 Paddock <span className="text-ink-2">Intelligence</span>
      </a>
      <nav aria-label="Sections" className="flex items-center gap-1 h-full">
        {DESKTOP_LINKS.map((item) => {
          const isActive = item.sections.includes(active);
          return (
            <a
              key={item.id}
              href={`#${item.anchor}`}
              onClick={scrollTo(item.anchor)}
              aria-current={isActive ? 'location' : undefined}
              className={`relative flex items-center gap-2 h-full px-3 label-mono transition-colors ${isActive ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}
            >
              <item.Icon size={14} className={isActive ? 'text-racing' : undefined} aria-hidden="true" />
              {item.label.toUpperCase()}
              {isActive && <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-racing" aria-hidden="true" />}
            </a>
          );
        })}
        <div className="ml-3 pl-3 border-l border-rule h-8 flex items-center">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="inline" />
        </div>
      </nav>
    </header>
  );
}
