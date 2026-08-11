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
    const interestControl = form.querySelector('[name="interests"]');
    if (interestControl) interestControl.value = requestedInterest;
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
    if (interests.length === 0 || interests.every((interest) => !interest)) {
      setStatus("Choose what you are interested in.", "error");
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
