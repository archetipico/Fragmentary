export type CheatItem = { sig: string; snippet: string; desc: string };
export type CheatGroup = { category: string; items: CheatItem[] };

export const glslReference: CheatGroup[] = [
  {
    category: "Uniforms",
    items: [
      { sig: "uniform vec3 uResolution", snippet: "uResolution", desc: "Viewport size in pixels; xy = width,height, z = 1." },
      { sig: "uniform float uTime", snippet: "uTime", desc: "Playback time in seconds." },
      { sig: "uniform float uTimeDelta", snippet: "uTimeDelta", desc: "Seconds elapsed since the previous frame." },
      { sig: "uniform int uFrame", snippet: "uFrame", desc: "Frame counter, starts at 0." },
      { sig: "uniform vec4 uMouse", snippet: "uMouse", desc: "xy = current pointer, zw = last click; z > 0 while held." },
      { sig: "uniform sampler2D uPrev", snippet: "uPrev", desc: "Previous frame; sampling it turns on feedback (multi-pass) rendering." },
      { sig: "out vec4 fragColor", snippet: "fragColor", desc: "The pixel color you write in main()." },
      { sig: "vec4 gl_FragCoord", snippet: "gl_FragCoord", desc: "Window-space fragment coordinate in pixels." },
    ],
  },
  {
    category: "Keywords",
    items: [
      { sig: "void main()", snippet: "void main() {\n  \n}", desc: "Entry point; write fragColor here." },
      { sig: "if / else", snippet: "if () {\n} else {\n}", desc: "Branch on a bool." },
      { sig: "for (init; test; step)", snippet: "for (int i = 0; i < 8; i++) {\n}", desc: "Loop; keep the bound constant for old GPUs." },
      { sig: "while (test)", snippet: "while () {\n}", desc: "Loop until the test is false." },
      { sig: "break / continue", snippet: "break;", desc: "Leave or skip a loop iteration." },
      { sig: "return", snippet: "return ", desc: "Return from a function." },
      { sig: "discard", snippet: "discard;", desc: "Drop the current fragment." },
    ],
  },
  {
    category: "Types",
    items: [
      { sig: "float, int, uint, bool", snippet: "float", desc: "Scalar types." },
      { sig: "vec2, vec3, vec4", snippet: "vec3", desc: "Floating-point vectors." },
      { sig: "ivec2..4, uvec2..4, bvec2..4", snippet: "ivec2", desc: "Integer, unsigned, and boolean vectors." },
      { sig: "mat2, mat3, mat4", snippet: "mat3", desc: "Square float matrices, column-major." },
      { sig: "mat2x3, mat3x4, ...", snippet: "mat2x3", desc: "Non-square matrices, matCxR (C columns, R rows)." },
      { sig: "sampler2D", snippet: "sampler2D", desc: "2D texture handle for texture() lookups." },
    ],
  },
  {
    category: "Qualifiers",
    items: [
      { sig: "const", snippet: "const ", desc: "Compile-time constant." },
      { sig: "in / out / inout", snippet: "in ", desc: "Function parameter direction." },
      { sig: "uniform", snippet: "uniform ", desc: "Value constant across the draw, set from the host." },
      { sig: "flat", snippet: "flat ", desc: "No interpolation across the primitive." },
      { sig: "precision highp float", snippet: "precision highp float;", desc: "Default precision for a type." },
      { sig: "#define NAME value", snippet: "#define ", desc: "Preprocessor macro." },
    ],
  },
  {
    category: "Swizzles",
    items: [
      { sig: ".xyzw  .rgba  .stpq", snippet: ".xyz", desc: "Three interchangeable component name sets." },
      { sig: "v.xy, v.bgr, v.xxz", snippet: ".xy", desc: "Reorder or duplicate components in any combination." },
    ],
  },
  {
    category: "Trigonometry",
    items: [
      { sig: "genType radians(degrees)", snippet: "radians(deg)", desc: "Degrees to radians." },
      { sig: "genType degrees(radians)", snippet: "degrees(rad)", desc: "Radians to degrees." },
      { sig: "genType sin(angle)", snippet: "sin(angle)", desc: "Sine, angle in radians." },
      { sig: "genType cos(angle)", snippet: "cos(angle)", desc: "Cosine, angle in radians." },
      { sig: "genType tan(angle)", snippet: "tan(angle)", desc: "Tangent." },
      { sig: "genType asin(x)", snippet: "asin(x)", desc: "Arc sine, result in [-pi/2, pi/2]." },
      { sig: "genType acos(x)", snippet: "acos(x)", desc: "Arc cosine, result in [0, pi]." },
      { sig: "genType atan(y, x)", snippet: "atan(y, x)", desc: "Two-argument arc tangent, full circle." },
      { sig: "genType atan(yOverX)", snippet: "atan(yOverX)", desc: "Single-argument arc tangent." },
      { sig: "genType sinh/cosh/tanh(x)", snippet: "tanh(x)", desc: "Hyperbolic functions." },
      { sig: "genType asinh/acosh/atanh(x)", snippet: "asinh(x)", desc: "Inverse hyperbolic functions." },
    ],
  },
  {
    category: "Exponential",
    items: [
      { sig: "genType pow(x, y)", snippet: "pow(x, y)", desc: "x raised to y." },
      { sig: "genType exp(x)", snippet: "exp(x)", desc: "Natural exponential e^x." },
      { sig: "genType log(x)", snippet: "log(x)", desc: "Natural logarithm." },
      { sig: "genType exp2(x)", snippet: "exp2(x)", desc: "2^x." },
      { sig: "genType log2(x)", snippet: "log2(x)", desc: "Base-2 logarithm." },
      { sig: "genType sqrt(x)", snippet: "sqrt(x)", desc: "Square root." },
      { sig: "genType inversesqrt(x)", snippet: "inversesqrt(x)", desc: "1 / sqrt(x)." },
    ],
  },
  {
    category: "Common",
    items: [
      { sig: "genType abs(x)", snippet: "abs(x)", desc: "Absolute value." },
      { sig: "genType sign(x)", snippet: "sign(x)", desc: "-1, 0, or 1 by sign." },
      { sig: "genType floor(x)", snippet: "floor(x)", desc: "Largest integer not greater than x." },
      { sig: "genType ceil(x)", snippet: "ceil(x)", desc: "Smallest integer not less than x." },
      { sig: "genType trunc(x)", snippet: "trunc(x)", desc: "Toward zero." },
      { sig: "genType round(x)", snippet: "round(x)", desc: "Nearest integer." },
      { sig: "genType fract(x)", snippet: "fract(x)", desc: "x - floor(x), the fractional part." },
      { sig: "genType mod(x, y)", snippet: "mod(x, y)", desc: "x - y * floor(x/y)." },
      { sig: "genType min(x, y)", snippet: "min(x, y)", desc: "Smaller of the two." },
      { sig: "genType max(x, y)", snippet: "max(x, y)", desc: "Larger of the two." },
      { sig: "genType clamp(x, lo, hi)", snippet: "clamp(x, lo, hi)", desc: "Constrain x to [lo, hi]." },
      { sig: "genType mix(a, b, t)", snippet: "mix(a, b, t)", desc: "Linear blend a*(1-t) + b*t." },
      { sig: "genType step(edge, x)", snippet: "step(edge, x)", desc: "0 if x < edge else 1." },
      { sig: "genType smoothstep(e0, e1, x)", snippet: "smoothstep(e0, e1, x)", desc: "Smooth Hermite ramp 0..1 between edges." },
      { sig: "genType roundEven(x)", snippet: "roundEven(x)", desc: "Nearest integer, ties to even." },
      { sig: "genType modf(x, out ip)", snippet: "modf(x, ip)", desc: "Split x into integer part (ip) and fractional return." },
      { sig: "bvec isnan(x) / isinf(x)", snippet: "isnan(x)", desc: "Per-component NaN or infinity test." },
      { sig: "ivec/uvec floatBitsToInt/Uint(x)", snippet: "floatBitsToInt(x)", desc: "Reinterpret float bit pattern as int/uint." },
      { sig: "vec intBitsToFloat(i) / uintBitsToFloat(u)", snippet: "intBitsToFloat(i)", desc: "Reinterpret int/uint bit pattern as float." },
    ],
  },
  {
    category: "Geometric",
    items: [
      { sig: "float length(v)", snippet: "length(v)", desc: "Vector magnitude." },
      { sig: "float distance(a, b)", snippet: "distance(a, b)", desc: "length(a - b)." },
      { sig: "float dot(a, b)", snippet: "dot(a, b)", desc: "Dot product." },
      { sig: "vec3 cross(a, b)", snippet: "cross(a, b)", desc: "Cross product, vec3 only." },
      { sig: "genType normalize(v)", snippet: "normalize(v)", desc: "Unit vector in the same direction." },
      { sig: "genType reflect(I, N)", snippet: "reflect(I, N)", desc: "Reflect incident I about normal N." },
      { sig: "genType refract(I, N, eta)", snippet: "refract(I, N, eta)", desc: "Refract I through N with ratio eta." },
      { sig: "genType faceforward(N, I, Nref)", snippet: "faceforward(N, I, Nref)", desc: "Flip N to face against I." },
    ],
  },
  {
    category: "Matrix",
    items: [
      { sig: "mat matrixCompMult(a, b)", snippet: "matrixCompMult(a, b)", desc: "Component-wise matrix multiply." },
      { sig: "mat transpose(m)", snippet: "transpose(m)", desc: "Matrix transpose." },
      { sig: "float determinant(m)", snippet: "determinant(m)", desc: "Matrix determinant." },
      { sig: "mat inverse(m)", snippet: "inverse(m)", desc: "Matrix inverse." },
      { sig: "mat outerProduct(c, r)", snippet: "outerProduct(c, r)", desc: "Outer product of two vectors." },
    ],
  },
  {
    category: "Vector relational",
    items: [
      { sig: "bvec lessThan(a, b)", snippet: "lessThan(a, b)", desc: "Per-component a < b." },
      { sig: "bvec lessThanEqual(a, b)", snippet: "lessThanEqual(a, b)", desc: "Per-component a <= b." },
      { sig: "bvec greaterThan(a, b)", snippet: "greaterThan(a, b)", desc: "Per-component a > b." },
      { sig: "bvec greaterThanEqual(a, b)", snippet: "greaterThanEqual(a, b)", desc: "Per-component a >= b." },
      { sig: "bvec equal(a, b)", snippet: "equal(a, b)", desc: "Per-component a == b." },
      { sig: "bvec notEqual(a, b)", snippet: "notEqual(a, b)", desc: "Per-component a != b." },
      { sig: "bool any(b) / all(b)", snippet: "any(b)", desc: "Reduce a bvec with OR / AND." },
      { sig: "bvec not(b)", snippet: "not(b)", desc: "Per-component logical negation." },
    ],
  },
  {
    category: "Texture",
    items: [
      { sig: "vec4 texture(s, uv)", snippet: "texture(s, uv)", desc: "Sample at normalized uv in [0,1]." },
      { sig: "vec4 textureLod(s, uv, lod)", snippet: "textureLod(s, uv, lod)", desc: "Sample at an explicit mip level." },
      { sig: "vec4 texelFetch(s, ip, lod)", snippet: "texelFetch(s, ip, 0)", desc: "Fetch a texel by integer coordinate." },
      { sig: "ivec2 textureSize(s, lod)", snippet: "textureSize(s, 0)", desc: "Dimensions of a mip level in texels." },
      { sig: "vec4 textureGrad(s, uv, dPdx, dPdy)", snippet: "textureGrad(s, uv, dPdx, dPdy)", desc: "Sample with explicit gradients." },
      { sig: "vec4 textureProj(s, uvw)", snippet: "textureProj(s, uvw)", desc: "Projective sample; coords divided by their last component." },
      { sig: "vec4 textureProjLod(s, uvw, lod)", snippet: "textureProjLod(s, uvw, lod)", desc: "Projective sample at an explicit mip level." },
      { sig: "vec4 textureOffset(s, uv, off)", snippet: "textureOffset(s, uv, off)", desc: "Sample with a constant integer texel offset." },
      { sig: "vec4 texelFetchOffset(s, ip, lod, off)", snippet: "texelFetchOffset(s, ip, 0, off)", desc: "texelFetch shifted by a constant texel offset." },
      { sig: "vec4 textureLodOffset(s, uv, lod, off)", snippet: "textureLodOffset(s, uv, lod, off)", desc: "textureLod with a constant texel offset." },
      { sig: "vec4 textureGradOffset(s, uv, dx, dy, off)", snippet: "textureGradOffset(s, uv, dx, dy, off)", desc: "textureGrad with a constant texel offset." },
    ],
  },
  {
    category: "Derivatives",
    items: [
      { sig: "genType dFdx(p)", snippet: "dFdx(p)", desc: "Partial derivative across screen x." },
      { sig: "genType dFdy(p)", snippet: "dFdy(p)", desc: "Partial derivative across screen y." },
      { sig: "genType fwidth(p)", snippet: "fwidth(p)", desc: "abs(dFdx) + abs(dFdy), edge width estimate." },
    ],
  },
  {
    category: "Pack / unpack",
    items: [
      { sig: "uint packSnorm2x16(vec2 v)", snippet: "packSnorm2x16(v)", desc: "Pack two [-1,1] floats into one uint." },
      { sig: "vec2 unpackSnorm2x16(uint p)", snippet: "unpackSnorm2x16(p)", desc: "Unpack a uint to two [-1,1] floats." },
      { sig: "uint packUnorm2x16(vec2 v)", snippet: "packUnorm2x16(v)", desc: "Pack two [0,1] floats into one uint." },
      { sig: "vec2 unpackUnorm2x16(uint p)", snippet: "unpackUnorm2x16(p)", desc: "Unpack a uint to two [0,1] floats." },
      { sig: "uint packHalf2x16(vec2 v)", snippet: "packHalf2x16(v)", desc: "Pack two floats as half precision into one uint." },
      { sig: "vec2 unpackHalf2x16(uint p)", snippet: "unpackHalf2x16(p)", desc: "Unpack a uint to two half-precision floats." },
    ],
  },
];

export function filterReference(groups: CheatGroup[], query: string): CheatGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((g) => ({
      category: g.category,
      items: g.items.filter(
        (it) => it.sig.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q),
      ),
    }))
    .filter((g) => g.items.length > 0);
}
