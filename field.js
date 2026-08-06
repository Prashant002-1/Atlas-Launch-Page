/* Atlas — field
 *
 * The hero ground is a live survey, not a picture. A domain-warped fbm field,
 * ordered-dithered so it reads as print, tinted brand-deep, that drifts slowly
 * and flares where the pointer has been — then heals.
 *
 * Raw WebGL, ~60 lines of setup. No libraries: script-src 'self' forbids a CDN.
 * DPR capped at 1.5. Pauses off-screen and on tab hide. Bails to a static CSS
 * gradient when WebGL is unavailable or reduced-motion is set.
 */
(() => {
  const canvas = document.querySelector(".field-canvas");
  if (!canvas) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) {
    canvas.classList.add("is-static");
    return;
  }

  const gl =
    canvas.getContext("webgl", { alpha: true, antialias: false }) ||
    canvas.getContext("experimental-webgl", { alpha: true, antialias: false });
  if (!gl) {
    canvas.classList.add("is-static");
    return;
  }

  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  const DITHER = 4.0;

  const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

  const FRAG = `
precision mediump float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_ptr;       /* 0..1, smoothed */
uniform float u_energy;    /* 0..1, pointer recently moved */
uniform float u_progress;  /* 0..1, hero leaving viewport */

/* --- noise -------------------------------------------------------------- */
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.55;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = rot * p * 2.02 + vec2(100.0);
    amp *= 0.52;
  }
  return v;
}

/* --- Bayer 4x4 ordered dither -------------------------------------------- */
float bayer(vec2 frag) {
  vec2 p = floor(mod(frag, DITHER));
  float x = p.x;
  float y = p.y;
  /* 4x4 Bayer matrix, unrolled */
  float m00= 0.0, m10= 8.0, m20= 2.0, m30=10.0;
  float m01=12.0, m11= 4.0, m21=14.0, m31= 6.0;
  float m02= 3.0, m12=11.0, m22= 1.0, m32= 9.0;
  float m03=15.0, m13= 7.0, m23=13.0, m33= 5.0;
  float v =
    y < 2.0 ? (y < 1.0 ?
      (x < 2.0 ? (x < 1.0 ? m00 : m10) : (x < 3.0 ? m20 : m30)) :
      (x < 2.0 ? (x < 1.0 ? m01 : m11) : (x < 3.0 ? m21 : m31))) :
    (y < 3.0 ?
      (x < 2.0 ? (x < 1.0 ? m02 : m12) : (x < 3.0 ? m22 : m32)) :
      (x < 2.0 ? (x < 1.0 ? m03 : m13) : (x < 3.0 ? m23 : m33)));
  return (v + 0.5) / 16.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;

  /* slow drift so the ground is alive, not animated */
  vec2 drift = vec2(u_time * 0.014, u_time * 0.009);

  /* domain warp: organic instead of procedural */
  vec2 q = vec2(fbm(p * 1.35 + drift), fbm(p * 1.35 + vec2(5.2, 1.3) - drift * 0.7));
  vec2 r = vec2(fbm(p * 1.35 + 2.6 * q + vec2(1.7, 9.2) + drift * 0.35),
                fbm(p * 1.35 + 2.6 * q + vec2(8.3, 2.8) - drift * 0.28));
  float f = fbm(p * 1.35 + 2.4 * r);

  /* remap into ridges that read as survey contours */
  float ridge = 1.0 - abs(f * 2.0 - 1.0);
  ridge = smoothstep(0.55, 0.98, ridge);

  /* pointer wake: a short-lived hotspot that flares and heals */
  float wake = 0.0;
  if (u_energy > 0.01) {
    vec2 d = uv - u_ptr;
    d.x *= u_res.x / u_res.y;
    float dist = length(d);
    /* soft falloff, carried slightly by time so it feels like a settling surface */
    float radius = 0.16 + 0.05 * sin(u_time * 2.1 + dist * 18.0);
    wake = smoothstep(radius, 0.0, dist) * u_energy;
  }

  /* dithered screen */
  float screen = bayer(gl_FragCoord.xy / DITHER);
  float field = ridge * 0.82 + wake * 0.9;
  float dithered = step(screen * 0.82, field);

  /* fade out as the hero leaves so the field doesn't scroll with the page */
  float heroAlpha = 1.0 - smoothstep(0.15, 0.95, u_progress);

  /* paper base, brand-deep ink. Alpha so the CSS canvas shows through. */
  vec3 ink = vec3(0.078, 0.330, 0.239); /* #14543d */
  float a = dithered * 0.16 * heroAlpha + wake * 0.10 * heroAlpha;

  gl_FragColor = vec4(ink, a);
}
`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("field shader:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) {
    canvas.classList.add("is-static");
    return;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    canvas.classList.add("is-static");
    return;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "u_res");
  const uTime = gl.getUniformLocation(prog, "u_time");
  const uPtr = gl.getUniformLocation(prog, "u_ptr");
  const uEnergy = gl.getUniformLocation(prog, "u_energy");
  const uProgress = gl.getUniformLocation(prog, "u_progress");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let running = false;
  let raf = 0;
  let start = performance.now();

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const root = document.documentElement;
  const num = (name, fallback) => {
    const v = parseFloat(getComputedStyle(root).getPropertyValue(name));
    return Number.isFinite(v) ? v : fallback;
  };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uPtr, num("--ptr-x", 0.5), 1.0 - num("--ptr-y", 0.5));
    gl.uniform1f(uEnergy, num("--ptr-energy", 0));
    gl.uniform1f(uProgress, num("--hero-progress", 0));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* pause when off-screen or hidden */
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        start = performance.now() - 16; /* avoid a time jump on resume */
        raf = requestAnimationFrame(frame);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    },
    { rootMargin: "80px" },
  );
  io.observe(canvas);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!document.hidden && !running) {
      const rect = canvas.getBoundingClientRect();
      const visible =
        rect.bottom > 0 &&
        rect.top < (window.innerHeight || document.documentElement.clientHeight);
      if (visible) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    }
  });
})();
