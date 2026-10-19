/* Atlas — learn-more and contact forms
 *
 * Both forms post JSON to /api/inquiry. The page's data-form-kind decides
 * which set of fields the server expects. Query parameters preselect the
 * interest or topic so links from other pages land on the right choice.
 */
(() => {
  "use strict";

  const form = document.querySelector("[data-access-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector('button[type="submit"]');
  const interestControl = form.querySelector('[name="interest"]');
  const topicControl = form.querySelector('[name="topic"]');
  const success = form.querySelector("[data-access-success]");
  const successTitle = form.querySelector("[data-access-success-title]");
  const resetRequest = form.querySelector("[data-access-reset]");
  const isContact = form.dataset.formKind === "contact";
  const params = new URLSearchParams(window.location.search);

  const interestMap = {
    "ai-assignments": "AI Assignments",
    course: "Atlas Course",
    assessment: "Assessment workflow",
    integrations: "Integrations",
    lms: "Atlas LMS",
    build: "How it was built",
    other: "Something else",
  };
  const requestedInterest = interestMap[params.get("interest")];
  if (interestControl && requestedInterest) interestControl.value = requestedInterest;

  const topicMap = {
    general: "General question",
    contribute: "Contributing or forking",
    privacy: "Privacy request",
    security: "Security concern",
    feedback: "Feedback",
  };
  const requestedTopic = topicMap[params.get("topic")];
  if (topicControl && requestedTopic) topicControl.value = requestedTopic;

  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state || "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    if (!form.reportValidity()) return;

    const payload = Object.fromEntries(new FormData(form).entries());
    payload.kind = isContact ? "contact" : "inquiry";

    form.setAttribute("aria-busy", "true");
    submit.disabled = true;
    setStatus("Sending...", "");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || "The message could not be sent.");
      }

      setStatus("Received. I will reply using the email you provided.", "success");
      form.dataset.complete = "true";
      if (success) success.hidden = false;
      successTitle?.focus();
    } catch {
      setStatus(
        "Delivery could not be confirmed. Your entries are still here. Please try again in a moment.",
        "error",
      );
    } finally {
      form.setAttribute("aria-busy", "false");
      submit.disabled = false;
    }
  });

  resetRequest?.addEventListener("click", () => {
    delete form.dataset.complete;
    if (success) success.hidden = true;
    form.reset();
    setStatus("", "");
    (topicControl || interestControl)?.focus();
  });

  submit.disabled = false;
})();
