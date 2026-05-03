export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t-2 border-ink mt-16 px-6 sm:px-10 py-8 bg-paper-2">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl">F1 Paddock Intelligence</h2>
          <p className="label-mono mt-1">DATA: OPENF1 API · AI: ANTHROPIC CLAUDE</p>
        </div>
        <div className="text-right text-ink-3 text-xs label-mono">
          <p>© {year} · NOT AFFILIATED WITH FORMULA 1 OR FIA</p>
          <p className="mt-1">BUILT FOR DEMONSTRATION</p>
        </div>
      </div>
    </footer>
  );
}
