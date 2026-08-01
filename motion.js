(() => {
  document.documentElement.classList.add("js");

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reveals = Array.from(document.querySelectorAll("[data-reveal]"));

  let lenis = null;

  function startLenis() {
    if (motionPreference.matches || typeof window.Lenis !== "function" || lenis) {
      return;
    }

    lenis = new window.Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.94,
      stopInertiaOnNavigate: true,
    });

    document.documentElement.classList.add("has-lenis");
  }

  function stopLenis() {
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
    document.documentElement.classList.remove("has-lenis");
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12,
    },
  );

  reveals.forEach((element) => revealObserver.observe(element));

  motionPreference.addEventListener("change", (event) => {
    if (event.matches) stopLenis();
    else startLenis();
  });

  startLenis();
})();
