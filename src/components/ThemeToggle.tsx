import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { savePreferences, getPreferences } from '../services/supabaseService';

interface Props {
  theme: 'dark' | 'light';
  onToggle: (next: 'dark' | 'light') => void;
}

export default function ThemeToggle({ theme, onToggle }: Props) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    setHydrated(true);
    (async () => {
      try {
        const prefs = await getPreferences();
        if (prefs?.theme && prefs.theme !== theme) {
          onToggle(prefs.theme);
        }
      } catch {
        const stored = localStorage.getItem('f1_paddock_theme') as 'dark' | 'light' | null;
        if (stored && stored !== theme) onToggle(stored);
      }
    })();
  }, [hydrated, theme, onToggle]);

  const handle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    onToggle(next);
    localStorage.setItem('f1_paddock_theme', next);
    savePreferences({ theme: next }).catch(() => { /* offline fallback */ });
  };

  return (
    <button
      onClick={handle}
      className="fixed top-4 right-4 z-50 bg-paper-2 border border-ink-3 p-2 btn-press hover:border-ink"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </button>
  );
}
