/* Atlas — hero field
 *
 * An ordered-dither screen drifting over the paper. The density comes from a
 * domain-warped noise field with a soft diagonal bias, so there is no centre,
 * no radial falloff, and nothing that resolves into an orb. It should read as
 * ink laid on stock by a press that is very slightly alive.
 *
 * Ordered (Bayer) rather than noise dithering on purpose: the threshold map is
 * fixed in screen space, so the pattern holds still between frames and reads
 * as a printed screen instead of crawling static.
 *
 * The pointer adds a swell that trails *behind* the direction of travel — a
 * wake rather than a halo. A symmetric glow following the cursor is the tell
 * of an effect bolted on after the fact.
 *
 * Raw WebGL, same-origin, no dependencies. The CSS gradient underneath is the
 * real design; this is enhancement and bails out cleanly.
 */
(() => {
  const canvas = document.querySelector("[data-field]");
  if (!canvas) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;

  const gl =
    canvas.getContext("webgl", { antialias: false, alpha: true }) ||
    canvas.getContext("experimental-webgl", { antialias: false, alpha: true });
  if (!gl) return;

  const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

  const FRAG = `
    precision highp float;

    uniform vec2  u_res;
    uniform float u_time;
    uniform vec2  u_ptr;      // 0..1
    uniform vec2  u_ptrVel;   // smoothed velocity
    uniform float u_energy;   // decaying pointer energy
    uniform float u_intro;    // 0..1 settle on load

    const vec3 INK    = vec3(0.059, 0.420, 0.271);  // #0f6b45
    const vec3 BRIGHT = vec3(0.447, 0.831, 0.604);  // #72d49a

    float hash21(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float vnoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
        mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * vnoise(p);
        p *= 2.02;
        a *= 0.5;
      }
      return v;
    }

    // 4x4 Bayer threshold map, normalized
    float bayer4(vec2 cell) {
      int x = int(mod(cell.x, 4.0));
      int y = int(mod(cell.y, 4.0));
      int idx = x + y * 4;
      float m[16];
      m[0]=0.0;   m[1]=8.0;   m[2]=2.0;   m[3]=10.0;
      m[4]=12.0;  m[5]=4.0;   m[6]=14.0;  m[7]=6.0;
      m[8]=3.0;   m[9]=11.0;  m[10]=1.0;  m[11]=9.0;
      m[12]=15.0; m[13]=7.0;  m[14]=13.0; m[15]=5.0;
      float t = 0.0;
      for (int k = 0; k < 16; k++) { if (k == idx) t = m[k]; }
      return (t + 0.5) / 16.0;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float aspect = u_res.x / max(u_res.y, 1.0);
      vec2 sp = vec2(uv.x * aspect, uv.y);

      float t = u_time * 0.021;

      // Domain warp before sampling — this is what keeps it from looking
      // like plain procedural noise.
      vec2 wp = sp * 1.35 + vec2(t, -t * 0.62);
      wp += 0.42 * vec2(fbm(wp + 1.7), fbm(wp + 9.2));
      float field = fbm(wp);

      // Soft diagonal bias: denser toward the upper right, thinning to open
      // paper at the lower left. Directional, not concentric.
      float bias = smoothstep(-0.35, 1.25, uv.x * 0.72 + uv.y * 0.85);
      field = field * 0.78 + bias * 0.46;

      // Pointer wake — offset backwards along travel so it trails.
      vec2 pp = vec2(u_ptr.x * aspect, u_ptr.y);
      vec2 d  = sp - pp + u_ptrVel * 0.30;
      d.y *= 1.42;                                  // flatter than round
      float wake = u_energy * exp(-dot(d, d) * 11.0);
      field += wake * 0.42;

      // Dissolve toward the lower left so a third of the hero stays open
      // paper. The screen should sit on the page, not coat it.
      field *= smoothstep(0.06, 0.54, uv.y);
      field *= smoothstep(-0.18, 0.46, uv.x);
      field *= u_intro;
      field = clamp(field, 0.0, 1.0);

      // Ordered dither at a fixed print pitch.
      float pitch = max(u_res.y / 128.0, 3.4);
      vec2  cell  = floor(gl_FragCoord.xy / pitch);
      float thresh = bayer4(cell);

      // Two-level screen: a sparse ground and a denser core, so the field has
      // tonal steps like a real halftone rather than one flat cutoff.
      float dotA = step(thresh, field * 0.70);
      float dotB = step(thresh, field * field * 1.05);
      float ink  = clamp(dotA * 0.5 + dotB * 0.62, 0.0, 1.0);

      // Keep the dot from filling its cell — the paper must stay visible.
      vec2 sub = fract(gl_FragCoord.xy / pitch) - 0.5;
      float shape = 1.0 - smoothstep(0.30, 0.46, length(sub));
      ink *= shape;

      vec3 tone = mix(INK, BRIGHT, clamp(field * 1.25, 0.0, 1.0));
      float alpha = ink * 0.40;

      gl_FragColor = vec4(tone, alpha);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("[field]", gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aP = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(aP);
  gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const U = {
    res: gl.getUniformLocation(prog, "u_res"),
    time: gl.getUniformLocation(prog, "u_time"),
    ptr: gl.getUniformLocation(prog, "u_ptr"),
    ptrVel: gl.getUniformLocation(prog, "u_ptrVel"),
    energy: gl.getUniformLocation(prog, "u_energy"),
    intro: gl.getUniformLocation(prog, "u_intro"),
  };

  // Half-life damping keeps the feel identical at 60Hz and 144Hz.
  const damp = (cur, tgt, half, dt) => tgt + (cur - tgt) * Math.pow(2, -dt / half);

  let px = 0.5, py = 0.7, pxT = 0.5, pyT = 0.7;
  let vx = 0, vy = 0;
  let energy = 0, energyT = 0;
  let intro = 0;
  let visible = true;
  let raf = null;
  let last = performance.now();
  const t0 = last;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;

    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    resize();

    const prevX = px, prevY = py;
    px = damp(px, pxT, 0.11, dt);
    py = damp(py, pyT, 0.11, dt);
    vx = damp(vx, (px - prevX) / Math.max(dt, 0.001) * 0.09, 0.14, dt);
    vy = damp(vy, (py - prevY) / Math.max(dt, 0.001) * 0.09, 0.14, dt);

    energyT *= 0.93;
    energy = damp(energy, energyT, 0.28, dt);
    intro = damp(intro, 1, 0.5, dt);

    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, (now - t0) / 1000);
    gl.uniform2f(U.ptr, px, py);
    gl.uniform2f(U.ptrVel, vx, vy);
    gl.uniform1f(U.energy, energy);
    gl.uniform1f(U.intro, intro);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  window.addEventListener(
    "pointermove",
    (e) => {
      const r = canvas.getBoundingClientRect();
      if (r.height <= 0) return;
      pxT = (e.clientX - r.left) / r.width;
      pyT = 1 - (e.clientY - r.top) / r.height;
      energyT = 1;
    },
    { passive: true },
  );

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 })
      .observe(canvas);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf);
      raf = null;
    } else if (!document.hidden && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });

  raf = requestAnimationFrame(frame);
})();
