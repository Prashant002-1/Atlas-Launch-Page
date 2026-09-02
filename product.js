(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const chapters = document.querySelectorAll("[data-chapter]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-in-view");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    chapters.forEach((chapter) => observer.observe(chapter));
  } else {
    chapters.forEach((chapter) => chapter.classList.add("is-in-view"));
  }

  const brief = document.querySelector("[data-brief-story]");
  if (brief) {
    const steps = Array.from(brief.querySelectorAll("[data-brief-step]"));
    const replay = brief.querySelector("[data-brief-replay]");
    let timers = [];
    let hasPlayed = false;

    const clearTimers = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = [];
    };

    const play = () => {
      clearTimers();
      steps.forEach((step) => step.classList.remove("is-read"));
      if (reducedMotion.matches) {
        steps.forEach((step) => step.classList.add("is-read"));
        return;
      }
      steps.forEach((step, index) => {
        timers.push(
          window.setTimeout(() => step.classList.add("is-read"), 220 + index * 360),
        );
      });
    };

    replay?.addEventListener("click", play);

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || hasPlayed) return;
          hasPlayed = true;
          play();
          observer.disconnect();
        },
        { threshold: 0.38 },
      );
      observer.observe(brief);
    } else {
      play();
    }
  }

})();
