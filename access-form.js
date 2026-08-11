(() => {
  "use strict";

  const form = document.querySelector("[data-access-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector('button[type="submit"]');
  const organizationType = form.querySelector("[data-organization-type]");
  const institution = form.querySelector("[data-institution]");
  const institutionRequired = form.querySelector("[data-institution-required]");

  const syncInstitution = () => {
    if (!organizationType || !institution) return;
    const required = organizationType.value !== "Individual";
    institution.required = required;
    if (institutionRequired) institutionRequired.hidden = !required;
  };

  if (organizationType) {
    organizationType.addEventListener("change", syncInstitution);
    syncInstitution();
  }

  const interestMap = {
    "course-pilot": "First-course launch",
    institution: "Institutional rollout",
    individual: "Individual access",
  };
  const requestedInterest =
    interestMap[new URLSearchParams(window.location.search).get("interest")];
  if (requestedInterest) {
    const matchingInterest = Array.from(
      form.querySelectorAll('input[name="interests"]'),
    ).find((input) => input.value === requestedInterest);
    if (matchingInterest) matchingInterest.checked = true;
  }

  const bearingLinks = Array.from(
    document.querySelectorAll("[data-form-bearing-link]"),
  );
  const formSteps = Array.from(form.querySelectorAll("[data-form-step]"));
  if (bearingLinks.length && formSteps.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        bearingLinks.forEach((link) => {
          const current = link.dataset.formBearingLink === visible.target.id;
          link.classList.toggle("is-current", current);
          if (current) link.setAttribute("aria-current", "step");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-20% 0px -55%", threshold: [0.1, 0.45, 0.8] },
    );
    formSteps.forEach((step) => observer.observe(step));
  }

  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state || "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const interests = data.getAll("interests");
    if (interests.length === 0) {
      setStatus("Choose at least one area of interest.", "error");
      form.querySelector('[name="interests"]').focus();
      return;
    }

    const payload = Object.fromEntries(data.entries());
    payload.interests = interests;

    form.setAttribute("aria-busy", "true");
    submit.disabled = true;
    setStatus("Sending your request…", "");

    try {
      const response = await fetch("/api/launch-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "We could not send the request.");
      }

      form.reset();
      syncInstitution();
      setStatus(
        "Received. We will review the fit and reply directly.",
        "success",
      );
    } catch (error) {
      setStatus(
        error.message || "We could not send the request. Please try again.",
        "error",
      );
    } finally {
      form.setAttribute("aria-busy", "false");
      submit.disabled = false;
    }
  });
})();
