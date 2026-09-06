import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, GitCompare, Share2 } from 'lucide-react';
import type { Driver, LiveSyncState } from '../types';
import PositionChangeIndicator from './ui/PositionChangeIndicator';
import SkeletonLoader from './ui/SkeletonLoader';
import DataNotice from './ui/DataNotice';
import DriverProfile from './DriverProfile';
import DriverComparison from './DriverComparison';
import { getPreferences, savePreferences } from '../services/supabaseService';
import { useDrivers } from '../services/seasonStore';

interface Props {
  liveSync?: LiveSyncState | null;
}

export default function DriversStandings({ liveSync }: Props) {
  const [favs, setFavs] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [profile, setProfile] = useState<Driver | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const { drivers, round, status, fetchedAt, snapshot, retry } = useDrivers();

  useEffect(() => {
    (async () => {
      try {
        const prefs = await getPreferences();
        if (prefs?.favourite_drivers) setFavs(prefs.favourite_drivers);
      } catch {
        const stored = localStorage.getItem('f1_fav_drivers');
        if (stored) setFavs(JSON.parse(stored));
      }
    })();
  }, []);

  const toggleFav = (id: string) => {
    const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    setFavs(next);
    localStorage.setItem('f1_fav_drivers', JSON.stringify(next));
    savePreferences({ favourite_drivers: next }).catch(() => { /* offline */ });
  };

  const toggleSelect = (code: string) => {
    if (selected.includes(code)) {
      setSelected(selected.filter((c) => c !== code));
    } else if (selected.length < 2) {
      setSelected([...selected, code]);
    }
  };

  const loading = status === 'loading';

  // Share a plain-text summary: the share sheet where the browser has one,
  // otherwise the clipboard. The text is built from the live standings.
  const [shared, setShared] = useState<'idle' | 'copied' | 'shared' | 'failed'>('idle');
  const share = async () => {
    const top = drivers.slice(0, 3).map((d, i) => `${i + 1}. ${d.name.split(' ').slice(-1)[0]}`).join(' ');
    const text = `F1 2026 after round ${round}: ${top}`;
    const url = 'https://fromthepaddock.netlify.app/#drivers';
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'F1 Paddock Intelligence', text, url });
        setShared('shared');
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShared('copied');
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return; // user closed the sheet
      setShared('failed');
    }
    setTimeout(() => setShared('idle'), 2500);
  };

  return (
    <section id="drivers" className="px-6 sm:px-10 py-10 scroll-mt-14" aria-labelledby="drivers-heading">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <span className="section-label">S 02 // DRIVERS' CHAMPIONSHIP</span>
          <h2 id="drivers-heading" className="font-serif text-3xl mt-3">
            Drivers' Standings
            {liveSync && (
              <span className="ml-3 inline-flex items-center gap-1.5 align-middle label-mono text-ink">
                <span className="inline-block w-2 h-2 bg-racing rounded-full pulse-dot" aria-hidden="true" /> LIVE
              </span>
            )}
          </h2>
          {!loading && round > 0 && (
            <p className="label-mono mt-2">AFTER ROUND {round} · ARROWS VERSUS ROUND {Math.max(1, round - 1)}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={share}
            disabled={loading || snapshot}
            className="bg-paper-2 border border-rule px-3 py-2 font-mono text-xs btn-press flex items-center gap-2 hover:border-ink disabled:opacity-50"
            aria-label="Share the top three as text"
          >
            <Share2 size={14} aria-hidden="true" />
            {shared === 'copied' ? 'COPIED' : shared === 'shared' ? 'SHARED' : shared === 'failed' ? 'COULD NOT SHARE' : 'SHARE'}
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {shared === 'copied' ? 'Summary copied to clipboard' : shared === 'shared' ? 'Summary shared' : shared === 'failed' ? 'Sharing failed' : ''}
          </span>
        {selected.length === 2 && (
          <button
            onClick={() => setShowCompare(true)}
            className="bg-racing-fill text-white px-4 py-2 font-mono text-xs btn-press flex items-center gap-2"
            aria-label="Compare selected drivers"
          >
            <GitCompare size={14} aria-hidden="true" />
            COMPARE ({selected.length})
          </button>
        )}
        </div>
      </div>

      <DataNotice
        status={status}
        fetchedAt={fetchedAt}
        snapshot={snapshot}
        unavailableMessage="Standings unavailable. Retrying in a minute."
        onRetry={retry}
        className="mb-3"
      />

      <div className="border-2 border-ink bg-paper-2" role="table" aria-live="polite" aria-busy={loading}>
        <div className="grid grid-cols-[40px_30px_30px_4px_60px_1fr_60px_70px] sm:grid-cols-[50px_40px_40px_4px_70px_1fr_120px_80px] gap-2 px-3 py-2 border-b border-rule label-mono">
          <div>POS</div>
          <div aria-label="Position change">Δ</div>
          <div aria-label="Select for comparison"></div>
          <div></div>
          <div>CODE</div>
          <div>DRIVER</div>
          <div className="hidden sm:block">TEAM</div>
          <div className="text-right">PTS</div>
        </div>
        {loading ? (
          <div className="p-3"><SkeletonLoader type="row" count={10} /></div>
        ) : (
          <AnimatePresence initial={false}>
            {drivers.map((d, idx) => {
              const isFav = favs.includes(d.id);
              const isSel = selected.includes(d.code);
              return (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.3, layout: { duration: 0.3, delay: 0 } }}
                  className={`hover-bar grid grid-cols-[40px_30px_30px_4px_60px_1fr_60px_70px] sm:grid-cols-[50px_40px_40px_4px_70px_1fr_120px_80px] gap-2 px-3 py-2.5 items-center text-sm border-b border-rule ${isFav ? 'bg-paper-3/40' : ''}`}
                >
                  <div className="font-mono font-bold tabular-nums">{d.pos}</div>
                  <div><PositionChangeIndicator change={d.posChange ?? 0} /></div>
                  <div>
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggleSelect(d.code)}
                      disabled={!isSel && selected.length >= 2}
                      aria-label={`Select ${d.name} for comparison`}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="h-7 w-1" style={{ background: d.color }} aria-hidden="true" />
                  <div className="font-mono font-bold">{d.code}</div>
                  <button
                    onClick={() => setProfile(d)}
                    className="text-left truncate hover:underline decoration-racing decoration-2 underline-offset-4"
                    aria-label={`View profile for ${d.name}`}
                  >
                    {d.name}
                    <span className="sm:hidden block text-xs text-ink-3">{d.team}</span>
                  </button>
                  <div className="hidden sm:block text-ink-2 text-xs truncate">{d.team}</div>
                  <div className="text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleFav(d.id)}
                      aria-label={isFav ? `Remove ${d.name} from favourites` : `Add ${d.name} to favourites`}
                      className="opacity-60 hover:opacity-100"
                    >
                      <Star size={12} fill={isFav ? '#FFC72C' : 'none'} stroke={isFav ? '#FFC72C' : 'currentColor'} />
                    </button>
                    <span className="font-mono font-bold tabular-nums">{d.pts}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {profile && <DriverProfile driver={profile} onClose={() => setProfile(null)} />}
      {showCompare && selected.length === 2 && (
        <DriverComparison
          codeA={selected[0]}
          codeB={selected[1]}
          onClose={() => { setShowCompare(false); setSelected([]); }}
        />
      )}
    </section>
  );
}
