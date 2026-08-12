(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function createTabs(root, buttonSelector, panelSelector, buttonDataKey, panelDataKey, onChange) {
    if (!root) return;

    const buttons = [...root.querySelectorAll(buttonSelector)];
    const panels = [...root.querySelectorAll(panelSelector)];
    if (!buttons.length || !panels.length) return;

    let activeValue = buttons.find((button) => button.classList.contains("is-active"))?.dataset[buttonDataKey];

    const select = (value, focus = false) => {
      if (!value || value === activeValue) return;
      activeValue = value;

      buttons.forEach((button) => {
        const active = button.dataset[buttonDataKey] === value;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
        if (active && focus) button.focus();
      });

      panels.forEach((panel) => {
        const active = panel.dataset[panelDataKey] === value;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });

      onChange?.(value);
    };

    buttons.forEach((button, index) => {
      const active = button.dataset[buttonDataKey] === activeValue;
      button.tabIndex = active ? 0 : -1;
      button.addEventListener("click", () => select(button.dataset[buttonDataKey]));
      button.addEventListener("keydown", (event) => {
        let nextIndex;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (index + 1) % buttons.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (index - 1 + buttons.length) % buttons.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = buttons.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        select(buttons[nextIndex].dataset[buttonDataKey], true);
      });
    });
  }

  const productStage = document.querySelector("[data-product-stage]");
  createTabs(
    productStage,
    "[data-product-tab]",
    "[data-product-panel]",
    "productTab",
    "productPanel",
    (value) => {
      const positions = {
        terms: ["0px", "0px"],
        work: ["-12px", "7px"],
        review: ["8px", "-8px"],
      };
      const [x, y] = positions[value] || positions.terms;
      productStage.style.setProperty("--terrain-x", x);
      productStage.style.setProperty("--terrain-y", y);
    },
  );

  if (productStage && !reducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
    productStage.addEventListener("pointermove", (event) => {
      const bounds = productStage.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * -10;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -7;
      productStage.style.setProperty("--pointer-x", `${x.toFixed(2)}px`);
      productStage.style.setProperty("--pointer-y", `${y.toFixed(2)}px`);
    });
    productStage.addEventListener("pointerleave", () => {
      productStage.style.setProperty("--pointer-x", "0px");
      productStage.style.setProperty("--pointer-y", "0px");
    });
  }

  const operator = document.querySelector("[data-operator]");
  if (operator) {
    const consoleElement = operator.querySelector(".operator-console");
    const prompt = operator.querySelector("[data-operator-prompt]");
    const result = operator.querySelector("[data-operator-result]");
    const buttons = [...operator.querySelectorAll("[data-operator-index]")];
    const examples = [
      {
        prompt: "Build a 30-minute AI assignment that makes students defend a pricing decision with course evidence.",
        result: "Assignment instructions, session boundaries, course sources, and a rubric for teacher review.",
      },
      {
        prompt: "Turn Weeks 4 through 6 into a module that moves from demand to pricing strategy.",
        result: "A module sequence with pages, course materials, assignments, and a publish plan.",
      },
      {
        prompt: "Build a practice set from the mistakes students made on the last assignment.",
        result: "Questions, answers, rationales, and the course concepts each item rehearses.",
      },
      {
        prompt: "Make the course agent more direct, but do not let it give students the answer.",
        result: "A revised voice, teaching approach, student disclosure, and standing guidance.",
      },
      {
        prompt: "Show me where the class is getting stuck and what I should teach next.",
        result: "The class pattern, the supporting learning records, and a proposed next practice set.",
      },
    ];

    let activeIndex = 0;
    let changeTimer;
    let cycleTimer;

    const restartCycle = () => {
      clearInterval(cycleTimer);
      if (reducedMotion.matches) return;
      cycleTimer = window.setInterval(() => {
        selectExample((activeIndex + 1) % examples.length, false);
      }, 7200);
    };

    const selectExample = (index, restart = true) => {
      if (!examples[index] || index === activeIndex) {
        if (restart) restartCycle();
        return;
      }
      activeIndex = index;
      clearTimeout(changeTimer);
      consoleElement.classList.add("is-changing");

      changeTimer = window.setTimeout(() => {
        prompt.textContent = examples[index].prompt;
        result.textContent = examples[index].result;
        buttons.forEach((button, buttonIndex) => {
          const active = buttonIndex === index;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-selected", String(active));
          button.tabIndex = active ? 0 : -1;
        });
        consoleElement.classList.remove("is-changing");
      }, reducedMotion.matches ? 0 : 220);

      if (restart) restartCycle();
    };

    buttons.forEach((button, index) => {
      button.tabIndex = index === 0 ? 0 : -1;
      button.addEventListener("click", () => selectExample(index));
      button.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + direction + buttons.length) % buttons.length;
        selectExample(nextIndex);
        buttons[nextIndex].focus();
      });
    });

    operator.addEventListener("pointerenter", () => clearInterval(cycleTimer));
    operator.addEventListener("pointerleave", restartCycle);
    operator.addEventListener("focusin", () => clearInterval(cycleTimer));
    operator.addEventListener("focusout", (event) => {
      if (!operator.contains(event.relatedTarget)) restartCycle();
    });
    reducedMotion.addEventListener?.("change", restartCycle);
    restartCycle();
  }

  const scopeSelector = document.querySelector("[data-scope-selector]");
  createTabs(
    scopeSelector,
    "[data-scope]",
    "[data-scope-panel]",
    "scope",
    "scopePanel",
  );
})();
