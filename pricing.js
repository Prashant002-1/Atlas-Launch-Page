(() => {
  "use strict";

  const instrument = document.querySelector("[data-scope-instrument]");
  if (!instrument) return;

  const options = {
    course: {
      label: "Founding course",
      title: "Launch one real course.",
      description: "For a teacher, course team, or academic leader with a clear first use case and a group of students ready to begin.",
      items: ["Course and assignment setup", "Course-agent configuration with the teacher", "Teacher and student launch preparation", "Review of the first course cycle"],
      action: "Scope a first course",
      href: "/access/?interest=course-pilot",
    },
    institution: {
      label: "Institution",
      title: "Plan a broader rollout.",
      description: "For a school, department, program, college, or university evaluating Atlas across more than one course.",
      items: ["Rollout shaped around course groups", "Shared onboarding plan", "Teacher-owned course configuration", "Expansion review after the first launch"],
      action: "Discuss institutional access",
      href: "/access/?interest=institution",
    },
    individual: {
      label: "Individual",
      title: "Register your interest.",
      description: "For a teacher, professor, student, or researcher who wants to follow the launch or request an individual demonstration.",
      items: ["Product updates when they matter", "Individual demo requests", "A place to describe your own use case", "No institution required"],
      action: "Register interest",
      href: "/access/?interest=individual",
    },
  };

  const label = instrument.querySelector("[data-scope-label]");
  const title = instrument.querySelector("[data-scope-title]");
  const description = instrument.querySelector("[data-scope-description]");
  const list = instrument.querySelector("[data-scope-list]");
  const action = instrument.querySelector("[data-scope-action]");

  const render = (value) => {
    const option = options[value];
    if (!option) return;
    label.textContent = option.label;
    title.textContent = option.title;
    description.textContent = option.description;
    list.replaceChildren(...option.items.map((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      return li;
    }));
    action.textContent = option.action;
    action.href = option.href;
  };

  instrument.querySelectorAll('input[name="scope"]').forEach((input) => {
    input.addEventListener("change", () => render(input.value));
  });
})();
