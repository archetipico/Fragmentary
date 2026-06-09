import type { ShaderDef } from "./types";

export const defaultShader: ShaderDef = {
  code: String.raw`// Spiral galaxy.
// Log-spiral arms over a star field, everything multiplied by a
// radial falloff so the disk fades out at the rim instead of tiling.

float hash21(vec2 p){
  p = fract(p * vec2(221.47, 353.91));
  p += dot(p, p + 59.27);
  return fract(p.x * p.y);
}

float vnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // quintic fade
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++){
    s += a * vnoise(p);
    p = p * 2.04 + 13.1;
    a *= 0.5;
  }
  return s;
}

mat2 rot(float a){
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// Twinkly stars, one screen-space layer
vec3 starLayer(vec2 uv, float thresh, float scale){
  vec2 g = uv * scale;
  vec2 cell = floor(g);
  float h = hash21(cell + 0.5);
  if (h <= thresh) return vec3(0.0);
  vec2 jit = vec2(hash21(cell + 1.7), hash21(cell + 4.3)) - 0.5;
  vec2 q = fract(g) - 0.5 - jit * 0.6;
  float d = exp(-dot(q, q) * 420.0);
  float tw = 0.6 + 0.4 * sin(uTime * 1.7 + h * 80.0);
  vec3 tint = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.9, 0.78), hash21(cell + 9.1));
  return d * tw * tint * (h - thresh) / (1.0 - thresh);
}

void main(){
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution.xy) / uResolution.y;

  float spin = -uTime * 0.07;
  float incl = 0.95;                         // 0 = face-on

  vec3 col = vec3(0.004, 0.005, 0.009);
  col += starLayer(uv, 0.978, 16.0);
  col += starLayer(uv * 1.6 + 7.0, 0.986, 30.0) * 0.7;

  // Map screen coords into the disk's tilted, spinning frame
  vec2 p = rot(0.45) * uv;
  vec2 g = vec2(p.x, p.y / max(cos(incl), 0.06));
  g = rot(spin) * g;
  float r = length(g);
  float th = atan(g.y, g.x);

  float env = exp(-r * 2.7);                 // the whole disk rides on this
  float halo = exp(-r * 1.5);

  float lr = log(r + 0.07);
  float phase = 2.0 * th - 5.2 * lr;
  float arm = pow(0.5 + 0.5 * cos(phase), 3.0);
  float spurs = pow(0.5 + 0.5 * cos(4.0 * th - 7.0 * lr), 4.0);
  arm = arm + 0.35 * spurs;                  // two main arms + faint spurs

  float grain = fbm(g * 3.6);                // chop the arms into clumps
  arm *= 0.35 + 1.1 * grain;
  arm *= smoothstep(0.05, 0.20, r);

  // Keep the inner disk under 1.0 so the core survives the tonemap
  float nucleus = exp(-r * r * 70.0);
  float glow = exp(-r * r * 26.0);
  float bulge = exp(-r * r * 20.0);
  float sb = env * (0.16 + 2.3 * arm) + bulge * 0.5;

  float dust = smoothstep(0.5, 0.95, fbm(g * 5.0));   // dark dust lane
  sb *= 1.0 - 0.62 * dust * smoothstep(0.05, 0.45, r) * smoothstep(1.1, 0.2, r);

  vec3 cCore = vec3(1.0, 0.84, 0.58);        // warm core, pale mid, blue arms
  vec3 cMid = vec3(0.96, 0.93, 0.86);
  vec3 cArm = vec3(0.52, 0.68, 1.0);
  vec3 gcol = mix(cArm, cMid, smoothstep(0.0, 0.4, env));
  gcol = mix(gcol, cCore, smoothstep(0.25, 1.0, bulge));

  vec3 galaxy = gcol * sb;

  float hii = pow(max(fbm(g * 8.5 + 21.0) - 0.6, 0.0) * 2.7, 2.0);   // pink knots
  galaxy += vec3(1.0, 0.33, 0.46) * hii * arm * env * smoothstep(0.12, 0.5, r) * 2.2;

  float blue = pow(max(fbm(g * 11.0 - 5.0) - 0.62, 0.0) * 2.8, 2.0); // blue clusters
  galaxy += vec3(0.6, 0.82, 1.0) * blue * arm * env * 1.4;

  col += galaxy;
  col += cCore * halo * 0.05;
  col += vec3(1.0, 0.90, 0.74) * glow * 0.7;
  col += vec3(1.0, 0.96, 0.88) * nucleus * 3.6;

  col *= 0.95;
  col = col / (1.0 + col);                   // reinhard
  col = pow(col, vec3(0.90));
  float vig = smoothstep(1.85, 0.25, length(uv));
  col *= mix(0.55, 1.0, vig);
  col += (hash21(gl_FragCoord.xy + uTime) - 0.5) / 255.0; // dither out the banding

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`,
};
