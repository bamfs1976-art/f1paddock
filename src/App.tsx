import { useEffect, useState } from 'react';
import Hero from './components/Hero';
import ThemeToggle from './components/ThemeToggle';
import MobileNav, { type Tab } from './components/MobileNav';
import StatsRibbon from './components/StatsRibbon';
import Ticker from './components/Ticker';
import DriversStandings from './components/DriversStandings';
import ConstructorsStandings from './components/ConstructorsStandings';
import SeasonCalendar from './components/SeasonCalendar';
import RaceWeekendHub from './components/RaceWeekendHub';
import PaddockIntel from './components/PaddockIntel';
import AIChat from './components/AIChat';
import TechnicalBrief from './components/TechnicalBrief';
import TelemetryDisplay from './components/TelemetryDisplay';
import WeatherBar from './components/WeatherBar';
import RaceControlFeed from './components/RaceControlFeed';
import SpeedTraceChart from './components/SpeedTraceChart';
import LiveSyncIndicator from './components/LiveSyncIndicator';
import Footer from './components/Footer';
import { syncLiveData, getCachedSync } from './services/f1Service';
import type { LiveSyncState } from './types';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [tab, setTab] = useState<Tab>('calendar');
  const [chatOpen, setChatOpen] = useState(false);
  const [liveSync, setLiveSync] = useState<LiveSyncState | null>(null);

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem('f1_paddock_theme') as 'dark' | 'light' | null;
    if (stored) setTheme(stored);
    const cached = getCachedSync();
    if (cached) setLiveSync(cached);

    let cancelled = false;
    const tick = async () => {
      if (document.hidden) return; // skip when tab not visible
      const state = await syncLiveData();
      if (!cancelled && state) setLiveSync(state);
    };
    tick();
    const interval = setInterval(tick, 30000);
    const onVis = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVis);
    const handler = () => {
      const c = getCachedSync();
      if (c) setLiveSync(c);
    };
    window.addEventListener('f1_live_sync_completed', handler);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('f1_live_sync_completed', handler);
    };
  }, []);

  const liveActive = !!liveSync && Date.now() - liveSync.timestamp < 5 * 60 * 1000;

  // Mobile: show one tab at a time. Desktop: show all sections.
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handle = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <ThemeToggle theme={theme} onToggle={setTheme} />
      <Ticker />
      <Hero weather={liveSync?.weather ?? null} liveStatus={liveActive ? 'LIVE LINK' : null} />
      <StatsRibbon />

      {/* Desktop: full scroll layout. Mobile: tab routing. */}
      <main>
        {(!isMobile || tab === 'calendar')   && <SeasonCalendar />}
        {(!isMobile || tab === 'standings')  && <DriversStandings liveSync={liveSync} />}
        {(!isMobile || tab === 'standings')  && <ConstructorsStandings />}
        {(!isMobile || tab === 'live')       && <RaceWeekendHub liveSync={liveSync} />}
        {(!isMobile || tab === 'live')       && <TelemetryDisplay />}
        {(!isMobile || tab === 'live')       && (
          <section className="px-6 sm:px-10 pb-6">
            <span className="section-label">S 06 // SPEED TRACE</span>
            <h2 className="font-serif text-2xl mt-2 mb-3">Lap Time Comparison</h2>
            <SpeedTraceChart />
          </section>
        )}
        {(!isMobile || tab === 'live')       && (
          <section className="px-6 sm:px-10 pb-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="label-mono mb-2">RACE CONTROL</div>
                <RaceControlFeed messages={liveSync?.raceControl || []} maxItems={20} />
              </div>
              <div>
                <div className="label-mono mb-2">WEATHER</div>
                <WeatherBar weather={liveSync?.weather ?? null} />
              </div>
            </div>
          </section>
        )}
        {(!isMobile || tab === 'intel')      && <PaddockIntel />}
        {(!isMobile)                         && <TechnicalBrief />}
      </main>

      <Footer />

      <LiveSyncIndicator state={liveActive ? liveSync : null} />

      <AIChat
        open={chatOpen || (isMobile && tab === 'chat')}
        onOpen={() => setChatOpen(true)}
        onClose={() => { setChatOpen(false); if (isMobile && tab === 'chat') setTab('intel'); }}
        fullScreen={isMobile && tab === 'chat'}
      />

      <MobileNav active={tab} onChange={setTab} liveActive={liveActive} />
    </div>
  );
}
