/* Atlas — motion
 *
 * One rAF loop normalizes scroll and pointer, smooths them with inertia, and
 * publishes them as custom properties on :root. Everything else reacts in CSS.
 *
 * The reason for the inertia: position alone reads as decoration. Lagging a
 * value behind its input by ~100ms is what makes a page feel like it has
 * weight instead of snapping around like a form control.
 *
 *   --scroll      0..1 document progress
 *   --scroll-vel -1..1 signed, smoothed
 *   --ptr-x/y     0..1 pointer, smoothed
 *   --ptr-energy  0..1 decaying "recently moved"
 */
(() => {
  const root = document.documentElement;
  root.classList.add("js");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ── smooth scroll ────────────────────────────────────────────────────── */
  let lenis = null;

  function startLenis() {
    if (reduced.matches || typeof window.Lenis !== "function" || lenis) return;
    lenis = new window.Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.94,
      stopInertiaOnNavigate: true,
    });
    root.classList.add("has-lenis");
  }

  function stopLenis() {
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
    root.classList.remove("has-lenis");
  }

  /* ── reveal ───────────────────────────────────────────────────────────── */
  // Groups stagger internally; elements in one thought arrive together.
  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.setAttribute("data-reveal", "");
      if (!child.hasAttribute("data-reveal-delay")) {
        child.setAttribute("data-reveal-delay", String(i));
      }
    });
  });

  const STEP = 80;

  function revealAll() {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
  }

  if (reduced.matches) {
    root.classList.add("reduced-motion");
    revealAll();
    root.style.setProperty("--scroll", "0");
    root.style.setProperty("--scroll-vel", "0");
    root.style.setProperty("--ptr-x", "0.5");
    root.style.setProperty("--ptr-y", "0.5");
    root.style.setProperty("--ptr-energy", "0");
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          const idx = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
          el.style.transitionDelay = `${idx * STEP}ms`;
          el.classList.add("is-visible");
          obs.unobserve(el); // never replay — a re-firing reveal is a tell
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -7% 0px" },
    );
    const pending = new Set(document.querySelectorAll("[data-reveal]"));
    pending.forEach((el) => io.observe(el));

    // IntersectionObserver decides *when* an element arrives, never *whether*
    // it is allowed to be seen. In embedded, prerendered, or zero-height
    // contexts it can simply never fire, so anything still hidden gets
    // released on its own. Failing visible is the only acceptable direction.
    const release = (el) => {
      if (!pending.has(el)) return;
      pending.delete(el);
      io.unobserve(el);
      el.classList.add("is-visible");
    };

    const sweep = () => {
      const h = window.innerHeight || 0;
      pending.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < h * 0.92 && r.bottom > 0) release(el);
      });
    };

    sweep();
    window.addEventListener("load", sweep, { once: true });
    setTimeout(sweep, 400);
    setTimeout(() => {
      pending.forEach(release);
      }, 2600);

    /* ── normalized inputs ──────────────────────────────────────────────── */
    const damp = (cur, tgt, half, dt) => tgt + (cur - tgt) * Math.pow(2, -dt / half);
    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

    let scroll = 0, scrollT = 0;
    let vel = 0, velT = 0;
    let px = 0.5, pxT = 0.5;
    let py = 0.5, pyT = 0.5;
    let energy = 0, energyT = 0;
    let lastY = window.scrollY;
    let last = performance.now();

    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollT = max > 0 ? clamp01(window.scrollY / max) : 0;
    };

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener(
      "pointermove",
      (e) => {
        pxT = clamp01(e.clientX / window.innerWidth);
        pyT = clamp01(e.clientY / window.innerHeight);
        energyT = 1;
      },
      { passive: true },
    );
    measure();

    const set = (k, v) => root.style.setProperty(k, v);

    function tick(now) {
      requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      velT = Math.max(-1, Math.min(1, dy / Math.max(dt, 0.001) / 900));

      scroll = damp(scroll, scrollT, 0.08, dt);
      vel = damp(vel, velT, 0.13, dt);
      px = damp(px, pxT, 0.1, dt);
      py = damp(py, pyT, 0.1, dt);
      energyT *= 0.9;
      energy = damp(energy, energyT, 0.34, dt);

      set("--scroll", scroll.toFixed(4));
      set("--scroll-vel", vel.toFixed(4));
      set("--ptr-x", px.toFixed(4));
      set("--ptr-y", py.toFixed(4));
      set("--ptr-energy", energy.toFixed(4));
    }
    requestAnimationFrame(tick);
  }

  reduced.addEventListener("change", (e) => {
    if (e.matches) {
      stopLenis();
      root.classList.add("reduced-motion");
      revealAll();
    } else {
      root.classList.remove("reduced-motion");
      startLenis();
    }
  });

  startLenis();
})();
