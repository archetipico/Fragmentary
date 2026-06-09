type GlslCompileError = {
  line: number;
  message: string;
};

type GlslCompileResult = {
  ok: boolean;
  errors: GlslCompileError[];
  log: string;
};

const VERTEX_SOURCE = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const HEADER = `#version 300 es
precision highp float;
precision highp int;

uniform vec3  uResolution;
uniform float uTime;
uniform float uTimeDelta;
uniform int   uFrame;
uniform vec4  uMouse;
uniform sampler2D uPrev;

out vec4 fragColor;
`;

const COPY_FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
out vec4 o;
void main() {
  o = texture(uTex, gl_FragCoord.xy / uRes);
}`;

const MAX_SOURCE_LEN = 64 * 1024;

const ERROR_RE = /^(?:ERROR|WARNING):\s*\d+:(\d+):\s*(.*)$/i;

// uPrev is only wired up when the source actually samples it, so plain shaders
// stay single-pass.
const FEEDBACK_RE = /\buPrev\b/;

function parseLog(log: string, headerOffset: number): GlslCompileError[] {
  const out: GlslCompileError[] = [];
  for (const raw of log.split("\n")) {
    const m = raw.trim().match(ERROR_RE);
    if (!m) continue;
    const reported = parseInt(m[1], 10);
    out.push({
      line: Math.max(1, reported - headerOffset),
      message: m[2],
    });
  }
  return out;
}

export class GlslRenderer {
  onContextLost: (() => void) | null = null;

  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private vao: WebGLVertexArrayObject | null = null;
  private vbo: WebGLBuffer | null = null;
  private program: WebGLProgram | null = null;
  private locs: Record<string, WebGLUniformLocation | null> = {};
  private headerOffset = HEADER.split("\n").length;
  private onLost: (e: Event) => void;

  private feedback = false;
  private fbo: WebGLFramebuffer | null = null;
  private texA: WebGLTexture | null = null;
  private texB: WebGLTexture | null = null;
  private texW = 0;
  private texH = 0;
  private simFrame = 0;
  private copyProgram: WebGLProgram | null = null;
  private copyTexLoc: WebGLUniformLocation | null = null;
  private copyResLoc: WebGLUniformLocation | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: false,
      premultipliedAlpha: false,
    });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    this.canvas = canvas;
    this.onLost = (e: Event) => {
      e.preventDefault();
      this.program = null;
      this.onContextLost?.();
    };
    canvas.addEventListener("webglcontextlost", this.onLost, false);
    this.setupQuad();
  }

  private setupQuad() {
    const gl = this.gl;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  private compileShader(type: number, src: string): WebGLShader | string {
    const gl = this.gl;
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh) || "compile failed";
      gl.deleteShader(sh);
      return log;
    }
    return sh;
  }

  private buildCopyProgram() {
    const gl = this.gl;
    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SOURCE);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, COPY_FRAGMENT);
    if (typeof vs === "string" || typeof fs === "string") return;
    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, "a_pos");
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      gl.deleteProgram(p);
      return;
    }
    this.copyProgram = p;
    this.copyTexLoc = gl.getUniformLocation(p, "uTex");
    this.copyResLoc = gl.getUniformLocation(p, "uRes");
  }

  compile(fragSource: string): GlslCompileResult {
    const gl = this.gl;
    if (fragSource.length > MAX_SOURCE_LEN) {
      const msg = `source exceeds ${MAX_SOURCE_LEN} characters`;
      return { ok: false, errors: [{ line: 0, message: msg }], log: msg };
    }
    const wrapped = HEADER + "\n" + fragSource;

    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SOURCE);
    if (typeof vs === "string") return { ok: false, errors: [{ line: 0, message: vs }], log: vs };

    const fs = this.compileShader(gl.FRAGMENT_SHADER, wrapped);
    if (typeof fs === "string") {
      gl.deleteShader(vs);
      return { ok: false, errors: parseLog(fs, this.headerOffset), log: fs };
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, "a_pos");
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program) || "link failed";
      gl.deleteProgram(program);
      return { ok: false, errors: [{ line: 0, message: log }], log };
    }

    if (this.program) gl.deleteProgram(this.program);
    this.program = program;
    this.locs = {
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uTime: gl.getUniformLocation(program, "uTime"),
      uTimeDelta: gl.getUniformLocation(program, "uTimeDelta"),
      uFrame: gl.getUniformLocation(program, "uFrame"),
      uMouse: gl.getUniformLocation(program, "uMouse"),
      uPrev: gl.getUniformLocation(program, "uPrev"),
    };
    this.feedback = FEEDBACK_RE.test(fragSource);
    if (this.feedback && !this.copyProgram) this.buildCopyProgram();
    this.simFrame = 0;
    this.texW = 0;
    this.texH = 0;
    return { ok: true, errors: [], log: "" };
  }

  resize(w: number, h: number) {
    const gl = this.gl;
    const W = Math.max(1, Math.floor(w));
    const H = Math.max(1, Math.floor(h));
    if (gl.canvas.width !== W) gl.canvas.width = W;
    if (gl.canvas.height !== H) gl.canvas.height = H;
    gl.viewport(0, 0, W, H);
  }

  private setShaderUniforms(state: RenderInput, w: number, h: number, frame: number) {
    const gl = this.gl;
    if (this.locs.uResolution) gl.uniform3f(this.locs.uResolution, w, h, 1);
    if (this.locs.uTime) gl.uniform1f(this.locs.uTime, state.time);
    if (this.locs.uTimeDelta) gl.uniform1f(this.locs.uTimeDelta, state.timeDelta);
    if (this.locs.uFrame) gl.uniform1i(this.locs.uFrame, frame);
    if (this.locs.uMouse) gl.uniform4fv(this.locs.uMouse, state.mouse);
  }

  private ensureFeedbackTargets(w: number, h: number) {
    const gl = this.gl;
    if (this.texW === w && this.texH === h && this.texA && this.texB) return;
    this.disposeFeedbackTargets();
    const ext = gl.getExtension("EXT_color_buffer_float");
    const internal = ext ? gl.RGBA16F : gl.RGBA8;
    const type = ext ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
    const make = () => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, gl.RGBA, type, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      return t;
    };
    this.texA = make();
    this.texB = make();
    gl.bindTexture(gl.TEXTURE_2D, null);
    if (!this.fbo) this.fbo = gl.createFramebuffer();
    this.texW = w;
    this.texH = h;
    this.simFrame = 0;
  }

  render(state: RenderInput) {
    const gl = this.gl;
    if (!this.program) return;
    if (this.feedback && this.copyProgram) {
      this.renderFeedback(state);
      return;
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    this.setShaderUniforms(state, gl.canvas.width, gl.canvas.height, state.frame);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  private renderFeedback(state: RenderInput) {
    const gl = this.gl;
    const w = gl.canvas.width;
    const h = gl.canvas.height;
    this.ensureFeedbackTargets(w, h);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texB, 0);
    gl.viewport(0, 0, w, h);
    gl.useProgram(this.program);
    this.setShaderUniforms(state, w, h, this.simFrame);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texA);
    if (this.locs.uPrev) gl.uniform1i(this.locs.uPrev, 0);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.useProgram(this.copyProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texB);
    if (this.copyTexLoc) gl.uniform1i(this.copyTexLoc, 0);
    if (this.copyResLoc) gl.uniform2f(this.copyResLoc, w, h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);

    const tmp = this.texA;
    this.texA = this.texB;
    this.texB = tmp;
    this.simFrame++;
  }

  clearFeedback() {
    this.simFrame = 0;
    this.texW = 0;
    this.texH = 0;
  }

  private disposeFeedbackTargets() {
    const gl = this.gl;
    if (this.texA) gl.deleteTexture(this.texA);
    if (this.texB) gl.deleteTexture(this.texB);
    this.texA = null;
    this.texB = null;
  }

  dispose() {
    const gl = this.gl;
    this.canvas.removeEventListener("webglcontextlost", this.onLost, false);
    if (this.program) gl.deleteProgram(this.program);
    if (this.copyProgram) gl.deleteProgram(this.copyProgram);
    if (this.fbo) gl.deleteFramebuffer(this.fbo);
    this.disposeFeedbackTargets();
    if (this.vbo) gl.deleteBuffer(this.vbo);
    if (this.vao) gl.deleteVertexArray(this.vao);
    this.program = null;
    this.copyProgram = null;
    this.fbo = null;
    this.vao = null;
    this.vbo = null;
  }
}

type RenderInput = {
  time: number;
  timeDelta: number;
  frame: number;
  mouse: [number, number, number, number];
};
