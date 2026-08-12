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
    "ai-assignments": "AI Assignments",
    "bring-course": "Bring Your Course",
    "full-lms": "Full LMS",
    "product-demo": "Product demo",
    "course-pilot": "Bring Your Course",
    institution: "Full LMS",
    individual: "AI Assignments",
  };
  const requestedKey = new URLSearchParams(window.location.search).get("interest");
  const requestedInterest = interestMap[requestedKey];
  if (requestedInterest) {
    const interestControl = form.querySelector('[name="interests"]');
    if (interestControl) interestControl.value = requestedInterest;

    const path = form.querySelector("[data-access-path]");
    const pathLabel = form.querySelector("[data-access-path-label]");
    const pathCopy = form.querySelector("[data-access-path-copy]");
    const pathCopyByInterest = {
      "ai-assignments": "Start with one governed agent session inside a course you already teach.",
      "bring-course": "Bring the materials, structure, and teaching approach of a real course.",
      "full-lms": "Evaluate institution setup, course operations, records, and the agent layer together.",
      "product-demo": "We will prepare the product surface that best answers your question.",
    };
    if (path && pathLabel && pathCopy) {
      pathLabel.textContent = requestedInterest;
      pathCopy.textContent = pathCopyByInterest[requestedKey] || "We will prepare the right first scope.";
      path.hidden = false;
    }
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
