(() => {
  "use strict";

  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
    };

    toggle.addEventListener("click", () => {
      setOpen(!nav.classList.contains("is-open"));
    });

    document.addEventListener("pointerdown", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  const path = window.location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll("[data-site-nav] a").forEach((link) => {
    const linkPath =
      new URL(link.href, window.location.origin).pathname.replace(/\/$/, "") ||
      "/";
    if (linkPath === path) link.setAttribute("aria-current", "page");
  });

  const film = document.querySelector("[data-product-film]");
  if (!film) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const syncFilm = () => {
    if (reduced.matches) {
      film.pause();
      film.removeAttribute("autoplay");
      return;
    }

    film.setAttribute("autoplay", "");
    const play = film.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
  };

  syncFilm();
  reduced.addEventListener("change", syncFilm);
})();
