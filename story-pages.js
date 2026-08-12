(() => {
  "use strict";

  const story = document.querySelector("[data-record-story]");
  if (story) {
    const chapters = [...story.querySelectorAll("[data-record-step]")];
    const frames = [...story.querySelectorAll("[data-record-frame]")];
    const count = story.querySelector("[data-record-count]");
    const progress = story.querySelector("[data-record-progress]");
    const label = story.querySelector("[data-record-label]");
    const labels = {
      contract: "Teacher contract",
      session: "Student session",
      evidence: "Transcript evidence",
      decision: "Teacher decision",
    };

    let activeStep = chapters[0]?.dataset.recordStep;

    const activate = (step) => {
      if (!step || step === activeStep) return;
      activeStep = step;
      const activeIndex = Math.max(0, chapters.findIndex((chapter) => chapter.dataset.recordStep === step));

      chapters.forEach((chapter) => {
        chapter.classList.toggle("is-active", chapter.dataset.recordStep === step);
      });
      frames.forEach((frame) => {
        const active = frame.dataset.recordFrame === step;
        frame.hidden = !active;
        frame.classList.toggle("is-active", active);
      });

      if (count) count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
      if (progress) progress.style.width = `${((activeIndex + 1) / chapters.length) * 100}%`;
      if (label) label.textContent = labels[step] || step;
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible) activate(visible.target.dataset.recordStep);
        },
        {
          rootMargin: "-30% 0px -38% 0px",
          threshold: [0.18, 0.35, 0.55, 0.72],
        },
      );
      chapters.forEach((chapter) => observer.observe(chapter));
    }
  }

  const scopeDoors = document.querySelector("[data-scope-doors]");
  if (scopeDoors) {
    const doors = [...scopeDoors.querySelectorAll("[data-scope-door]")];
    doors.forEach((door) => {
      door.addEventListener("toggle", () => {
        if (!door.open) return;
        doors.forEach((otherDoor) => {
          if (otherDoor !== door) otherDoor.open = false;
        });
        scopeDoors.dataset.activeScope = door.dataset.scopeDoor || "";
      });
    });
  }
})();
