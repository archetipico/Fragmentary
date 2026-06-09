const HAZARD = {
  backgroundImage:
    "repeating-linear-gradient(45deg, hsl(var(--accent) / 0.18) 0 18px, hsl(var(--accent) / 0.05) 18px 36px)",
};

export function Gate({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto scroll-thin bg-bg text-ink">
      <div className="mx-auto flex min-h-full w-full max-w-[1080px] flex-col justify-center px-3 py-7 sm:px-6 sm:py-12">
        <div className="gate-rise border-2 border-rule bg-panel sm:border-[3px]">
          <div className="h-3 w-full" style={HAZARD} aria-hidden />

          <div className="flex items-center justify-between gap-3 border-b border-hair px-4 py-2.5 sm:px-6">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-soft">
              <span className="block h-2.5 w-2.5 bg-accent" aria-hidden />
              Fragmentary
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-soft">
              System notice
            </span>
          </div>

          <div className="px-4 py-6 sm:px-8 sm:py-9">
            <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h1 className="display text-accent" style={{ fontSize: "clamp(32px, 6.4vw, 70px)" }}>
                  Read before
                  <br />
                  you enter
                </h1>
                <p className="mt-4 max-w-[52ch] font-mono text-[12.5px] leading-[1.6] text-soft">
                  Fragmentary compiles and runs GLSL shaders live on your GPU. The picture can
                  flash, strobe, and move, and what you run is on you.
                </p>
              </div>

              <div className="flex flex-col gap-5 lg:col-span-7 lg:border-l lg:border-hair lg:pl-8">
                <section className="border-l-2 border-accent pl-4">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
                    Photosensitivity and motion
                  </h2>
                  <p className="mt-2 font-mono text-[12px] leading-[1.6] text-soft">
                    Flashing light and shifting geometric patterns can trigger seizures, even in
                    people who have never had one, and can bring on nausea, dizziness, or headache.
                    If that risk is yours, do not start the animation. If you start to feel unwell,
                    stop, and see a doctor if it does not pass.
                  </p>
                </section>

                <section className="border-l-2 border-hair pl-4">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
                    Compatibility
                  </h2>
                  <p className="mt-2 font-mono text-[12px] leading-[1.6] text-soft">
                    Shaders compile on your own hardware through WebGL2. They may run slowly, render
                    wrong, or fail to start on some browsers, on older machines, and on phones and
                    tablets.
                  </p>
                </section>

                <section className="border-l-2 border-hair pl-4">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
                    Hardware load
                  </h2>
                  <p className="mt-2 font-mono text-[12px] leading-[1.6] text-soft">
                    Shaders push the GPU as hard as the frame rate allows, so fans spin up and
                    batteries drain fast, and a machine already near its limit can stutter, freeze,
                    or crash. Watch the machine and close the tab if it runs hot.
                  </p>
                </section>

                <section className="border-l-2 border-hair pl-4">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
                    Run only what you trust
                  </h2>
                  <p className="mt-2 font-mono text-[12px] leading-[1.6] text-soft">
                    A shader is code running on your GPU. A hostile one can lock your graphics until you reload the page.
                    Only run shaders you wrote or trust.
                  </p>
                </section>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-5 border-t border-hair pt-6 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-[52ch] font-mono text-[12px] leading-[1.55] text-ink">
                The following blue button confirms you read English, that flashing and moving imagery is not a risk
                for you, and that you use the site as is and at your own risk, taking on anything
                that follows, including heat, wear, or damage to your hardware, and releasing the
                author from any liability.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                <button
                  type="button"
                  onClick={onEnter}
                  className="bg-accent px-5 py-3.5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg transition-opacity hover:opacity-90"
                  style={{ touchAction: "manipulation" }}
                >
                  I understand and accept all risks &#8629;
                </button>
                <a
                  href="https://archetipico.github.io"
                  className="flex items-center justify-center border border-hair px-5 py-3.5 font-mono text-[12px] uppercase tracking-[0.16em] text-soft transition-colors hover:border-ink hover:text-ink"
                >
                  Leave
                </a>
              </div>
            </div>
          </div>

          <div className="h-3 w-full" style={HAZARD} aria-hidden />
        </div>

        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-soft">
          Shown on every visit
        </p>
      </div>
    </div>
  );
}
