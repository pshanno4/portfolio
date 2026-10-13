(() => {
  "use strict";

  // Enhance content already present in HTML. With JavaScript unavailable the
  // alternatives remain readable and the native evidence disclosures still work.
  const showChoice = (panels, attribute, value) => {
    panels.forEach((panel) => { panel.hidden = panel.getAttribute(attribute) !== value; });
  };

  document.querySelectorAll("[data-audience-demo]").forEach((demo) => {
    const controls = demo.querySelector("[data-reader-controls]");
    const buttons = [...demo.querySelectorAll("[data-reader]")];
    const panels = [...demo.querySelectorAll("[data-reader-panel]")];
    const status = demo.querySelector("[data-reader-status]");
    const choose = (button, announce = true) => {
      showChoice(panels, "data-reader-panel", button.dataset.reader);
      buttons.forEach((entry) => entry.setAttribute("aria-pressed", String(entry === button)));
      if (announce) status.textContent = `Showing the explanation for: ${button.textContent}.`;
    };
    choose(buttons[0], false);
    controls.hidden = false;
    buttons.forEach((button) => button.addEventListener("click", () => choose(button)));
  });

  const enhanceSelect = (rootSelector, controlSelector, selectSelector, panelSelector, attribute, statusSelector) => {
    document.querySelectorAll(rootSelector).forEach((widget) => {
      const controls = widget.querySelector(controlSelector);
      const select = widget.querySelector(selectSelector);
      const panels = [...widget.querySelectorAll(panelSelector)];
      const status = widget.querySelector(statusSelector);
      const update = (announce = true) => {
        showChoice(panels, attribute, select.value);
        if (announce) status.textContent = `Showing: ${select.options[select.selectedIndex].text}.`;
      };
      update(false);
      controls.hidden = false;
      select.addEventListener("change", () => update());
    });
  };
  enhanceSelect("[data-seo-planner]", "[data-intent-controls]", "[data-intent-select]", "[data-intent-panel]", "data-intent-panel", "[data-intent-status]");
  enhanceSelect("[data-service-router]", "[data-router-controls]", "[data-router-select]", "[data-route-panel]", "data-route-panel", "[data-router-status]");

  document.querySelectorAll("[data-audit-triage]").forEach((demo) => {
    const controls = demo.querySelector("[data-audit-controls]");
    const buttons = [...demo.querySelectorAll("[data-audit-goal]")];
    const list = demo.querySelector("#audit-findings");
    const findings = new Map([...demo.querySelectorAll("[data-audit-finding]")].map((finding) => [finding.dataset.auditFinding, finding]));
    const summary = demo.querySelector("[data-audit-summary]");
    const orders = {
      inquiries: ["contact", "content", "canonical"],
      discovery: ["canonical", "contact", "content"]
    };
    const explanations = {
      inquiries: "Inquiry goal: repair a broken contact path first, then clarify the offer and align the search signals.",
      discovery: "Search discovery goal: align the URL signals first, then repair the contact path and clarify the offer. Indexing changes require verification; this sequence does not guarantee rankings."
    };
    const choose = (button) => {
      orders[button.dataset.auditGoal].forEach((key, index) => {
        const finding = findings.get(key);
        finding.querySelector("[data-finding-rank]").textContent = String(index + 1).padStart(2, "0");
        list.append(finding);
      });
      buttons.forEach((entry) => entry.setAttribute("aria-pressed", String(entry === button)));
      summary.textContent = explanations[button.dataset.auditGoal];
    };
    controls.hidden = false;
    buttons.forEach((button) => button.addEventListener("click", () => choose(button)));
  });
})();
