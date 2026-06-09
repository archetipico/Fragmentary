export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-rule bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 lg:px-6 py-2.5">
        <a
          href="https://archetipico.github.io"
          className="flex items-center gap-1.5 border border-hair px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-soft transition-colors hover:border-ink hover:text-ink"
          title="Back to archetipico.github.io"
        >
          <span aria-hidden>&#8592;</span>
          archetipico
        </a>

        <a href="#top" className="flex items-baseline gap-2.5">
          <span className="block h-3 w-3 translate-y-px bg-accent" aria-hidden />
          <span className="display text-[17px] text-ink">fragmentary</span>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.16em] text-soft">
            shader workshop
          </span>
        </a>

        <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.14em] text-soft md:inline">
          Run only shaders you trust
        </span>
      </div>
    </header>
  );
}
