import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { Driver } from '../types';

interface Props {
  driver: Driver;
  onClose: () => void;
}

export default function DriverProfile({ driver, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handle);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="driver-name"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-paper border-2 border-ink max-w-2xl w-full max-h-[90vh] overflow-auto"
        >
          <div className="h-2" style={{ background: driver.color }} aria-hidden="true" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="label-mono">P{driver.pos} · {driver.code} · #{driver.number}</div>
                <h2 id="driver-name" className="font-serif text-3xl mt-1">{driver.name}</h2>
                <p className="text-ink-2 text-sm mt-1">
                  <span className="mr-2" aria-hidden="true">{driver.country}</span>
                  {driver.team}
                </p>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                className="p-2 border border-ink-3 btn-press"
                aria-label="Close profile"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {driver.careerStats && [
                { label: 'WINS', value: driver.careerStats.wins },
                { label: 'PODIUMS', value: driver.careerStats.podiums },
                { label: 'TITLES', value: driver.careerStats.titles },
                { label: 'RACES', value: driver.careerStats.races },
              ].map((s) => (
                <div key={s.label} className="border border-ink-3 bg-paper-2 p-3 text-center">
                  <div className="font-serif text-2xl font-bold">{s.value}</div>
                  <div className="label-mono mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {driver.bio && (
              <div className="border-l-2 border-racing pl-4 py-2 mb-4">
                <div className="label-mono mb-2">SEASON DOSSIER</div>
                <p className="text-sm leading-relaxed">{driver.bio}</p>
              </div>
            )}

            <div className="border border-dashed border-ink-3 p-3 label-mono text-ink-3">
              SEASON POINTS · {driver.pts}  ·  GAP · {driver.gap}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
