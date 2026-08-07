/* Atlas — the field
 *
 * Inks, thrown on the page.
 *
 * A handful of ink pools — different pigments, different weights — are
 * thrown onto the hero and left alone. They drift with the viscosity of
 * ink on wet paper. When two pools touch they stick, and their colors
 * seep into each other where they join; stay together long enough and
 * they become one new color. The pointer is not a magnet and not a
 * repeller — it is a blade. Drag it through a pool and the pool cleaves,
 * the pieces sliding to either side of the stroke, each carrying its
 * pigment somewhere new. There is no pattern and no home position.
 * It simply plays out.
 *
 * Design notes, so future edits keep the temperament:
 *
 *  - THROWN, NOT ARRANGED. Positions are random within a composition
 *    bias: heavier pools land in the open right, small drops near the
 *    words. After the throw, physics owns everything.
 *
 *  - MIXING IS THE REWARD. Color lives per particle and diffuses on
 *    contact; the renderer blends pigment continuously across every
 *    neck and merge, so new colors appear exactly where ink meets ink.
 *
 *  - THE BLADE, NOT THE WIND. Cursor influence exists only while the
 *    cursor crosses a pool, splitting it along the direction of travel.
 *    No force fields, no fleeing.
 *
 *  - WORDS STAY DRY. The headline block is measured from the DOM and
 *    kept as a soft dry zone: ink that drifts in is nudged back out —
 *    at any viewport size.
 *
 *  - THE BORDER IS LAW. Nothing crosses the instrument edge.
 *
 * Rendering: two-pass metaballs (gaussian splats accumulated to an
 * offscreen field, then thresholded), with pigment carried as weighted
 * color so overlapping inks blend. Plain WebGL1, no dependencies, CSP
 * untouched. Reduced motion: one still frame. No WebGL: quiet Canvas2D
 * pools without fusion. No canvas at all: clean paper.
 */
(() => {
  "use strict";

  const canvas = document.querySelector("[data-field]");
  if (!canvas) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ── tuning ─────────────────────────────────────────────────────── */
  const DRIFT = 26; // px/s^2 wander, divided by mass — pools breathe
  const DRAG = 3.6; // s^-1 — the crisp settle of the first ink
  const POOL_K = 12.5; // s^-2, pull toward the pool's own centroid
  const HOME_K = 0.8; // s^-2, the tide that carries pools back to their
  // thrown positions — imperceptible in the moment, inevitable after.
  // this is what keeps the page full no matter how hard it was played.
  const TENSION = 220; // px/s^2 pull when different pools touch
  const CROWD = 560; // px/s^2 push when ink over-stacks
  const DIFFUSE = 1.15; // 1/s pigment exchange while touching
  const PUSH = 6200; // px/s^2 — the pointer breaks a pool apart
  const REACH = 150; // px, pointer influence radius
  const TAU_ENERGY = 0.9; // s, pointer energy decay
  const DRY = 420; // px/s^2 nudge out of the words' dry zone
  const T = 0.5; // field threshold where ink begins

  // Pigments: one family of ink weights, nature hues held close in
  // value so any mixture still reads as ink on this paper. Pine leads;
  // the rest visit.
  const PIGMENTS = [
    [0.078, 0.329, 0.239], // pine
    [0.078, 0.329, 0.239], // pine (dominant)
    [0.153, 0.371, 0.42], // sea blue
    [0.322, 0.416, 0.204], // moss
    [0.634, 0.373, 0.222], // clay
    [0.039, 0.122, 0.098], // deep ink
    [0.227, 0.353, 0.471], // slate
    [0.42, 0.29, 0.408], // plum
    [0.588, 0.475, 0.227], // ochre
    [0.561, 0.302, 0.333], // rose
    [0.29, 0.329, 0.533], // indigo
  ];

  /* ── state ──────────────────────────────────────────────────────── */
  let parts = []; // free ink particles
  let poolCount = 0;
  let homeX = new Float64Array(0), // where each pool was thrown
    homeY = new Float64Array(0);
  let w = 0,
    h = 0,
    dpr = 1;
  let wallX = 1e6;
  let dry = null; // {x0,y0,x1,y1} the words' zone, in canvas space

  const hash = (n) => {
    const s = Math.sin(n) * 43758.5453123;
    return s - Math.floor(s);
  };

  function measureZones() {
    wallX = 1e6;
    const rail = document.querySelector(".rail");
    if (rail) {
      const r = rail.getBoundingClientRect();
      if (r.width > 0) wallX = r.right - 72; // clear of ticks and the head
    }
    dry = null;
    const c = canvas.getBoundingClientRect();
    if (c.height <= 0) return;
    // the dry zone is the words themselves, never their containers —
    // a full-width flex row would claim the whole page as dry
    const els = document.querySelectorAll(
      ".hero h1, .hero .hero-sub, .hero .hero-cta .button",
    );
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const b = {
        x0: r.left - c.left - 24,
        y0: r.top - c.top - 24,
        x1: r.right - c.left + 24,
        y1: r.bottom - c.top + 24,
      };
      if (!dry) dry = b;
      else {
        dry.x0 = Math.min(dry.x0, b.x0);
        dry.y0 = Math.min(dry.y0, b.y0);
        dry.x1 = Math.max(dry.x1, b.x1);
        dry.y1 = Math.max(dry.y1, b.y1);
      }
    });
  }

  function throwInk() {
    parts = [];
    poolCount = 0;
    measureZones();
    const limX = Math.min(w, wallX) - 44;
    const scale = Math.min(1, limX / 1400) * Math.min(1, h / 900);
    const placed = []; // {x,y,R} for spacing

    // The population, in the spirit of the first single ink mass:
    // a few LARGE slow pools own the open space, mediums keep them
    // company, small drops are scattered everywhere they may go, and a
    // band of playable mediums lines the bottom.
    const classes = [
      { n: Math.max(1, Math.round(3.2 * scale)), lo: 78, hi: 126, open: 0.3, apart: 320 },
      { n: Math.max(4, Math.round(10 * scale)), lo: 36, hi: 62, open: 0.1, apart: 156 },
      { n: Math.max(10, Math.round(22 * scale)), lo: 10, hi: 26, open: 0, apart: 64 },
      { n: Math.max(4, Math.round(8 * scale)), lo: 4.5, hi: 8, open: -1, apart: 44 },
      { n: Math.max(3, Math.round(5 * scale)), lo: 30, hi: 46, open: -1, apart: 190, band: true },
    ];

    let i = 0;
    for (let ci = 0; ci < classes.length; ci++) {
      const C = classes[ci];
      let made = 0;
      let tries = 0;
      while (made < C.n && tries < C.n * 60) {
        tries++;
        i++;
        const h1 = hash(i * 127.1);
        const h2 = hash(i * 311.7);
        const h3 = hash(i * 74.7);

        const R = C.lo + h3 * (C.hi - C.lo);
        const x = 40 + R + h1 * (limX - 80 - R * 2);
        const y = C.band
          ? h * 0.86 + h2 * (h * 0.14 - R - 20)
          : 40 + R + h2 * (h - 80 - R * 2);

        const pad = C.open < 0 ? 14 : 30 + R * 0.5;
        const inDry =
          dry &&
          x > dry.x0 - pad &&
          x < dry.x1 + pad &&
          y > dry.y0 - pad &&
          y < dry.y1 + pad;
        if (inDry && C.open >= 0) continue; // only the tiniest may visit
        if (y < 96 + R && ci < 2) continue;

        const openness = dry
          ? Math.min(1, Math.max(0, (x - dry.x1) / (limX - dry.x1 + 1)))
          : Math.min(1, x / limX);
        if (openness < C.open) continue;

        // breathing room between pools of a class
        let crowded = false;
        for (let q = 0; q < placed.length; q++) {
          const dx = placed[q].x - x;
          const dy = placed[q].y - y;
          const need = Math.max(C.apart, (placed[q].R + R) * 1.35);
          if (dx * dx + dy * dy < need * need) {
            crowded = true;
            break;
          }
        }
        if (crowded) continue;
        placed.push({ x, y, R });

        // a pool is several free particles born AT their tension
        // equilibrium — a ring around a heart — so a pool wakes calm,
        // already one body. tension holds it; a blade says otherwise.
        // large pools carry more particles so their edge can undulate.
        const k = Math.max(1, Math.min(7, Math.round(R / 16)));
        const pig = PIGMENTS[(hash(i * 91.3) * PIGMENTS.length) | 0];
        const pr = (R / Math.sqrt(k)) * 1.14;
        const ringN = k > 4 ? k - 1 : k;
        const ringR = k > 4 ? R * 0.5 : k > 1 ? R * 0.32 : 0;
        const a0 = hash(i * 63.5) * 6.28318;
        const pid = poolCount++;
        for (let p = 0; p < k; p++) {
          const onRing = !(k > 4 && p === 0);
          const a = a0 + (p / Math.max(1, ringN)) * 6.28318;
          const d = onRing ? ringR : 0;
          parts.push({
            x: x + Math.cos(a) * d,
            y: y + Math.sin(a) * d,
            vx: (hash(i * 3.1 + p) - 0.5) * 8,
            vy: (hash(i * 5.7 + p) - 0.5) * 8,
            r: pr * (0.88 + hash(i * 6.7 + p) * 0.24),
            m: Math.max(0.55, (pr * pr) / 500), // mass: pools are slow
            cr: pig[0],
            cg: pig[1],
            cb: pig[2],
            ph: hash(i * 12.9 + p) * 6.28318,
            w1: 0.05 + hash(i * 1.7 + p) * 0.08,
            pid: pid, // which pool this piece belongs to
            cool: -10, // last time the pointer broke this piece
            castJ: -1, // where a cast-off piece is headed
            castT: 0,
          });
        }
        made++;
      }
    }

    homeX = new Float64Array(poolCount);
    homeY = new Float64Array(poolCount);
    for (let q = 0, pi = 0; q < placed.length && pi < poolCount; q++, pi++) {
      homeX[pi] = placed[q].x;
      homeY[pi] = placed[q].y;
    }
  }

  /* ── physics ────────────────────────────────────────────────────── */
  let ptrX = -1e4,
    ptrY = -1e4,
    tgtX = -1e4,
    tgtY = -1e4;
  let energy = 0;
  let havePtr = false;

  const damp = (cur, tgt, half, dt) =>
    tgt + (cur - tgt) * Math.pow(2, -dt / half);

  const grid = new Map();
  let pcx = new Float64Array(0),
    pcy = new Float64Array(0),
    pcn = new Float64Array(0);

  // OKLab in, OKLab out — pigment trades hands in a perceptual space so
  // mixtures stay alive instead of graying out (the practical middle
  // ground short of full Kubelka-Munk pigment simulation).
  const OK1 = [0, 0, 0];
  const OK2 = [0, 0, 0];
  const RGB1 = [0, 0, 0];
  function rgb2ok(r, g, b, out) {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    out[0] = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    out[1] = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    out[2] = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  }
  function ok2rgb(L, a, b, out) {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    out[0] = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    out[1] = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    out[2] = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  }
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  function step(t, dt) {
    // neighbor grid
    grid.clear();
    const CS = 84;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const key = ((p.x / CS) | 0) * 100003 + ((p.y / CS) | 0);
      const list = grid.get(key);
      if (list) list.push(i);
      else grid.set(key, [i]);
    }

    // each pool's living centroid — the "home" that broken pieces
    // return to is wherever the rest of their pool is now
    if (pcx.length < poolCount) {
      pcx = new Float64Array(poolCount);
      pcy = new Float64Array(poolCount);
      pcn = new Float64Array(poolCount);
    }
    pcx.fill(0);
    pcy.fill(0);
    pcn.fill(0);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p.castT > 0) continue; // deserters don't drag the pool along
      pcx[p.pid] += p.x;
      pcy[p.pid] += p.y;
      pcn[p.pid]++;
    }

    const R2 = REACH * REACH;

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];

      // wander: ink never quite sits still — but heavy pools only
      // breathe, they do not travel
      let ax = (Math.cos(p.ph + t * p.w1 * 6.28318) * DRIFT) / p.m;
      let ay = (Math.sin(p.ph * 1.7 + t * p.w1 * 5.1) * DRIFT) / p.m;

      // the pool re-forms: every piece is drawn back to wherever its
      // pool is now. This is what makes a break heal — the gesture of
      // the very first ink.
      if (p.castT <= 0 && pcn[p.pid] > 0) {
        ax += (pcx[p.pid] / pcn[p.pid] - p.x) * POOL_K;
        ay += (pcy[p.pid] / pcn[p.pid] - p.y) * POOL_K;
        // and the tide: pools remember where they were thrown, and
        // drift back once the hand moves on — the page refills itself
        ax += (homeX[p.pid] - p.x) * HOME_K;
        ay += (homeY[p.pid] - p.y) * HOME_K;
      }

      // neighbors: different pools stick when touching, all ink refuses
      // to over-stack, and pigment trades across every contact
      const cx = (p.x / CS) | 0;
      const cy = (p.y / CS) | 0;
      for (let gx = cx - 1; gx <= cx + 1; gx++) {
        for (let gy = cy - 1; gy <= cy + 1; gy++) {
          const list = grid.get(gx * 100003 + gy);
          if (!list) continue;
          for (let n = 0; n < list.length; n++) {
            const j = list[n];
            if (j <= i) continue;
            const q = parts[j];
            const dx = q.x - p.x;
            const dy = q.y - p.y;
            const d2 = dx * dx + dy * dy;
            const R = p.r + q.r;
            if (d2 > R * R * 1.69 || d2 < 0.01) continue;
            const d = Math.sqrt(d2);
            const ux = dx / d;
            const uy = dy / d;
            if (d < R * 0.34) {
              // ink is incompressible past a point
              const f = CROWD * (1 - d / (R * 0.34));
              ax -= (ux * f) / p.m;
              ay -= (uy * f) / p.m;
              parts[j].vx += (ux * f * dt) / q.m;
              parts[j].vy += (uy * f * dt) / q.m;
            } else if (p.pid !== q.pid && d > R * 0.5 && d < R * 1.3) {
              // surface tension between different pools: touch, and you
              // are being pulled into one body
              const f = TENSION * (1 - (d - R * 0.5) / (R * 0.8));
              ax += (ux * f) / p.m;
              ay += (uy * f) / p.m;
              parts[j].vx -= (ux * f * dt) / q.m;
              parts[j].vy -= (uy * f * dt) / q.m;
            }
            if (d < R) {
              // pigment seeps across the contact — but only to a point:
              // once two inks are nearly matched they keep the last of
              // their own character
              const dr = q.cr - p.cr;
              const dg = q.cg - p.cg;
              const db = q.cb - p.cb;
              if (dr * dr + dg * dg + db * db > 0.006) {
                const mAmt = Math.min(0.4, DIFFUSE * (1 - d / R) * dt);
                const wr = (q.r * q.r) / (p.r * p.r + q.r * q.r);
                rgb2ok(p.cr, p.cg, p.cb, OK1);
                rgb2ok(q.cr, q.cg, q.cb, OK2);
                for (let c3 = 0; c3 < 3; c3++) {
                  const dd = OK2[c3] - OK1[c3];
                  OK1[c3] += dd * mAmt * wr * 2;
                  OK2[c3] -= dd * mAmt * (1 - wr) * 2;
                }
                ok2rgb(OK1[0], OK1[1], OK1[2], RGB1);
                p.cr = clamp01(RGB1[0]);
                p.cg = clamp01(RGB1[1]);
                p.cb = clamp01(RGB1[2]);
                ok2rgb(OK2[0], OK2[1], OK2[2], RGB1);
                q.cr = clamp01(RGB1[0]);
                q.cg = clamp01(RGB1[1]);
                q.cb = clamp01(RGB1[2]);
              }
            }
          }
        }
      }

      // the pointer breaks pools apart, exactly as the first ink did:
      // a wide, damped shove that splits a body into lobes the pool
      // spring then gathers home. While strongly hit, a piece may
      // decide — once — to defect instead: it picks the nearest ink on
      // the far side of the shove, drifts over, and melts in.
      if (havePtr && energy > 0.02) {
        const rx = p.x - ptrX;
        const ry = p.y - ptrY;
        const rd2 = rx * rx + ry * ry;
        if (rd2 < R2 * 9) {
          const gN = energy * Math.exp(-rd2 / R2);
          const inv = 1 / Math.sqrt(rd2 + 1);
          ax += rx * inv * gN * PUSH;
          ay += ry * inv * gN * PUSH;

          if (gN > 0.5 && t - p.cool > 1.6 && pcn[p.pid] > 2) {
            // only pools with pieces to spare may lose one — no pool
            // ever empties its corner of the page
            p.cool = t;
            if (hash(i * 41.7 + t) < 0.36) {
              let best = -1;
              let bestD = 1e12;
              for (let j = 0; j < parts.length; j++) {
                if (j === i) continue;
                const o = parts[j];
                if (o.pid === p.pid) continue; // family is not a destination
                const ddx = o.x - p.x;
                const ddy = o.y - p.y;
                if (ddx * rx + ddy * ry < 0) continue; // not through the pointer
                const dd = ddx * ddx + ddy * ddy;
                if (dd < 4900) continue;
                if (dd < bestD) {
                  bestD = dd;
                  best = j;
                }
              }
              if (best >= 0 && bestD < 460 * 460) {
                p.castJ = best;
                p.castT = 2.8;
              }
            }
          }
        }
      }

      // a cast-off piece drifts to its chosen pool, melts in, and from
      // then on belongs to it
      if (p.castT > 0) {
        p.castT -= dt;
        const q2 = parts[p.castJ];
        if (q2) {
          const dx2 = q2.x - p.x;
          const dy2 = q2.y - p.y;
          const dd2c = Math.sqrt(dx2 * dx2 + dy2 * dy2) + 1;
          if (dd2c < (p.r + q2.r) * 0.7 || p.castT <= 0) {
            p.castT = 0;
            p.pid = q2.pid; // adopted
          } else {
            const pull = 300 / p.m;
            ax += (dx2 / dd2c) * pull;
            ay += (dy2 / dd2c) * pull;
          }
        } else {
          p.castT = 0;
        }
      }

      // the words stay dry
      if (dry && p.x > dry.x0 && p.x < dry.x1 && p.y > dry.y0 && p.y < dry.y1) {
        const dl = p.x - dry.x0;
        const drr = dry.x1 - p.x;
        const dt2 = p.y - dry.y0;
        const db = dry.y1 - p.y;
        const m = Math.min(dl, drr, dt2, db);
        if (m === dl) ax -= DRY;
        else if (m === drr) ax += DRY;
        else if (m === dt2) ay -= DRY;
        else ay += DRY;
      }

      const k = Math.exp(-dt * DRAG);
      p.vx = (p.vx + ax * dt) * k;
      p.vy = (p.vy + ay * dt) * k;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > 260) {
        p.vx *= 260 / sp;
        p.vy *= 260 / sp;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // soft walls: the page holds its ink
      const L = 26,
        Rt = Math.min(w - 26, wallX - 30),
        Tp = 22,
        B = h - 20;
      if (p.x < L) p.vx += (L - p.x) * 6 * dt;
      if (p.x > Rt) p.vx -= (p.x - Rt) * 6 * dt;
      if (p.y < Tp) p.vy += (Tp - p.y) * 6 * dt;
      if (p.y > B) p.vy -= (p.y - B) * 6 * dt;
    }
  }

  /* ── webgl two-pass renderer, pigment-aware ─────────────────────── */
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "low-power",
  });

  let glOK = false;
  let progSplat = null,
    progInk = null,
    quadBuf = null,
    splatBuf = null,
    fbo = null,
    fboTex = null,
    fw = 0,
    fh = 0;
  let uSplatRes = null,
    uSplatGain = null,
    uInkTex = null,
    uInkT = null;
  let locPos = -1,
    locLoc = -1,
    locCol = -1,
    locClip = -1;
  let splatData = null;
  let texType = 0;
  let gain = 1;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  function program(vs, fs) {
    const v = shader(gl.VERTEX_SHADER, vs);
    const f = shader(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }

  function initGL() {
    if (!gl) return false;

    progSplat = program(
      [
        "attribute vec2 aPos;",
        "attribute vec2 aLocal;",
        "attribute vec3 aCol;",
        "uniform vec2 uRes;",
        "varying vec2 vLocal;",
        "varying vec3 vCol;",
        "void main(){",
        "  vLocal = aLocal;",
        "  vCol = aCol;",
        "  vec2 clip = (aPos / uRes) * 2.0 - 1.0;",
        "  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);",
        "}",
      ].join("\n"),
      [
        "precision mediump float;",
        "varying vec2 vLocal;",
        "varying vec3 vCol;",
        "uniform float uGain;",
        "void main(){",
        "  float g = exp(-dot(vLocal, vLocal)) * uGain;",
        "  gl_FragColor = vec4(vCol * g, g);",
        "}",
      ].join("\n"),
    );

    progInk = program(
      [
        "attribute vec2 aClip;",
        "varying vec2 vUV;",
        "void main(){",
        "  vUV = aClip * 0.5 + 0.5;",
        "  gl_Position = vec4(aClip, 0.0, 1.0);",
        "}",
      ].join("\n"),
      [
        "precision mediump float;",
        "varying vec2 vUV;",
        "uniform sampler2D uTex;",
        "uniform float uT;",
        "void main(){",
        "  vec4 s = texture2D(uTex, vUV);",
        "  float f = s.a;",
        "  float aa = uT * 0.09;",
        "  float a = smoothstep(uT - aa, uT + aa, f) * 0.96;",
        "  vec3 col = s.rgb / max(f, 0.0001);",
        "  gl_FragColor = vec4(col * a, a);",
        "}",
      ].join("\n"),
    );

    if (!progSplat || !progInk) return false;

    quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    splatBuf = gl.createBuffer();

    uSplatRes = gl.getUniformLocation(progSplat, "uRes");
    uSplatGain = gl.getUniformLocation(progSplat, "uGain");
    uInkTex = gl.getUniformLocation(progInk, "uTex");
    uInkT = gl.getUniformLocation(progInk, "uT");
    locPos = gl.getAttribLocation(progSplat, "aPos");
    locLoc = gl.getAttribLocation(progSplat, "aLocal");
    locCol = gl.getAttribLocation(progSplat, "aCol");
    locClip = gl.getAttribLocation(progInk, "aClip");

    fbo = gl.createFramebuffer();
    fboTex = gl.createTexture();

    // The field must hold many stacked splats without clamping, or deep
    // ink washes toward white. Prefer a half-float buffer; fall back to
    // 8-bit with the whole field scaled into its headroom.
    const hf = gl.getExtension("OES_texture_half_float");
    const hfl = gl.getExtension("OES_texture_half_float_linear");
    gl.getExtension("EXT_color_buffer_half_float");
    if (hf && hfl) {
      texType = hf.HALF_FLOAT_OES;
      gain = 1;
    } else {
      texType = gl.UNSIGNED_BYTE;
      gain = 0.13;
    }

    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      glOK = false;
      stopLoop();
    });

    return true;
  }

  function sizeGL() {
    fw = Math.max(2, Math.floor(w));
    fh = Math.max(2, Math.floor(h));
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fw, fh, 0, gl.RGBA, texType, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      fboTex,
      0,
    );
    // if the half-float attachment is not renderable here, drop to 8-bit
    if (
      texType !== gl.UNSIGNED_BYTE &&
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE
    ) {
      texType = gl.UNSIGNED_BYTE;
      gain = 0.13;
      gl.bindTexture(gl.TEXTURE_2D, fboTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fw, fh, 0, gl.RGBA, texType, null);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        fboTex,
        0,
      );
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function renderGL() {
    const n = parts.length;
    const FLOATS = 6 * 7;
    if (!splatData || splatData.length < n * FLOATS) {
      splatData = new Float32Array(n * FLOATS);
    }
    let o = 0;
    for (let i = 0; i < n; i++) {
      const p = parts[i];
      const s = p.r * 3.0;
      const x0 = p.x - s,
        x1 = p.x + s,
        y0 = p.y - s,
        y1 = p.y + s;
      const cr = p.cr,
        cg = p.cg,
        cb = p.cb;
      // prettier-ignore
      {
        splatData[o++]=x0; splatData[o++]=y0; splatData[o++]=-3; splatData[o++]=-3; splatData[o++]=cr; splatData[o++]=cg; splatData[o++]=cb;
        splatData[o++]=x1; splatData[o++]=y0; splatData[o++]=3;  splatData[o++]=-3; splatData[o++]=cr; splatData[o++]=cg; splatData[o++]=cb;
        splatData[o++]=x0; splatData[o++]=y1; splatData[o++]=-3; splatData[o++]=3;  splatData[o++]=cr; splatData[o++]=cg; splatData[o++]=cb;
        splatData[o++]=x1; splatData[o++]=y0; splatData[o++]=3;  splatData[o++]=-3; splatData[o++]=cr; splatData[o++]=cg; splatData[o++]=cb;
        splatData[o++]=x1; splatData[o++]=y1; splatData[o++]=3;  splatData[o++]=3;  splatData[o++]=cr; splatData[o++]=cg; splatData[o++]=cb;
        splatData[o++]=x0; splatData[o++]=y1; splatData[o++]=-3; splatData[o++]=3;  splatData[o++]=cr; splatData[o++]=cg; splatData[o++]=cb;
      }
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, fw, fh);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(progSplat);
    gl.uniform2f(uSplatRes, fw, fh);
    gl.uniform1f(uSplatGain, gain);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.bindBuffer(gl.ARRAY_BUFFER, splatBuf);
    gl.bufferData(gl.ARRAY_BUFFER, splatData.subarray(0, o), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(locPos);
    gl.enableVertexAttribArray(locLoc);
    gl.enableVertexAttribArray(locCol);
    gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 28, 0);
    gl.vertexAttribPointer(locLoc, 2, gl.FLOAT, false, 28, 8);
    gl.vertexAttribPointer(locCol, 3, gl.FLOAT, false, 28, 16);
    gl.drawArrays(gl.TRIANGLES, 0, o / 7);
    gl.disableVertexAttribArray(locLoc);
    gl.disableVertexAttribArray(locCol);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(progInk);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.uniform1i(uInkTex, 0);
    gl.uniform1f(uInkT, T * gain);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(locClip);
    gl.vertexAttribPointer(locClip, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* ── canvas2d fallback: still pools, no fusion ──────────────────── */
  let ctx2d = null;
  function render2D() {
    ctx2d.clearRect(0, 0, w, h);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      ctx2d.fillStyle =
        "rgba(" +
        ((p.cr * 255) | 0) +
        "," +
        ((p.cg * 255) | 0) +
        "," +
        ((p.cb * 255) | 0) +
        ",0.92)";
      ctx2d.beginPath();
      ctx2d.arc(p.x, p.y, p.r, 0, 6.283185307179586);
      ctx2d.fill();
    }
  }

  /* ── frame plumbing ─────────────────────────────────────────────── */
  let raf = null;
  let visible = true;
  let last = performance.now();
  const t0 = last;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw === 0 || ch === 0) return false;
    if (w !== cw || h !== ch) {
      w = cw;
      h = ch;
      canvas.width = Math.floor(w * (glOK ? dpr : 1));
      canvas.height = Math.floor(h * (glOK ? dpr : 1));
      if (glOK) sizeGL();
      throwInk();
    }
    return true;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    if (!resize()) return;

    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const t = (now - t0) / 1000;

    // the pointer trails its true position, and its energy — how much
    // it has moved lately — is what breaks ink. Rest disturbs nothing.
    ptrX = damp(ptrX, tgtX, 0.08, dt);
    ptrY = damp(ptrY, tgtY, 0.08, dt);
    energy *= Math.exp(-dt / TAU_ENERGY);

    step(t, dt);
    if (glOK) renderGL();
    else if (ctx2d) render2D();
  }

  function stillFrame() {
    if (!resize()) return;
    if (glOK) renderGL();
    else if (ctx2d) render2D();
  }

  function stopLoop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  /* ── inputs ─────────────────────────────────────────────────────── */
  window.addEventListener(
    "pointermove",
    (e) => {
      const r = canvas.getBoundingClientRect();
      if (r.height <= 0) return;
      tgtX = e.clientX - r.left;
      tgtY = e.clientY - r.top;
      if (!havePtr) {
        ptrX = tgtX;
        ptrY = tgtY;
      }
      havePtr = true;
      energy = Math.min(1, energy + 0.26);
    },
    { passive: true },
  );

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { threshold: 0 },
    ).observe(canvas);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLoop();
    } else if (!raf && !reduced.matches) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });

  window.addEventListener(
    "resize",
    () => {
      measureZones();
      if (reduced.matches) requestAnimationFrame(stillFrame);
    },
    { passive: true },
  );
  // the words settle as fonts arrive; the dry zone follows them and the
  // DRY nudge quietly corrects any ink caught inside
  window.addEventListener("load", measureZones, { once: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measureZones);
  }

  /* ── go ─────────────────────────────────────────────────────────── */
  glOK = initGL();
  if (!glOK) {
    ctx2d = canvas.getContext("2d", { alpha: true });
    if (!ctx2d) return; // clean paper it is
  }

  function start() {
    if (reduced.matches) {
      stopLoop();
      requestAnimationFrame(stillFrame);
    } else if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  reduced.addEventListener("change", start);
  start();
})();
