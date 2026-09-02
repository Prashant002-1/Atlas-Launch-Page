/* Atlas hero field
 *
 * A quiet 15-degree halftone surface with many small, chromatic ink droplets.
 * The print texture and round ink language stay intact. The droplets overlap
 * in ragged, map-like landmasses along the top and bottom without tracing a
 * literal map. A moving pointer skims the ink, carries momentum through each
 * fragment, then lets the field settle back into its irregular silhouette.
 *
 * The simulation is linear in particle count, pauses offscreen, renders at a
 * capped pixel ratio, and drops to 30fps while idle. Reduced motion gets one
 * still frame. WebGL renders the original pigment-aware halftone treatment;
 * Canvas2D keeps a quiet textured fallback.
 */
(() => {
  "use strict";

  const canvas = document.querySelector("[data-field]");
  if (!canvas) return;

  const hero = canvas.closest(".hero");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");

  const T = 0.34;
  const TAU = Math.PI * 2;
  const SPRING = 13.5;
  const DAMPING = 5.4;
  const POINTER_REACH = 118;
  const IDLE_FRAME_MS = 1000 / 30;
  const ACTIVE_FRAME_MS = 1000 / 60;

  const PIGMENTS = [
    [0.078, 0.329, 0.239],
    [0.153, 0.371, 0.42],
    [0.322, 0.416, 0.204],
    [0.634, 0.373, 0.222],
    [0.227, 0.353, 0.471],
    [0.42, 0.29, 0.408],
    [0.588, 0.475, 0.227],
    [0.561, 0.302, 0.333],
    [0.29, 0.329, 0.533],
    [0.12, 0.46, 0.38],
  ];

  let parts = [];
  let anchors = [];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let wallX = 0;
  let bandDepth = 0;
  let needsResize = true;

  let pointerX = -1000;
  let pointerY = -1000;
  let pointerVX = 0;
  let pointerVY = 0;
  let pointerEnergy = 0;
  let pointerBand = -1;
  let lastPointerX = -1000;
  let lastPointerY = -1000;
  let lastPointerAt = 0;
  let activeUntil = 0;

  const hash = (value) => {
    const result = Math.sin(value * 91.3458) * 47453.5453;
    return result - Math.floor(result);
  };

  const clamp = (value, minimum, maximum) =>
    Math.max(minimum, Math.min(maximum, value));

  function mixColor(a, b, amount) {
    return [
      a[0] + (b[0] - a[0]) * amount,
      a[1] + (b[1] - a[1]) * amount,
      a[2] + (b[2] - a[2]) * amount,
    ];
  }

  function measureField() {
    const rail = document.querySelector(".rail");
    const railRect = rail?.getBoundingClientRect();
    wallX =
      railRect && railRect.width > 0
        ? clamp(railRect.left - hero.getBoundingClientRect().left - 22, 180, w)
        : w;
    bandDepth = Math.min(245, Math.max(150, h * 0.235));
  }

  function createAnchors() {
    anchors = [];
    const massCount = clamp(Math.round(wallX / 300), 4, 5);
    const cellWidth = wallX / massCount;

    for (let band = 0; band < 2; band += 1) {
      for (let mass = 0; mass < massCount; mass += 1) {
        const seed = 41 + band * 131 + mass * 23;
        const centerX =
          (mass + 0.5) * cellWidth +
          (hash(seed * 1.7) - 0.5) * cellWidth * 0.32;
        const depth =
          38 + Math.pow(hash(seed * 3.1), 0.86) * Math.max(38, bandDepth - 92);
        const centerY = band === 0 ? depth : h - depth;
        const landWidth = cellWidth * (0.68 + hash(seed * 4.9) * 0.2);
        const lobes = 3 + Math.floor(hash(seed * 6.3) * 3);
        const bend = 12 + hash(seed * 7.7) * 18;
        const phase = hash(seed * 9.1) * TAU;
        const basePalette =
          (mass * 2 + band * 3 + Math.floor(hash(seed * 5.7) * 3)) %
          PIGMENTS.length;

        for (let lobe = 0; lobe < lobes; lobe += 1) {
          const lobeSeed = seed + lobe * 11.3;
          const t = lobes === 1 ? 0 : lobe / (lobes - 1) - 0.5;
          const x = clamp(
            centerX +
              t * landWidth +
              (hash(lobeSeed * 2.3) - 0.5) * 18,
            18,
            wallX - 18,
          );
          const contour =
            Math.sin((t + 0.5) * Math.PI * 1.7 + phase) * bend +
            (hash(lobeSeed * 3.7) - 0.5) * 18;
          const y =
            band === 0
              ? clamp(centerY + contour, 18, bandDepth - 18)
              : clamp(centerY - contour, h - bandDepth + 18, h - 18);
          const paletteIndex =
            (basePalette + (lobe % 3 === 0 ? 1 : 0)) % PIGMENTS.length;

          anchors.push({
            band,
            mass: band * massCount + mass,
            x,
            y,
            paletteIndex,
            color: PIGMENTS[paletteIndex],
            spreadX: 40 + hash(lobeSeed * 5.1) * 28,
            spreadY: 28 + hash(lobeSeed * 7.9) * 24,
            rotation: (hash(lobeSeed * 10.7) - 0.5) * 0.9,
          });
        }
      }
    }
  }

  function seedInk() {
    measureField();
    createAnchors();

    const density = coarsePointer.matches ? 0.78 : 1;
    const count = Math.max(
      120,
      Math.round(Math.min(420, wallX / 2.8) * density),
    );
    const bandAnchors = [
      anchors.filter((anchor) => anchor.band === 0),
      anchors.filter((anchor) => anchor.band === 1),
    ];

    parts = [];
    for (let index = 0; index < count; index += 1) {
      const band = index % 2;
      const clustered = hash(index * 17.1 + 2.4) < 0.97;
      const candidates = bandAnchors[band];
      const anchor =
        candidates[
          Math.min(
            candidates.length - 1,
            Math.floor(hash(index * 12.7 + 5.3) * candidates.length),
          )
        ];

      let x;
      let y;
      if (clustered) {
        const angle = hash(index * 8.9 + 3.6) * TAU;
        const edge =
          0.82 +
          Math.sin(angle * 3 + anchor.mass * 1.7) * 0.14 +
          Math.sin(angle * 7 + index * 0.31) * 0.08;
        const distance = Math.pow(hash(index * 4.7 + 7.1), 0.62) * edge;
        const localX = Math.cos(angle) * anchor.spreadX * distance;
        const localY = Math.sin(angle) * anchor.spreadY * distance;
        const cos = Math.cos(anchor.rotation);
        const sin = Math.sin(anchor.rotation);
        x = anchor.x + localX * cos - localY * sin;
        y = anchor.y + localX * sin + localY * cos;
      } else {
        x =
          anchor.x +
          (hash(index * 3.3 + 1.6) - 0.5) * anchor.spreadX * 3.1;
        y =
          anchor.y +
          (hash(index * 6.5 + 9.2) - 0.5) * anchor.spreadY * 2.7;
      }

      x = clamp(x, 12, wallX - 12);
      y =
        band === 0
          ? clamp(y, 12, bandDepth - 10)
          : clamp(y, h - bandDepth + 10, h - 12);

      const sizeSeed = hash(index * 21.3 + 4.2);
      const radius = 2.8 + Math.pow(sizeSeed, 2.35) * 4.8;
      const secondColor =
        PIGMENTS[
          (anchor.paletteIndex + 1 + (index % 3)) % PIGMENTS.length
        ];
      const color = mixColor(
        anchor.color,
        secondColor,
        0.08 + hash(index * 5.9) * 0.24,
      );

      parts.push({
        x,
        y,
        homeX: x,
        homeY: y,
        vx: 0,
        vy: 0,
        r: radius,
        cr: color[0],
        cg: color[1],
        cb: color[2],
        phase: hash(index * 14.3 + 8.5) * TAU,
        tempo: 0.72 + hash(index * 9.1 + 1.2) * 0.68,
        band,
        mass: anchor.mass,
      });
    }
  }

  function step(time, dt) {
    const drag = Math.exp(-DAMPING * dt);
    const pointerSpeed = Math.hypot(pointerVX, pointerVY);
    const reachSquared = POINTER_REACH * POINTER_REACH;

    parts.forEach((particle, index) => {
      const ambientX =
        Math.sin(time * 0.24 * particle.tempo + particle.phase) * 2.1 +
        Math.cos(time * 0.13 + particle.phase * 1.7) * 0.75;
      const ambientY =
        Math.cos(time * 0.2 * particle.tempo + particle.phase * 1.3) * 1.45;

      let ax = (particle.homeX + ambientX - particle.x) * SPRING;
      let ay = (particle.homeY + ambientY - particle.y) * SPRING;

      if (pointerBand === particle.band && pointerEnergy > 0.015) {
        const dx = particle.x - pointerX;
        const dy = particle.y - pointerY;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared > 0.01 && distanceSquared < reachSquared) {
          const distance = Math.sqrt(distanceSquared);
          const falloff = Math.pow(1 - distance / POINTER_REACH, 2);
          const nx = dx / distance;
          const ny = dy / distance;
          const side = index % 2 === 0 ? 1 : -1;
          const stroke = 1.55 + Math.min(1.1, pointerSpeed / 900);

          ax +=
            pointerVX * stroke * falloff * pointerEnergy +
            nx * 520 * falloff * pointerEnergy -
            ny * side * 260 * falloff * pointerEnergy;
          ay +=
            pointerVY * stroke * falloff * pointerEnergy +
            ny * 520 * falloff * pointerEnergy +
            nx * side * 260 * falloff * pointerEnergy;
        }
      }

      particle.vx = (particle.vx + ax * dt) * drag;
      particle.vy = (particle.vy + ay * dt) * drag;

      const speed = Math.hypot(particle.vx, particle.vy);
      if (speed > 310) {
        particle.vx *= 310 / speed;
        particle.vy *= 310 / speed;
      }

      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      const left = 8;
      const right = wallX - 8;
      const topInner = bandDepth + 22;
      const bottomInner = h - bandDepth - 22;

      if (particle.x < left) particle.vx += (left - particle.x) * 18 * dt;
      if (particle.x > right) particle.vx -= (particle.x - right) * 18 * dt;
      if (particle.band === 0 && particle.y > topInner) {
        particle.vy -= (particle.y - topInner) * 20 * dt;
      }
      if (particle.band === 1 && particle.y < bottomInner) {
        particle.vy += (bottomInner - particle.y) * 20 * dt;
      }
    });

    pointerEnergy *= Math.exp(-dt / 0.22);
    pointerVX *= Math.exp(-dt / 0.16);
    pointerVY *= Math.exp(-dt / 0.16);
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
    uInkT = null,
    uInkRes2 = null,
    uInkPx = null;
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
        "uniform vec2 uRes2;",
        "uniform float uPx;",
        "void main(){",
        "  float ca = 0.96593; float sa = 0.25882;", // 15° screen angle
        "  vec2 fp = vUV * uRes2;",
        "  vec2 q = mat2(ca, sa, -sa, ca) * fp;",
        "  vec2 cell = (floor(q / uPx) + 0.5) * uPx;",
        "  vec2 cp = mat2(ca, -sa, sa, ca) * cell;",
        "  vec4 s = texture2D(uTex, cp / uRes2);",
        "  float f = s.a;",
        "  float tone = clamp(f / (uT * 1.5), 0.0, 1.0);",
        // the whole surface is halftone: at rest every cell holds a
        // small neutral dot; where ink lives, the same dots swell and
        // take on its pigment — the surface emits the color
        "  float rd = clamp(uPx * 0.5 * sqrt(tone) * 1.42, uPx * 0.14, uPx * 0.42);",
        "  float d = length(fp - cp);",
        "  float a = 1.0 - smoothstep(rd - 1.2, rd + 1.2, d);",
        "  float ink = smoothstep(0.04, 0.42, tone);",
        "  vec3 pigment = s.rgb / max(f, 0.0001);",
        // muted: pigment stays in a quiet tonal family, never loud
        "  pigment = mix(pigment, vec3(0.675, 0.706, 0.682), 0.42);",
        "  vec3 col = mix(vec3(0.675, 0.706, 0.682), pigment, ink);",
        "  a *= mix(0.26, 0.54, ink);",
        // the surface dissolves before the page's edges — no hard cut
        "  float dp = uPx / 8.5;",
        "  a *= smoothstep(uRes2.y, uRes2.y - 130.0 * dp, fp.y);",
        "  a *= smoothstep(uRes2.x - 40.0 * dp, uRes2.x - 200.0 * dp, fp.x);",
        "  a *= smoothstep(0.0, 90.0 * dp, fp.y);",
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
    uInkRes2 = gl.getUniformLocation(progInk, "uRes2");
    uInkPx = gl.getUniformLocation(progInk, "uPx");
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
    gl.uniform2f(uInkRes2, canvas.width, canvas.height);
    gl.uniform1f(uInkPx, 8.5 * dpr);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(locClip);
    gl.vertexAttribPointer(locClip, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* ── canvas2d fallback ─────────────────────────────────────── */
  let ctx2d = null;
  function render2D() {
    ctx2d.clearRect(0, 0, w, h);

    const step = 8.5;
    const diagonal = Math.hypot(w, h);
    ctx2d.save();
    ctx2d.translate(w * 0.5, h * 0.5);
    ctx2d.rotate(Math.PI / 12);
    ctx2d.fillStyle = "rgba(135, 146, 139, 0.22)";
    for (let y = -diagonal; y <= diagonal; y += step) {
      for (let x = -diagonal; x <= diagonal; x += step) {
        ctx2d.beginPath();
        ctx2d.arc(x, y, 1.05, 0, Math.PI * 2);
        ctx2d.fill();
      }
    }
    ctx2d.restore();

    parts.forEach((particle) => {
      const red = Math.round(particle.cr * 255);
      const green = Math.round(particle.cg * 255);
      const blue = Math.round(particle.cb * 255);
      ctx2d.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.34)`;
      const dots = Math.max(2, Math.round(particle.r * 0.65));
      for (let index = 0; index < dots; index += 1) {
        const angle = particle.phase + index * 2.39996;
        const distance = Math.sqrt(index / dots) * particle.r;
        ctx2d.beginPath();
        ctx2d.arc(
          particle.x + Math.cos(angle) * distance,
          particle.y + Math.sin(angle) * distance,
          1.25 + particle.r * 0.075,
          0,
          Math.PI * 2,
        );
        ctx2d.fill();
      }
    });
  }

  /* ── frame plumbing ─────────────────────────────────────────────── */
  let raf = null;
  let visible = true;
  let lastFrame = performance.now();
  let lastRender = 0;

  function resize() {
    const nextW = canvas.clientWidth;
    const nextH = canvas.clientHeight;
    if (nextW <= 0 || nextH <= 0) return false;

    w = nextW;
    h = nextH;
    dpr = glOK
      ? Math.min(window.devicePixelRatio || 1, coarsePointer.matches ? 1 : 1.4)
      : 1;

    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    if (glOK) sizeGL();
    seedInk();
    needsResize = false;
    return true;
  }

  function render() {
    if (glOK) renderGL();
    else if (ctx2d) render2D();
  }

  function queueFrame() {
    if (!raf && visible && !document.hidden && !reduced.matches) {
      raf = requestAnimationFrame(frame);
    }
  }

  function frame(now) {
    raf = null;
    if (!visible || document.hidden || reduced.matches) return;
    if (needsResize && !resize()) return;

    const interval = now < activeUntil ? ACTIVE_FRAME_MS : IDLE_FRAME_MS;
    if (now - lastRender >= interval) {
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      lastRender = now;
      step(now / 1000, dt);
      render();
    }
    queueFrame();
  }

  function stillFrame() {
    if (needsResize && !resize()) return;
    render();
  }

  function stopLoop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      if (reduced.matches) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const now = performance.now();
      const elapsed = Math.max(16, now - lastPointerAt) / 1000;
      const inside =
        x >= 0 &&
        x <= wallX &&
        y >= 0 &&
        y <= h &&
        (y <= bandDepth + 34 || y >= h - bandDepth - 34);

      if (lastPointerAt > 0 && lastPointerX > -900) {
        const rawVX = (x - lastPointerX) / elapsed;
        const rawVY = (y - lastPointerY) / elapsed;
        pointerVX = pointerVX * 0.52 + rawVX * 0.48;
        pointerVY = pointerVY * 0.52 + rawVY * 0.48;
        pointerEnergy = inside
          ? Math.min(1, 0.18 + Math.hypot(rawVX, rawVY) / 940)
          : 0;
      }

      pointerX = x;
      pointerY = y;
      pointerBand = inside ? (y < h * 0.5 ? 0 : 1) : -1;
      lastPointerX = x;
      lastPointerY = y;
      lastPointerAt = now;
      activeUntil = now + 900;
      queueFrame();
    },
    { passive: true },
  );

  window.addEventListener(
    "resize",
    () => {
      needsResize = true;
      queueFrame();
      if (reduced.matches) requestAnimationFrame(stillFrame);
    },
    { passive: true },
  );

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          lastFrame = performance.now();
          queueFrame();
        } else {
          stopLoop();
        }
      },
      { threshold: 0 },
    ).observe(canvas);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopLoop();
    else {
      lastFrame = performance.now();
      queueFrame();
    }
  });

  reduced.addEventListener("change", () => {
    if (reduced.matches) {
      stopLoop();
      requestAnimationFrame(stillFrame);
    } else {
      lastFrame = performance.now();
      queueFrame();
    }
  });

  glOK = initGL();
  if (!glOK) {
    ctx2d = canvas.getContext("2d", { alpha: true });
    if (!ctx2d) return;
  }

  if (reduced.matches) requestAnimationFrame(stillFrame);
  else queueFrame();
})();
