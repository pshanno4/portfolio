// Public adaptation only. The source business and private editorial notes do not
// belong in generated HTML, metadata, downloads, or source maps.
export const AUDIT_EXAMPLE_PATH = "/services/seo-content-audit-example/";

export const sectionNavigation = (links) => `<nav class="section-nav" aria-label="On this page"><div class="container"><span class="section-nav-label">On this page</span><ul>${links.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join("")}</ul></div></nav>`;

export function renderAuditExample({ head, header, footer, breadcrumbs, breadcrumbSchema, personNode, origin }) {
  const canonical = `${origin}${AUDIT_EXAMPLE_PATH}`;
  const crumbs = [
    { label: "Home", href: "../../index.html", canonical: `${origin}/` },
    { label: "Services", href: "../index.html", canonical: `${origin}/services/` },
    { label: "Audit example", href: "", canonical }
  ];
  const description = "An anonymized technical SEO and content audit showing broken page paths, conflicting claims and a practical order for repairs.";
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${canonical}#page`, url: canonical,
      name: "Technical SEO and content audit example", description,
      author: { "@id": personNode["@id"] }, isPartOf: { "@id": `${origin}/#website` } },
    personNode, breadcrumbSchema(crumbs)
  ] };
  const findings = [
    { title: "Promoted pages did not deliver their promised content", observation: "Feature and comparison destinations rendered a missing-page screen, while their server responses reported success.", impact: "A visitor could follow a promising link and receive neither an explanation nor a useful next step.", recommendation: "Reconcile the URL inventory, remove unfinished pages from discovery files, and publish verified feature pages with appropriate responses." },
    { title: "Product promises and supporting information disagreed", observation: "A prominent capability claim conflicted with documented limitations. Rating data and commercial terms also needed reconciliation.", impact: "Readers could form an inaccurate expectation of what the product could establish or what a plan included.", recommendation: "Agree on approved wording with the product owner, identify the supporting evidence, and place material limitations beside the relevant promise." },
    { title: "Feature explanations needed a clearer route to action", observation: "Broad homepage summaries offered little access to detailed answers about individual tasks.", impact: "A visitor with one specific question had limited information for deciding whether the product fit.", recommendation: "Build focused pages with verified workflows, screenshots, limitations and commercial terms, then connect each to the relevant next step." }
  ];
  return `<!doctype html>
<html lang="en">${head({ title: "Technical SEO and Content Audit Example | PaulWrites", description, canonical, prefix: "../../", schema })}
<body class="service-page audit-example-page">
${header("../../", "services")}
<main id="main" tabindex="-1">
  <div class="container">${breadcrumbs(crumbs)}</div>
  <article>
    <header class="service-hero container service-hero-grid">
      <div><p class="kicker">Anonymized audit example</p>
      <h1>Technical SEO and content audit: a practical example.</h1>
      <p class="service-lede">Broken page paths. Conflicting claims. Unanswered product questions. Here’s how I turned those findings into a prioritized repair plan.</p>
      <div class="actions"><a class="button button-primary" href="#findings">Explore the findings</a><a class="button button-secondary" href="../../seo-audits/index.html">See the audit service</a></div>
      <p class="audit-byline">Reviewed and written by <a href="../../authors/paul-shannon/index.html" rel="author">Paul Shannon</a></p></div>
      <aside class="service-summary" aria-label="Example at a glance"><p class="small-label">At a glance</p><dl><div><dt>Website</dt><dd>Consumer software</dd></div><div><dt>Review</dt><dd>Technical SEO, content and visitor paths</dd></div><div><dt>Output</dt><dd>Prioritized repairs and copy recommendations</dd></div></dl><p class="summary-note">Business details are generalized. This example shows findings and recommendations, with no implementation or growth results claimed.</p></aside>
    </header>
    ${sectionNavigation([["scope", "Scope"], ["findings", "Findings"], ["copy-example", "Copy example"], ["repair-order", "Repair order"], ["start", "Next step"]])}

    <section class="section container audit-context" id="scope" aria-labelledby="review-heading">
      <div><p class="small-label">01 / Scope</p><h2 id="review-heading">What I reviewed</h2><p>I compared the website’s advertised destinations with the pages visitors could reach, examined initial and rendered HTML, and checked consistency across marketing, support, policy and public product information. The review also considered internal links and the path to the main action.</p></div>
      <div class="scope-note"><h3>The limits of this review</h3><p>These are historical observations from a public website review. Private analytics and search-account data were unavailable, so I did not estimate lost revenue or conclude that every affected page was absent from search.</p></div>
    </section>

    <section class="section section-muted" id="findings" aria-labelledby="findings-heading"><div class="container">
      <p class="small-label">02 / Selected findings</p><h2 id="findings-heading">Three issues that shaped the plan.</h2>
      <div class="audit-findings">${findings.map((finding, index) => `<section class="finding-row"><div class="finding-title"><span class="route-number" aria-hidden="true">0${index + 1}</span><h3>${finding.title}</h3></div><dl><div><dt>Observation</dt><dd>${finding.observation}</dd></div><div><dt>Visitor impact</dt><dd>${finding.impact}</dd></div><div class="finding-recommendation"><dt>Recommended repair</dt><dd>${finding.recommendation}</dd></div></dl></section>`).join("")}</div>
    </div></section>

    <section class="section container" id="copy-example" aria-labelledby="rewrite-heading">
      <p class="small-label">03 / Illustrative rewrite</p><h2 id="rewrite-heading">Make the claim easier to evaluate.</h2>
      <p class="audit-intro">This newly written example demonstrates the copy approach. It is not a quotation from the reviewed business or a deployed change.</p>
      <div class="audit-rewrite"><div><h3>Before: a broad promise</h3><p>“The smartest solution for every situation. Get instant confidence with advanced AI.”</p></div><div><h3>After: a defined task</h3><p>“Review the information you provide in one place, with clear explanations of what the tool can assess and what needs independent confirmation.”</p><p class="audit-supporting">Supporting line: See how the feature works, what information it uses and where its limitations apply.</p></div></div>
      <p class="audit-intro">The recommendation defines the task and connects it to supporting detail. Final wording would require verification of the product’s actual behavior.</p>
    </section>

    <section class="section section-muted" id="repair-order" aria-labelledby="repair-heading"><div class="container audit-context">
      <div><p class="small-label">04 / Implementation order</p><h2 id="repair-heading">Repair the foundations first.</h2><ol class="steps-list"><li><strong>Restore the path.</strong><span>Repair missing destinations and verify responses.</span></li><li><strong>Verify the promise.</strong><span>Reconcile capabilities, evidence and commercial terms.</span></li><li><strong>Connect the pages.</strong><span>Improve page identity, internal links and accessible support content.</span></li><li><strong>Build useful detail.</strong><span>Create focused pages for verified features.</span></li></ol></div>
      <div class="scope-note"><h3>From findings to a usable plan</h3><p>The audit supplied a finding register, URL action inventory, copy proposals, page recommendations, acceptance checks and a staged roadmap. It defined the proposed changes and how to assess them.</p><p>A business or developer would still need to implement the technical repairs. Measurement would separately track search visibility, qualified visits, CTA clicks and downstream activation or purchases. No traffic, conversion or revenue improvement is asserted here.</p><a class="text-link" href="../../seo-audits/index.html">Explore audit scope and deliverables</a></div>
    </div></section>

    <section class="article-cta" id="start"><div class="container simple-cta"><div><p class="small-label">05 / Your next step</p><h2>Start with the pages that matter most.</h2><p>Send your URL, what you sell and the action you want visitors to take. I’ll recommend a scope for the review or an initial repair project.</p></div><div class="cta-actions"><a class="button button-primary" href="../../index.html?project=audit#contact">Discuss your website</a><a class="text-link" href="../index.html">Compare all services</a></div></div></section>
  </article>
</main>
${footer("../../")}
</body></html>`;
}

export const auditPreview = (prefix = "../") => `<section class="section container audit-preview" id="audit-preview" aria-labelledby="audit-preview-heading"><div><p class="small-label">Anonymized audit example</p><h2 id="audit-preview-heading">See how findings become a repair plan.</h2><p>Follow the review of broken page paths, conflicting claims and gaps in product explanations—from observation to recommended repair.</p></div><a class="button button-secondary" href="${prefix}services/seo-content-audit-example/index.html">Explore the audit example</a></section>`;
