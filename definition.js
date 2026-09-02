/* Atlas — definition disclosure
 *
 * The name explains itself where the product claim first uses it. Mouse
 * hover is immediate; keyboard focus and touch use the same disclosure.
 */
(() => {
  "use strict";

  const root = document.querySelector("[data-definition]");
  if (!root) return;

  const trigger = root.querySelector(".atlas-term");
  const card = root.querySelector(".atlas-definition-card");
  if (!trigger || !card) return;

  let pinned = false;
  let hovered = false;
  let focused = false;
  let dismissed = false;

  function setOpen(open) {
    root.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    card.setAttribute("aria-hidden", String(!open));
  }

  function sync() {
    setOpen(!dismissed && (pinned || hovered || focused));
  }

  root.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = true;
    dismissed = false;
    sync();
  });

  root.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = false;
    sync();
  });

  trigger.addEventListener("focus", () => {
    focused = true;
    sync();
  });

  trigger.addEventListener("blur", () => {
    focused = false;
    dismissed = false;
    sync();
  });

  trigger.addEventListener("click", (event) => {
    dismissed = false;
    if (event.detail === 0) {
      pinned = true;
    } else {
      pinned = !pinned;
    }
    sync();
  });

  document.addEventListener("pointerdown", (event) => {
    if (root.contains(event.target)) return;
    pinned = false;
    focused = false;
    dismissed = false;
    sync();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    pinned = false;
    hovered = false;
    dismissed = true;
    if (document.activeElement !== trigger) trigger.focus({ preventScroll: true });
    setOpen(false);
  });
})();
