export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t-2 border-ink mt-16 px-6 sm:px-10 py-8 bg-paper-2">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl">F1 Paddock Intelligence</h2>
          <p className="label-mono mt-1">DATA: JOLPICA · OPENF1 · AI: ANTHROPIC CLAUDE</p>
          <p className="label-mono mt-1">
            PREDICTIONS: <a href="https://github.com/deepan-alve/F1-model" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-ink-2 hover:text-ink">F1-MODEL BY DEEPAN ALVE</a> (GPL-3.0)
          </p>
        </div>
        <div className="text-right text-ink-3 text-xs label-mono">
          <p>© {year} · NOT AFFILIATED WITH FORMULA 1 OR FIA</p>
          <p className="mt-1">BUILT FOR DEMONSTRATION</p>
        </div>
      </div>
    </footer>
  );
}
