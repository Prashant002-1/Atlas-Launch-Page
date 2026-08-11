(() => {
  "use strict";

  const story = document.querySelector("[data-scroll-story]");
  if (!story) return;

  const steps = Array.from(story.querySelectorAll("[data-story-step]"));
  const visuals = Array.from(story.querySelectorAll("[data-story-visual]"));
  const count = story.querySelector("[data-story-count]");
  const progress = story.querySelector("[data-story-progress]");
  if (!steps.length || !visuals.length) return;

  const activate = (key) => {
    const index = Math.max(
      0,
      steps.findIndex((step) => step.dataset.storyStep === key),
    );

    steps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex === index);
    });

    visuals.forEach((visual) => {
      visual.classList.toggle("is-active", visual.dataset.storyVisual === key);
    });

    if (count) count.textContent = `${index + 1} / ${steps.length}`;
    if (progress) {
      progress.style.setProperty("--story-progress", (index + 1) / steps.length);
    }
  };

  activate(steps[0].dataset.storyStep);

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) activate(current.target.dataset.storyStep);
    },
    {
      rootMargin: "-38% 0px -38% 0px",
      threshold: [0, 0.15, 0.45, 0.75],
    },
  );

  steps.forEach((step) => observer.observe(step));
})();
