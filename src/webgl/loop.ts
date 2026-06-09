type RenderState = {
  time: number;
  timeDelta: number;
  frame: number;
  mouse: [number, number, number, number];
};

type RenderCallback = (state: RenderState) => void;

export class RenderLoop {
  private cb: RenderCallback;
  private clock = 0;
  private last = 0;
  private frame = 0;
  private rafId = 0;
  private running = false;
  private mouse: [number, number, number, number] = [0, 0, 0, 0];
  private mouseDown = false;
  private targetFps = 0;
  private accum = 0;
  private sinceEmit = 0;
  private timeScale = 1;
  private scratch: [number, number, number, number] = [0, 0, 0, 0];

  constructor(cb: RenderCallback) {
    this.cb = cb;
  }

  setTargetFps(fps: number) {
    this.targetFps = fps > 0 ? fps : 0;
  }

  setTimeScale(scale: number) {
    this.timeScale = scale > 0 ? scale : 1;
  }

  private emit(timeDelta: number) {
    this.scratch[0] = this.mouse[0];
    this.scratch[1] = this.mouse[1];
    this.scratch[2] = this.mouse[2];
    this.scratch[3] = this.mouse[3];
    this.cb({
      time: this.clock * this.timeScale,
      timeDelta: timeDelta * this.timeScale,
      frame: this.frame,
      mouse: this.scratch,
    });
  }

  renderStatic(time = this.clock > 0 ? this.clock : 1.6) {
    const prev = this.clock;
    this.clock = time;
    this.emit(0);
    this.clock = prev;
  }

  attachPointer(el: HTMLElement) {
    const toLocal = (ev: PointerEvent): [number, number] => {
      const r = el.getBoundingClientRect();
      const canvas = el as HTMLCanvasElement;
      const x = r.width > 0 ? (ev.clientX - r.left) * canvas.width / r.width : 0;
      const y = r.height > 0 ? (r.height - (ev.clientY - r.top)) * canvas.height / r.height : 0;
      return [x, y];
    };
    const onMove = (ev: PointerEvent) => {
      const [x, y] = toLocal(ev);
      this.mouse[0] = x;
      this.mouse[1] = y;
      if (this.mouseDown) {
        this.mouse[2] = x;
        this.mouse[3] = y;
      }
    };
    const onDown = (ev: PointerEvent) => {
      this.mouseDown = true;
      const [x, y] = toLocal(ev);
      this.mouse[2] = x;
      this.mouse[3] = y;
    };
    const onUp = () => {
      this.mouseDown = false;
      this.mouse[2] = -Math.abs(this.mouse[2]);
      this.mouse[3] = -Math.abs(this.mouse[3]);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now() / 1000;
    this.sinceEmit = 0;
    const step = () => {
      if (!this.running) return;
      const now = performance.now() / 1000;
      const delta = now - this.last;
      this.last = now;
      this.sinceEmit += delta;
      if (this.targetFps > 0) {
        this.accum += delta;
        const interval = 1 / this.targetFps;
        if (this.accum < interval) {
          this.rafId = requestAnimationFrame(step);
          return;
        }
        this.accum -= interval;
      }
      this.clock += this.sinceEmit;
      this.emit(this.sinceEmit);
      this.sinceEmit = 0;
      this.frame++;
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  reset() {
    this.clock = 0;
    this.frame = 0;
    this.accum = 0;
    this.sinceEmit = 0;
  }

  isRunning() {
    return this.running;
  }
}
