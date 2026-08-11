(() => {
  "use strict";

  const map = document.querySelector("[data-course-map]");
  if (!map) return;

  const tabs = Array.from(map.querySelectorAll("[data-map-tab]"));
  const panels = Array.from(map.querySelectorAll("[data-map-panel]"));

  const update = (name, focus = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.mapTab === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });

    panels.forEach((panel) => {
      const active = panel.dataset.mapPanel === name;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
  };

  const select = (name, focus = false) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) {
      update(name, focus);
      return;
    }
    document.startViewTransition(() => update(name, focus));
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab.dataset.mapTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else if (["ArrowDown", "ArrowRight"].includes(event.key)) next = (index + 1) % tabs.length;
      else next = (index - 1 + tabs.length) % tabs.length;
      select(tabs[next].dataset.mapTab, true);
    });
  });
})();
