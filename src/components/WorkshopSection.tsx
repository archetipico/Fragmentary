import { useMemo, useRef, useState } from "react";
import { CodeEditor, type CodeEditorHandle } from "./CodeEditor";
import { ShaderCanvas } from "./ShaderCanvas";
import { CheatSheet } from "./CheatSheet";
import { defaultShader } from "@/shaders/default";
import { cn } from "@/lib/cn";

const SHADER_STAGE = "fragment";

export function WorkshopSection() {
  const shader = defaultShader;
  const [source, setSource] = useState(shader.code);
  const [activeSource, setActiveSource] = useState(shader.code);
  const [errors, setErrors] = useState<{ line: number; message: string }[]>([]);
  const [running, setRunning] = useState(true);
  const [fps, setFps] = useState(0);
  const [showCode, setShowCode] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [cheatsOpen, setCheatsOpen] = useState(false);
  const editorRef = useRef<CodeEditorHandle>(null);

  const errorLines = useMemo(
    () => new Set(errors.map((e) => e.line).filter((n) => n > 0)),
    [errors],
  );

  const compile = () => setActiveSource(source);
  const reset = () => {
    setSource(shader.code);
    setActiveSource(shader.code);
    setResetNonce((n) => n + 1);
  };

  return (
    <section id="top" className="flex h-full min-h-0 flex-col">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1320px] flex-col px-4 lg:px-6 pt-6 pb-6">
        <div id="workshop" className="flex min-h-0 flex-1 scroll-mt-14 flex-col border border-rule">
          <div className="flex min-h-0 flex-1 flex-col">
            <Toolbar
              running={running}
              setRunning={setRunning}
              compile={compile}
              reset={reset}
              openCheats={() => setCheatsOpen(true)}
              fps={fps}
              errors={errors.length}
              showCode={showCode}
              setShowCode={setShowCode}
            />
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              {showCode && (
                <div className="relative min-h-[300px] border-b border-rule lg:min-h-0 lg:w-1/2 lg:border-b-0 lg:border-r">
                  <CodeEditor
                    ref={editorRef}
                    value={source}
                    onChange={setSource}
                    errorLines={errorLines}
                    className="absolute inset-0"
                  />
                </div>
              )}
              <div className="relative min-h-[300px] flex-1 bg-black lg:min-h-0">
                <ShaderCanvas
                  source={activeSource}
                  active={running}
                  resetSignal={resetNonce}
                  fps={running ? 30 : 0}
                  timeScale={0.4}
                  dpr={Math.min(window.devicePixelRatio || 1, 2)}
                  onError={setErrors}
                  onFps={setFps}
                />
              </div>
            </div>
          </div>
          <ErrorRail errors={errors} />
        </div>
      </div>

      <CheatSheet
        open={cheatsOpen}
        onClose={() => setCheatsOpen(false)}
        onInsert={(snippet) => editorRef.current?.insertAtCursor(snippet)}
      />
    </section>
  );
}

function Toolbar({
  running,
  setRunning,
  compile,
  reset,
  openCheats,
  fps,
  errors,
  showCode,
  setShowCode,
}: {
  running: boolean;
  setRunning: (v: boolean) => void;
  compile: () => void;
  reset: () => void;
  openCheats: () => void;
  fps: number;
  errors: number;
  showCode: boolean;
  setShowCode: (v: boolean) => void;
}) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-2 overflow-x-auto border-b border-rule px-2 scroll-thin">
      <span className="shrink-0 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-soft">
        {SHADER_STAGE}.glsl
      </span>
      <button
        type="button"
        onClick={compile}
        title="Apply the edited source to the GPU"
        className="shrink-0 bg-accent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-bg transition-opacity hover:opacity-90"
      >
        Compile &#8629;
      </button>
      <button
        type="button"
        onClick={() => setRunning(!running)}
        aria-pressed={running}
        title="Start or stop the animation"
        className="shrink-0 border border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-bg"
      >
        {running ? "❚❚ Pause" : "▶ Play"}
      </button>
      <button
        type="button"
        onClick={reset}
        className="shrink-0 border border-hair px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-soft transition-colors hover:border-ink hover:text-ink"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={openCheats}
        title="Open the GLSL cheatsheet"
        className="shrink-0 border border-hair px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-soft transition-colors hover:border-accent hover:text-accent"
      >
        Cheats
      </button>
      <div className="ml-auto flex shrink-0 items-center gap-2 pl-1">
        <PaneToggle label="Code" on={showCode} onClick={() => setShowCode(!showCode)} />
        <span className="h-3.5 w-px bg-hair" aria-hidden />
        <Telemetry fps={fps} errors={errors} running={running} />
      </div>
    </div>
  );
}

function PaneToggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      title={`${on ? "Hide" : "Show"} the ${label.toLowerCase()} pane`}
      className={cn(
        "border px-2 py-1 transition-colors",
        on ? "border-ink text-ink" : "border-hair text-soft hover:border-ink hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

function Telemetry({ fps, errors, running }: { fps: number; errors: number; running: boolean }) {
  const clean = errors === 0;

  return (
    <div className="flex items-center font-mono text-[10px] uppercase tracking-[0.12em]">
      <div
        className="flex items-center gap-1.5 pr-2.5"
        title={running ? "Renderer live" : "Renderer paused"}
      >
        <span
          className="block h-1.5 w-1.5 -translate-y-px rounded-full"
          style={{ background: running ? "hsl(var(--accent))" : "hsl(var(--soft))" }}
          aria-hidden
        />
        <span className={running ? "text-soft" : "text-ink"}>{running ? "Live" : "Paused"}</span>
      </div>

      <span className="h-3.5 w-px bg-hair" aria-hidden />

      <div
        className={cn("flex items-center gap-1.5 px-2.5", clean ? "text-soft" : "text-accent")}
        title={clean ? "Last compile clean" : `${errors} compile error${errors > 1 ? "s" : ""}`}
      >
        <span className="block h-2 w-2 -translate-y-px" style={{ background: "currentColor" }} aria-hidden />
        {clean ? "Clean" : `${errors} Err`}
      </div>

      <span className="h-3.5 w-px bg-hair" aria-hidden />

      <div
        className="flex items-center gap-1 pl-2.5"
        title={running ? `${fps.toFixed(0)} frames per second` : "Renderer paused"}
      >
        <span className={cn("tabular-nums tracking-normal", running ? "text-ink" : "text-soft")}>
          {running ? fps.toFixed(0) : "--"}
        </span>
        <span className="text-soft">fps</span>
      </div>
    </div>
  );
}

function ErrorRail({ errors }: { errors: { line: number; message: string }[] }) {
  return (
    <div className="max-h-32 shrink-0 overflow-auto border-t border-rule scroll-thin">
      <div className="flex items-center gap-3 border-b border-hair px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]">
        <span className="text-ink">Errors</span>
        <span className="text-soft">{errors.length === 0 ? "No errors. Last compile clean." : `${errors.length} entries`}</span>
      </div>
      {errors.length > 0 && (
        <ul className="px-3 py-2 font-mono text-[11px] leading-relaxed">
          {errors.map((e, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-soft">L{e.line.toString().padStart(3, "0")}</span>
              <span className="text-ink/85">{e.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
