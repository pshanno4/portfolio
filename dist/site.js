(() => {
  "use strict";

  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const type = form.querySelector("[data-project-type]");
  const subject = form.querySelector("[data-subject-field]");
  const startTime = form.querySelector("[data-start-time]");
  const help = form.querySelector("[data-project-help]");
  const detailsLabel = form.querySelector("[data-details-label]");
  const detailsHelp = form.querySelector("[data-details-help]");
  const feedback = form.querySelector("[data-form-feedback]");
  const submit = form.querySelector("[data-submit-button]");
  const startedAt = Date.now();

  startTime.value = new Date(startedAt).toISOString();

  const prompts = {
    environmental: {
      help: "For research, sustainability, water, climate, or other scientific subjects.",
      label: "What research or environmental subject needs to become clear?",
      details: "Include the audience, source material, claims that require care, and the intended use."
    },
    technical: {
      help: "For complex products, services, processes, and subject-matter expertise.",
      label: "What technical idea needs to become useful content?",
      details: "Include the product or subject, reader, available experts or documentation, and desired asset."
    },
    seo: {
      help: "For search-led content that still needs genuine subject depth.",
      label: "What should the right reader find and understand?",
      details: "Include the target reader, topic, current page or content gap, and what a useful visit should accomplish."
    },
    web: {
      help: "For service pages, landing pages, and website copy that is difficult to follow.",
      label: "What is unclear about the current page or offer?",
      details: "Share the page, intended reader, desired action, and any source material or positioning constraints."
    },
    "thought-leadership": {
      help: "For expert ideas that need research, interviews, structure, and a clear point of view.",
      label: "Whose expertise should the piece capture?",
      details: "Include the expert, intended audience, core idea, source material, and preferred format or channel."
    },
    editing: {
      help: "For substantive editing, source checks, fact-checking support, or structural revision.",
      label: "What is not working in the current draft?",
      details: "Include its length, audience, current stage, source requirements, and the level of editing needed."
    },
    agency: {
      help: "For overflow work, ongoing assignments, and research-heavy briefs.",
      label: "Where does your team need dependable capacity?",
      details: "Include expected volume, subjects, workflow, deadlines, revision process, and typical deliverables."
    },
    other: {
      help: "Describe the communication problem in your own terms.",
      label: "What are you trying to communicate or improve?",
      details: "Include the subject, intended audience, available source material, and desired outcome."
    }
  };

  const updatePrompt = () => {
    const selected = type.value;
    const prompt = prompts[selected];
    if (!prompt) return;
    help.textContent = prompt.help;
    detailsLabel.firstChild.textContent = `${prompt.label} `;
    detailsHelp.textContent = prompt.details;
    const selectedText = type.options[type.selectedIndex].text;
    subject.value = `PaulWrites inquiry — ${selectedText}`;
  };

  type.addEventListener("change", updatePrompt);

  document.querySelectorAll("[data-project-choice]").forEach((link) => {
    link.addEventListener("click", () => {
      type.value = link.dataset.projectChoice;
      updatePrompt();
    });
  });

  form.addEventListener("submit", (event) => {
    feedback.hidden = true;

    if (Date.now() - startedAt < 2500) {
      event.preventDefault();
      feedback.textContent = "Please review the project details before sending the form.";
      feedback.hidden = false;
      return;
    }

    if (!form.checkValidity()) {
      event.preventDefault();
      feedback.textContent = "Please complete the required fields and correct any highlighted entries.";
      feedback.hidden = false;
      form.reportValidity();
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending…";
  });
})();
