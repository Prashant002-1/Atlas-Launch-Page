/* A small, low-power material current for the closing section.
 *
 * The hero owns the spectacle. This field stays cropped to the lower-right
 * edge and borrows only its printed texture: quiet pigment, broken contours,
 * and a very slight response when the pointer passes nearby.
 */
(() => {
  "use strict";

  const canvas = document.querySelector("[data-launch-field]");
  if (!canvas) return;

  const section = canvas.closest(".launch-world");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wideGamut =
    window.matchMedia("(color-gamut: p3)").matches &&
    window.CSS?.supports("color", "color(display-p3 1 0 0)");
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
    premultipliedAlpha: true,
  });

  if (!gl) {
    let context;
    try {
      context = canvas.getContext("2d", {
        colorSpace: wideGamut ? "display-p3" : "srgb",
      });
    } catch {
      context = canvas.getContext("2d");
    }
    if (!context) return;
    const displayP3 =
      wideGamut && context.getContextAttributes?.().colorSpace === "display-p3";
    canvas.dataset.colorSpace = displayP3 ? "display-p3" : "srgb";

    const drawFallback = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const colors = [
        displayP3 ? "color(display-p3 0.50 0.835 0.625)" : "#72d49a",
        "#93a99c",
        "#d2d8cf",
        "#876d5d",
      ];
      for (let index = 0; index < 150; index += 1) {
        const x = (((index * 47) % 151) / 151) * rect.width;
        const current =
          rect.height * 0.58 +
          Math.sin(x * 0.024 + index * 0.19) * rect.height * 0.13;
        const y = current + Math.sin(index * 1.83) * rect.height * 0.13;
        const distance = Math.abs(y - current) / (rect.height * 0.18);
        if (distance > 1) continue;

        context.save();
        context.translate(x, y);
        context.rotate(-0.22 + Math.sin(index * 0.71) * 0.18);
        context.fillStyle = colors[index % colors.length];
        context.globalAlpha = 0.12 + (1 - distance) * 0.24;
        context.fillRect(-2, -1, 4 + (index % 4), 2);
        context.restore();
      }
    };

    drawFallback();
    window.addEventListener("resize", drawFallback, { passive: true });
    return;
  }

  let displayP3 = false;
  if (wideGamut && "drawingBufferColorSpace" in gl) {
    try {
      gl.drawingBufferColorSpace = "display-p3";
      displayP3 = gl.drawingBufferColorSpace === "display-p3";
    } catch {
      // Keep the original renderer when P3 buffers are unavailable.
    }
  }
  canvas.dataset.colorSpace = displayP3 ? "display-p3" : "srgb";

  const vertexSource = `
    attribute vec2 a_position;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision mediump float;

    uniform vec2 u_resolution;
    uniform vec2 u_pointer;
    uniform float u_time;

    float hash(vec2 point) {
      point = fract(point * vec2(123.34, 456.21));
      point += dot(point, point + 45.32);
      return fract(point.x * point.y);
    }

    float noise(vec2 point) {
      vec2 cell = floor(point);
      vec2 local = fract(point);
      local = local * local * (3.0 - 2.0 * local);

      return mix(
        mix(hash(cell), hash(cell + vec2(1.0, 0.0)), local.x),
        mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0)), local.x),
        local.y
      );
    }

    float fieldNoise(vec2 point) {
      float value = 0.0;
      float weight = 0.55;
      for (int octave = 0; octave < 3; octave++) {
        value += noise(point) * weight;
        point = point * 2.03 + vec2(3.7, 1.9);
        weight *= 0.48;
      }
      return value;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      vec2 point = uv * 2.0 - 1.0;
      point.x *= u_resolution.x / u_resolution.y;

      if (u_pointer.x >= 0.0) {
        vec2 delta = uv - u_pointer;
        float distanceToPointer = length(delta);
        float influence = 1.0 - smoothstep(0.0, 0.31, distanceToPointer);
        point += normalize(delta + vec2(0.0001)) * influence * 0.045;
      }

      const float angle = -0.24;
      mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
      point = rotation * point;

      float drift = u_time * 0.025;
      float material = fieldNoise(point * 2.1 + vec2(drift, -drift * 0.35));
      float fine = noise(point * 6.4 + vec2(-drift * 1.4, drift));
      float current = point.y + sin(point.x * 2.4 + material * 2.1) * 0.13;
      float body = 1.0 - smoothstep(0.15, 0.48, abs(current + (material - 0.5) * 0.2));

      vec2 printCell = fract(gl_FragCoord.xy / 6.0) - 0.5;
      float dotShape = 1.0 - smoothstep(0.18, 0.43, length(printCell));
      float broken = smoothstep(0.22, 0.78, fine + body * 0.22);
      float edgeFade = smoothstep(0.0, 0.18, uv.x) * smoothstep(0.0, 0.16, uv.y);
      edgeFade *= smoothstep(0.0, 0.14, 1.0 - uv.x) * smoothstep(0.0, 0.13, 1.0 - uv.y);

      vec3 pine = vec3(0.18, 0.45, 0.34);
      vec3 mint = ${displayP3 ? "vec3(0.50, 0.835, 0.625)" : "vec3(0.45, 0.83, 0.60)"};
      vec3 paper = vec3(0.80, 0.85, 0.80);
      vec3 rust = vec3(0.50, 0.35, 0.28);
      vec3 color = mix(pine, mint, smoothstep(0.25, 0.78, material));
      color = mix(color, paper, smoothstep(0.68, 0.95, fine) * 0.42);
      color = mix(color, rust, (1.0 - smoothstep(0.0, 0.24, material)) * 0.5);

      float alpha = body * broken * dotShape * edgeFade;
      alpha *= 0.18 + material * 0.42;
      gl_FragColor = vec4(color * alpha, alpha);
    }
  `;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

  const position = gl.getAttribLocation(program, "a_position");
  const resolution = gl.getUniformLocation(program, "u_resolution");
  const pointer = gl.getUniformLocation(program, "u_pointer");
  const time = gl.getUniformLocation(program, "u_time");
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );

  let visible = false;
  let pointerX = -1;
  let pointerY = -1;
  let lastFrame = 0;
  let frame = 0;
  let startedAt = performance.now();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  };

  const draw = (now) => {
    resize();
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform2f(pointer, pointerX, pointerY);
    gl.uniform1f(time, reduced.matches ? 0 : (now - startedAt) / 1000);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const tick = (now) => {
    if (!visible || document.hidden || reduced.matches) {
      frame = 0;
      return;
    }
    if (now - lastFrame >= 1000 / 30) draw(now);
    if (now - lastFrame >= 1000 / 30) lastFrame = now;
    frame = window.requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (!frame && visible && !document.hidden && !reduced.matches) {
      frame = window.requestAnimationFrame(tick);
    }
  };

  section?.addEventListener(
    "pointermove",
    (event) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      pointerX = inside ? (event.clientX - rect.left) / rect.width : -1;
      pointerY = inside ? 1 - (event.clientY - rect.top) / rect.height : -1;
    },
    { passive: true },
  );

  section?.addEventListener("pointerleave", () => {
    pointerX = -1;
    pointerY = -1;
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else if (reduced.matches) {
        draw(performance.now());
      } else {
        startLoop();
      }
    },
    { rootMargin: "120px" },
  );
  observer.observe(canvas);

  const handleMotionPreference = () => {
    window.cancelAnimationFrame(frame);
    frame = 0;
    if (reduced.matches && visible) {
      draw(startedAt);
    } else if (visible) {
      startedAt = performance.now();
      startLoop();
    }
  };

  window.addEventListener(
    "resize",
    () => {
      if (visible) draw(performance.now());
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", startLoop);
  reduced.addEventListener("change", handleMotionPreference);
})();
