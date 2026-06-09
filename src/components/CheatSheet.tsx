import { useEffect, useMemo, useState } from "react";
import { glslReference, filterReference } from "@/cheatsheet/glsl-reference";

type Props = {
  open: boolean;
  onClose: () => void;
  onInsert: (snippet: string) => void;
};

export function CheatSheet({ open, onClose, onInsert }: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const groups = useMemo(() => filterReference(glslReference, query), [query]);
  const count = useMemo(
    () => groups.reduce((n, g) => n + g.items.length, 0),
    [groups],
  );

  if (!open) return null;

  return (
    <div
      className="cheat-fade fixed inset-0 z-50 flex items-start justify-center bg-black/75 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="cheat-pop flex max-h-full w-full max-w-[820px] flex-col border border-rule bg-bg shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-rule px-3">
          <span className="h-2.5 w-2.5 shrink-0 bg-accent" aria-hidden />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">GLSL cheatsheet</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-soft sm:inline">
            {count} entries
          </span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter functions, types, uniforms..."
            className="ml-auto w-1/2 max-w-[320px] border border-hair bg-transparent px-2 py-1 font-mono text-[12px] text-ink outline-none transition-colors placeholder:text-soft/70 focus:border-accent"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the cheatsheet"
            title="Close (Esc)"
            className="shrink-0 border border-hair px-2 py-1 font-mono text-[11px] text-soft transition-colors hover:border-ink hover:text-ink"
          >
            &#10005;
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
          {groups.length === 0 && (
            <div className="px-4 py-8 text-center font-mono text-[12px] text-soft">
              No match for &ldquo;{query}&rdquo;.
            </div>
          )}
          {groups.map((g) => (
            <div key={g.category}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-hair bg-panel px-3 py-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{g.category}</span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-soft">{g.items.length}</span>
              </div>
              <ul>
                {g.items.map((it) => (
                  <li key={it.sig}>
                    <button
                      type="button"
                      onClick={() => onInsert(it.snippet)}
                      title="Insert at the cursor"
                      className="group flex w-full items-start gap-3 border-b border-hair px-3 py-2 text-left transition-colors hover:bg-panel"
                    >
                      <span className="flex-1">
                        <span className="block font-mono text-[12px] text-ink">{it.sig}</span>
                        <span className="block font-mono text-[11px] leading-snug text-soft">{it.desc}</span>
                      </span>
                      <span className="mt-0.5 shrink-0 font-mono text-[9.5px] uppercase tracking-[0.14em] text-soft/0 transition-colors group-hover:text-accent">
                        insert
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
