/* Atlas — living field
 *
 * A regular halftone lattice that breathes and answers the cursor.
 *
 * Every design choice here serves "meditative" over "impressive":
 *
 *  - REGULAR GRID. Dots sit on an even pitch, never jittered. Irregular
 *    scatter reads as noise; a lattice reads as order, and order is what lets
 *    slow movement feel calm instead of restless.
 *
 *  - SYMMETRY. The wave field is built from cos() of the distance from centre
 *    on each axis, so it is mirrored left/right and top/bottom by
 *    construction. The pattern is always balanced no matter where it is in
 *    its cycle.
 *
 *  - SLOW, IRRATIONAL PERIODS. The two wave systems drift at rates that never
 *    divide evenly, so the field never visibly loops, but each individual
 *    motion is slow enough (30–40s) to read as breathing.
 *
 *  - THE CURSOR IS A TIDE, NOT A SPOTLIGHT. A wide gaussian swell with a long
 *    falloff, damped so it trails the pointer and keeps moving after it
 *    stops. No hard edge, no bright disc.
 *
 * Canvas 2D rather than WebGL: a few thousand circles is cheap, the dots stay
 * crisp at any DPR, and there is no shader to fail. Same-origin, no
 * dependencies, so the strict CSP is untouched.
 */
(() => {
  const canvas = document.querySelector("[data-field]");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Geometry
  const PITCH = 25;        // css px between dots
  const R_MIN = 0.5;       // resting radius
  const R_MAX = 4.6;       // fully open
  const INK = [20, 84, 61];        // --brand-deep
  const INK_LIVE = [64, 150, 106]; // slightly brighter where the field opens

  // Pointer state, damped so the swell lags and settles
  let ptrX = 0.5, ptrY = 0.45;
  let tgtX = 0.5, tgtY = 0.45;
  let energy = 0, energyT = 0;

  let w = 0, h = 0, dpr = 1;
  let cols = 0, rows = 0, offX = 0, offY = 0;
  let raf = null;
  let visible = true;
  let last = performance.now();
  const t0 = last;

  const damp = (cur, tgt, half, dt) => tgt + (cur - tgt) * Math.pow(2, -dt / half);

  // Pushes a 0..1 value toward its extremes. Without this the lattice reads as
  // a flat grid of near-identical dots and the breathing is invisible.
  function contrast(v, lo, hi) {
    const t = (v - lo) / (hi - lo);
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t * t * (3 - 2 * t);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw === 0 || ch === 0) return false;
    if (w !== cw || h !== ch) {
      w = cw;
      h = ch;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Centre the lattice so the grid itself is symmetric in the viewport,
      // not just the wave riding on it.
      cols = Math.ceil(w / PITCH) + 2;
      rows = Math.ceil(h / PITCH) + 2;
      offX = (w - (cols - 1) * PITCH) / 2;
      offY = (h - (rows - 1) * PITCH) / 2;
    }
    return true;
  }

  function draw(now) {
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const halfW = w / 2 || 1;
    const halfH = h / 2 || 1;

    // Two mirrored wave systems, drifting at rates that don't share a period.
    const p1 = t * 0.031;
    const p2 = t * 0.019;
    const breath = 0.5 + 0.5 * Math.sin(t * 0.16);

    const pxAbs = ptrX * w;
    const pyAbs = ptrY * h;
    const reach = Math.min(w, h) * 0.42;
    const reach2 = reach * reach;

    for (let j = 0; j < rows; j++) {
      const y = offY + j * PITCH;
      const ny = (y - cy) / halfH;

      for (let i = 0; i < cols; i++) {
        const x = offX + i * PITCH;
        const nx = (x - cx) / halfW;

        // cos() of a centred coordinate is even, so the field is mirrored
        // about both axes for free — symmetry by construction.
        const a = Math.cos(nx * 3.4 + Math.sin(p1) * 2.1);
        const b = Math.cos(ny * 2.7 + Math.sin(p2) * 1.6);
        let v = (a * b) * 0.5 + 0.5;              // 0..1, symmetric

        // A second, coarser mirrored system keeps it from reading as plaid.
        const c = Math.cos((nx * nx + ny * ny) * 2.4 - t * 0.13);
        v = v * 0.64 + (c * 0.5 + 0.5) * 0.36;

        // Widen the range so the swell is actually legible as movement.
        v = contrast(v, 0.16, 0.94);

        // Breathe the whole field very slowly.
        v *= 0.62 + breath * 0.38;

        // Pointer tide: wide gaussian, no hard edge.
        const dx = x - pxAbs;
        const dy = (y - pyAbs) * 1.15;            // slightly flatter than round
        const d2 = dx * dx + dy * dy;
        const tide = energy * Math.exp(-d2 / reach2 * 2.2);
        v += tide * 0.85;

        if (v <= 0.02) continue;
        v = v > 1 ? 1 : v;

        const r = R_MIN + (R_MAX - R_MIN) * Math.pow(v, 1.35);
        const mix = v * v;
        const cr = INK[0] + (INK_LIVE[0] - INK[0]) * mix;
        const cg = INK[1] + (INK_LIVE[1] - INK[1]) * mix;
        const cb = INK[2] + (INK_LIVE[2] - INK[2]) * mix;

        ctx.fillStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${(0.07 + v * 0.62).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.283185307179586);
        ctx.fill();
      }
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    if (!resize()) return;

    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    ptrX = damp(ptrX, tgtX, 0.16, dt);
    ptrY = damp(ptrY, tgtY, 0.16, dt);
    energyT *= 0.965;                    // long tail — the tide recedes slowly
    energy = damp(energy, energyT, 0.42, dt);

    draw(now);
  }

  function still() {
    // Reduced motion: one calm, fully symmetric frame. No animation loop.
    if (!resize()) return;
    energy = 0;
    draw(t0);
  }

  window.addEventListener(
    "pointermove",
    (e) => {
      const r = canvas.getBoundingClientRect();
      if (r.height <= 0) return;
      tgtX = (e.clientX - r.left) / r.width;
      tgtY = (e.clientY - r.top) / r.height;
      energyT = 1;
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    w = 0;
    if (reduced.matches) still();
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 })
      .observe(canvas);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf);
      raf = null;
    } else if (!document.hidden && !raf && !reduced.matches) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });

  function start() {
    if (reduced.matches) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      requestAnimationFrame(still);
    } else if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  reduced.addEventListener("change", start);
  start();
})();
