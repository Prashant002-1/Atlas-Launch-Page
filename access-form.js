(() => {
  "use strict";

  const form = document.querySelector("[data-access-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector('button[type="submit"]');
  const organizationType = form.querySelector("[data-organization-type]");
  const institution = form.querySelector("[data-institution]");
  const institutionRequired = form.querySelector("[data-institution-required]");
  const institutionField = institution?.closest(".field");
  const interestControl = form.querySelector("[data-interest]");
  const success = form.querySelector("[data-access-success]");
  const successTitle = form.querySelector("[data-access-success-title]");
  const successCopy = form.querySelector("[data-access-success-copy]");
  const resetRequest = form.querySelector("[data-access-reset]");
  const emailFallback = form.querySelector("[data-email-fallback]");

  const syncInstitution = () => {
    if (!organizationType || !institution) return;
    const required = organizationType.value !== "Individual";
    institution.required = required;
    if (institutionRequired) institutionRequired.hidden = !required;
    if (institutionField) institutionField.hidden = organizationType.value === "Individual";
    if (organizationType.value === "Individual") institution.value = "";
  };

  if (organizationType) {
    organizationType.addEventListener("change", syncInstitution);
    syncInstitution();
  }

  const interestMap = {
    "ai-assignments": "AI Assignments",
    assessment: "Assessment workflow",
    connector: "LMS connector",
    "full-system": "Atlas LMS",
    conversation: "Product conversation",
    "course-pilot": "Atlas Course",
    institution: "Atlas LMS",
    individual: "AI Assignments",
  };
  const requestedKey = new URLSearchParams(window.location.search).get("interest");
  const requestedInterest = interestMap[requestedKey];
  if (requestedInterest) {
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

    if (emailFallback) {
      emailFallback.hidden = true;
      const emailBody = [
        "I would like to request free pilot access to Atlas.",
        "",
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Role: ${payload.role}`,
        `Organization type: ${payload.organizationType}`,
        `Institution: ${payload.institution || "Individual"}`,
        `Interest: ${interests.join(", ")}`,
        "",
        `Context: ${payload.courseContext}`,
        `What I would like to try: ${payload.useCase}`,
      ].join("\n");
      emailFallback.href = `mailto:contact@atlas-lms.com?subject=${encodeURIComponent("Atlas free pilot access")}&body=${encodeURIComponent(emailBody)}`;
    }

    form.setAttribute("aria-busy", "true");
    submit.disabled = true;
    setStatus("Sending your request...", "");

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

      setStatus("Received. We will email you with the next steps.", "success");
      form.dataset.complete = "true";
      if (success) success.hidden = false;
      if (successCopy) {
        successCopy.textContent = `We will email ${payload.email} with the next steps for your free pilot. Our team will provide your login credentials when your access is ready.`;
      }
      successTitle?.focus();
    } catch {
      setStatus(
        "Your request was not sent. Try again or use the email link below to send it directly.",
        "error",
      );
      if (emailFallback) emailFallback.hidden = false;
    } finally {
      form.setAttribute("aria-busy", "false");
      submit.disabled = false;
    }
  });

  resetRequest?.addEventListener("click", () => {
    delete form.dataset.complete;
    if (success) success.hidden = true;
    if (emailFallback) {
      emailFallback.hidden = true;
      emailFallback.href = "mailto:contact@atlas-lms.com";
    }
    form.reset();
    syncInstitution();
    setStatus("", "");
    interestControl?.focus();
  });
})();
