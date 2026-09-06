import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star } from 'lucide-react';
import PositionChangeIndicator from './ui/PositionChangeIndicator';
import SkeletonLoader from './ui/SkeletonLoader';
import DataNotice from './ui/DataNotice';
import { getPreferences, savePreferences } from '../services/supabaseService';
import { useDrivers } from '../services/seasonStore';

export default function ConstructorsStandings() {
  const [favs, setFavs] = useState<string[]>([]);
  const { teams, status, fetchedAt, snapshot, retry } = useDrivers();
  const loading = status === 'loading';

  useEffect(() => {
    (async () => {
      try {
        const prefs = await getPreferences();
        if (prefs?.favourite_teams) setFavs(prefs.favourite_teams);
      } catch {
        const stored = localStorage.getItem('f1_fav_teams');
        if (stored) setFavs(JSON.parse(stored));
      }
    })();
  }, []);

  const toggleFav = (id: string) => {
    const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    setFavs(next);
    localStorage.setItem('f1_fav_teams', JSON.stringify(next));
    savePreferences({ favourite_teams: next }).catch(() => { /* offline */ });
  };

  return (
    <section id="constructors" className="px-6 sm:px-10 py-10 scroll-mt-14" aria-labelledby="teams-heading">
      <span className="section-label">S 03 // CONSTRUCTORS' CHAMPIONSHIP</span>
      <h2 id="teams-heading" className="font-serif text-3xl mt-3 mb-6">Constructors' Standings</h2>

      <DataNotice
        status={status}
        fetchedAt={fetchedAt}
        snapshot={snapshot}
        unavailableMessage="Constructor standings unavailable. Retrying in a minute."
        onRetry={retry}
        className="mb-3"
      />

      <div className="border-2 border-ink bg-paper-2" role="group" aria-label="Constructors' standings" aria-busy={loading}>
        <div className="grid grid-cols-[40px_30px_4px_1fr_70px_60px_70px] sm:grid-cols-[50px_40px_4px_1fr_120px_80px_80px] gap-2 px-3 py-2 border-b border-rule label-mono">
          <div>POS</div><div><span aria-hidden="true">Δ</span><span className="sr-only">Position change</span></div><div></div>
          <div>TEAM</div><div className="hidden sm:block">ENGINE</div>
          <div className="text-center">FAV</div>
          <div className="text-right">PTS</div>
        </div>
        {loading ? (
          <div className="p-3"><SkeletonLoader type="row" count={6} /></div>
        ) : (
          <AnimatePresence initial={false}>
            {teams.map((t, idx) => {
              const isFav = favs.includes(t.id);
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.3, layout: { duration: 0.3, delay: 0 } }}
                  className={`hover-bar grid grid-cols-[40px_30px_4px_1fr_70px_60px_70px] sm:grid-cols-[50px_40px_4px_1fr_120px_80px_80px] gap-2 px-3 py-2.5 items-center text-sm border-b border-rule ${isFav ? 'bg-paper-3/40' : ''}`}
                >
                  <div className="font-mono font-bold tabular-nums">{t.pos}</div>
                  <div><PositionChangeIndicator change={t.posChange ?? 0} /></div>
                  <div className="h-7 w-1" style={{ background: t.color }} aria-hidden="true" />
                  <div className="truncate">
                    <span className="mr-2" aria-hidden="true">{t.country}</span>
                    <span className="font-bold">{t.name}</span>
                    <span className="sm:hidden block text-xs text-ink-3">{t.engine}</span>
                  </div>
                  <div className="hidden sm:block text-ink-2 text-xs truncate">{t.engine}</div>
                  <div className="text-center">
                    <button
                      onClick={() => toggleFav(t.id)}
                      aria-label={isFav ? `Remove ${t.name} from favourites` : `Add ${t.name} to favourites`}
                      className="opacity-60 hover:opacity-100"
                    >
                      <Star size={12} fill={isFav ? '#FFC72C' : 'none'} stroke={isFav ? '#FFC72C' : 'currentColor'} />
                    </button>
                  </div>
                  <div className="text-right font-mono font-bold tabular-nums">{t.pts}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
