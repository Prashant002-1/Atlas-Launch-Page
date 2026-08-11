(() => {
  "use strict";

  const workshop = document.querySelector("[data-workshop]");
  if (!workshop) return;

  const stages = Array.from(workshop.querySelectorAll("[data-workshop-stage]"));
  const output = workshop.querySelector("[data-workshop-output]");

  stages.forEach((stage) => {
    stage.addEventListener("toggle", () => {
      if (!stage.open) return;
      stages.forEach((other) => {
        if (other !== stage) other.open = false;
      });
      if (output) output.textContent = stage.dataset.output;
    });
  });
})();
