import { useEffect, useRef, useState } from "react";
import { GlslRenderer } from "@/webgl/glsl-renderer";
import { RenderLoop } from "@/webgl/loop";

type Props = {
  source: string;
  active?: boolean;
  resetSignal?: number;
  fps?: number;
  dpr?: number;
  timeScale?: number;
  className?: string;
  onError?: (errors: { line: number; message: string }[]) => void;
  onFps?: (fps: number) => void;
};

export function ShaderCanvas({
  source,
  active = true,
  resetSignal = 0,
  fps,
  dpr = 1,
  timeScale = 0.4,
  className,
  onError,
  onFps,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glslRef = useRef<GlslRenderer | null>(null);
  const loopRef = useRef<RenderLoop | null>(null);
  const frameCountRef = useRef({ last: performance.now(), frames: 0, emitted: -1 });
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [ready, setReady] = useState(0);

  const cbRef = useRef({ onError, onFps });
  cbRef.current = { onError, onFps };

  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    setUnavailable(null);
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: GlslRenderer;
    try {
      renderer = new GlslRenderer(canvas);
    } catch (err) {
      setUnavailable("WebGL2 is unavailable in this browser.");
      cbRef.current.onError?.([{ line: 0, message: String(err) }]);
      return;
    }
    renderer.onContextLost = () => {
      setUnavailable("The GPU context was lost. Reload the page to rebuild it.");
    };
    glslRef.current = renderer;

    const applySize = () => {
      const d = Math.max(1, dpr);
      const w = Math.max(1, Math.round(canvas.clientWidth * d));
      const h = Math.max(1, Math.round(canvas.clientHeight * d));
      renderer.resize(w, h);
    };

    const loop = new RenderLoop((state) => {
      glslRef.current?.render(state);
      const fc = frameCountRef.current;
      fc.frames++;
      const now = performance.now();
      if (now - fc.last > 1000) {
        const v = Math.round((fc.frames * 1000) / (now - fc.last));
        if (v !== fc.emitted) {
          fc.emitted = v;
          cbRef.current.onFps?.(v);
        }
        fc.frames = 0;
        fc.last = now;
      }
    });
    loop.setTimeScale(timeScale);
    loopRef.current = loop;
    const detachPointer = loop.attachPointer(canvas);

    const ro = new ResizeObserver(() => {
      applySize();
      if (!loop.isRunning()) loop.renderStatic();
    });
    ro.observe(canvas);
    applySize();

    setReady((n) => n + 1);

    return () => {
      ro.disconnect();
      detachPointer();
      loopRef.current?.stop();
      loopRef.current = null;
      glslRef.current?.dispose();
      glslRef.current = null;
    };
  }, [dpr]);

  useEffect(() => {
    if (ready === 0) return;
    const result = glslRef.current?.compile(source);
    if (!result) return;
    cbRef.current.onError?.(result.ok ? [] : result.errors);
    const loop = loopRef.current;
    if (loop && !activeRef.current) {
      loop.stop();
      loop.reset();
      requestAnimationFrame(() => {
        if (loop === loopRef.current && !loop.isRunning()) loop.renderStatic();
      });
    }
  }, [source, ready]);

  useEffect(() => {
    const loop = loopRef.current;
    if (!loop) return;
    if (active && !loop.isRunning()) loop.start();
    else if (!active && loop.isRunning()) loop.stop();
  }, [active, ready]);

  useEffect(() => {
    loopRef.current?.setTargetFps(fps ?? 0);
  }, [fps, ready]);

  useEffect(() => {
    if (ready === 0) return;
    const loop = loopRef.current;
    if (!loop) return;
    glslRef.current?.clearFeedback();
    loop.reset();
    if (!loop.isRunning()) {
      requestAnimationFrame(() => {
        if (loop === loopRef.current && !loop.isRunning()) loop.renderStatic();
      });
    }
  }, [resetSignal]);

  return (
    <div className={`absolute inset-0 block ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full block"
        aria-label="Shader canvas"
      />
      {unavailable && (
        <div className="absolute inset-0 grid place-items-center text-center px-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-soft max-w-[30ch]">
            {unavailable}
          </div>
        </div>
      )}
    </div>
  );
}
