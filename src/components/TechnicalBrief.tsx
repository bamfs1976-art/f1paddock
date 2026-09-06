import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Wind, Zap, ShieldCheck } from 'lucide-react';
import { syncLiveData, getLiveTelemetry } from '../services/f1Service';
import type { TelemetryData } from '../types';

const CARDS = [
  {
    Icon: Wind,
    title: 'Active Aerodynamics',
    kicker: 'Movable Wings · DRS 2.0',
    body: 'Dynamic front and rear wings adjust in real-time to balance drag and downforce across every sector.',
    stats: [
      { label: 'DRAG REDUCTION', value: '−30%' },
      { label: 'RESPONSE TIME', value: '0.12s' },
    ],
  },
  {
    Icon: Zap,
    title: 'MGU-K Hybrid+',
    kicker: '50/50 Power Split',
    body: 'Internal combustion and electrical output share an equal 350kW split. The MGU-H has been retired in favour of high-capacity storage.',
    stats: [
      { label: 'ELECTRICAL BOOST', value: '350kW' },
      { label: 'E-FUEL', value: '100%' },
    ],
  },
  {
    Icon: ShieldCheck,
    title: 'Smart Chassis',
    kicker: 'Lighter · Agile · Sustainable',
    body: 'A 30kg reduction in minimum weight combined with bio-composite safety cells.',
    stats: [
      { label: 'WEIGHT CUT', value: '30kg' },
      { label: 'BIO-CONTENT', value: '45%' },
    ],
  },
];

function CountUp({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
    const animate = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setVal(Math.round(to * p));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span className="font-mono tabular-nums">{prefix}{val}{suffix}</span>;
}

export default function TechnicalBrief() {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [scanned, setScanned] = useState(false);

  const startScan = async () => {
    if (scanning) return;
    setScanning(true);
    setProgress(0);
    setScanned(false);
    syncLiveData().catch(() => { /* */ });

    const start = Date.now();
    const dur = 2400;
    const tick = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / dur) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(tick);
        getLiveTelemetry().then((data) => {
          setTelemetry(data);
          setScanning(false);
          setScanned(true);
        });
      }
    }, 50);
  };

  return (
    <section id="technical" className="px-6 sm:px-10 py-10 scroll-mt-14" aria-labelledby="tech-heading">
      <span className="section-label">S 08 // TECHNICAL BRIEF</span>
      <h2 id="tech-heading" className="font-serif text-3xl mt-3 mb-2">2026 Regulations</h2>
      <p className="font-serif text-4xl sm:text-5xl mb-6">The Sustainable Speed Revolution</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 border-y-2 border-ink py-6">
        <div>
          <div className="label-mono">DOWNFORCE</div>
          <div className="font-serif text-3xl text-racing"><CountUp to={40} prefix="−" suffix="%" /></div>
        </div>
        <div>
          <div className="label-mono">HEAT ENERGY</div>
          <div className="font-serif text-3xl text-racing"><CountUp to={15} prefix="+" suffix="%" /></div>
        </div>
        <div>
          <div className="label-mono">WEIGHT CUT</div>
          <div className="font-serif text-3xl"><CountUp to={30} suffix="kg" /></div>
        </div>
        <div>
          <div className="label-mono">E-FUELS</div>
          <div className="font-serif text-3xl"><CountUp to={100} suffix="%" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {CARDS.map((c, idx) => (
          <motion.article
            key={c.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="border-2 border-ink bg-paper-2 p-5 card-lift"
          >
            <c.Icon size={24} className="text-racing mb-3" aria-hidden="true" />
            <div className="label-mono">{c.kicker.toUpperCase()}</div>
            <h3 className="font-serif text-xl mt-1 mb-2">{c.title}</h3>
            <p className="text-sm text-ink-2 leading-relaxed mb-4">{c.body}</p>
            <div className="grid grid-cols-2 gap-2">
              {c.stats.map((s) => (
                <div key={s.label} className="border border-rule px-2 py-1.5">
                  <div className="label-mono">{s.label}</div>
                  <div className="font-mono text-sm font-bold">{s.value}</div>
                </div>
              ))}
            </div>
          </motion.article>
        ))}
      </div>

      <div className="border-2 border-ink bg-paper-2 p-5 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(245,245,240,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,245,240,0.4) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
          aria-hidden="true"
        />
        {scanning && (
          <div className="absolute left-0 right-0 h-[2px] bg-gain scan-line" aria-hidden="true" />
        )}
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="label-mono mb-1">{scanned ? 'TELEMETRY LINK ESTABLISHED' : scanning ? 'SCANNING…' : 'ENCRYPTED'}</div>
            <h3 className="font-serif text-xl">Live System Scan</h3>
          </div>
          <button
            onClick={startScan}
            disabled={scanning}
            className="bg-racing-fill text-white px-4 py-2 font-mono text-xs btn-press disabled:opacity-60"
          >
            {scanning ? 'SCANNING…' : 'SCAN SYSTEM'}
          </button>
        </div>
        <div className="relative h-2 bg-paper-3 mt-4">
          <div className="h-full bg-gain transition-all" style={{ width: `${progress}%` }} />
        </div>
        {scanned && telemetry && (
          <div className="relative grid grid-cols-3 gap-3 mt-4 font-mono text-sm">
            <div><div className="label-mono">SPEED</div><div className="text-2xl">{telemetry.speed} <span className="text-xs text-ink-3">KM/H</span></div></div>
            <div><div className="label-mono">GEAR</div><div className="text-2xl">{telemetry.gear}</div></div>
            <div><div className="label-mono">RPM</div><div className="text-2xl">{telemetry.rpm}</div></div>
          </div>
        )}
      </div>
    </section>
  );
}
