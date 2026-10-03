// Public adaptation only. The source business and private editorial notes do not
// belong in generated HTML, metadata, downloads, or source maps.
export const AUDIT_EXAMPLE_PATH = "/services/seo-content-audit-example/";

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
      name: "What a technical SEO and content audit reveals", description,
      author: { "@id": personNode["@id"] }, isPartOf: { "@id": `${origin}/#website` } },
    personNode, breadcrumbSchema(crumbs)
  ] };
  return `<!doctype html>
<html lang="en">${head({ title: "Technical SEO and Content Audit Example | PaulWrites", description, canonical, prefix: "../../", schema })}
<body class="service-page audit-example-page">
${header("../../", "services")}
<main id="main" tabindex="-1">
  <div class="container">${breadcrumbs(crumbs)}</div>
  <article>
    <header class="service-hero container">
      <p class="kicker">Anonymized audit example</p>
      <h1>What a technical SEO and content audit reveals.</h1>
      <p class="service-lede">A website can look finished while leaving important questions unanswered. In this review, I found promoted pages that did not load, conflicting product claims, and feature explanations that needed a clearer route to action.</p>
      <p class="audit-disclosure">Business details have been generalized. This example presents findings and recommendations; implementation and growth results are not claimed.</p>
      <div class="actions"><a class="button button-primary" href="../../index.html?project=audit#contact">Discuss your website</a><a class="button button-secondary" href="#findings">See the findings</a></div>
      <p class="audit-byline">By <a href="../../authors/paul-shannon/index.html" rel="author">Paul Shannon</a></p>
    </header>

    <section class="audit-context container" aria-labelledby="review-heading">
      <div><p class="small-label">Scope</p><h2 id="review-heading">What I reviewed</h2><p>I compared the website’s advertised destinations with the pages visitors could reach, examined initial and rendered HTML, and checked consistency across marketing, support, policy and public product information. The review also considered internal links and the path to the main action.</p><p>These are historical observations from a public website review. Private analytics and search-account data were unavailable, so I did not estimate lost revenue or conclude that every affected page was absent from search.</p></div>
      <dl class="audit-facts"><div><dt>Website type</dt><dd>Consumer software</dd></div><div><dt>Work</dt><dd>Technical SEO and content audit</dd></div><div><dt>Deliverable</dt><dd>Prioritized repair plan and copy recommendations</dd></div></dl>
    </section>

    <section class="section section-muted" id="findings" aria-labelledby="findings-heading"><div class="container">
      <p class="small-label">Selected findings</p><h2 id="findings-heading">Three issues that shaped the plan.</h2>
      <div class="audit-findings">
        <section><span class="route-number" aria-hidden="true">01</span><h3>Promoted pages did not deliver their promised content</h3><dl><div><dt>What I found</dt><dd>Feature and comparison destinations rendered a missing-page screen, while their server responses reported success.</dd></div><div><dt>Why it mattered</dt><dd>A visitor could follow a promising link and receive neither an explanation nor a useful next step.</dd></div><div><dt>What I recommended</dt><dd>Reconcile the URL inventory, remove unfinished pages from discovery files, and publish verified feature pages with appropriate responses.</dd></div></dl></section>
        <section><span class="route-number" aria-hidden="true">02</span><h3>Product promises and supporting information disagreed</h3><dl><div><dt>What I found</dt><dd>A prominent capability claim conflicted with documented limitations. Rating data and commercial terms also needed reconciliation.</dd></div><div><dt>Why it mattered</dt><dd>Readers could form an inaccurate expectation of what the product could establish or what a plan included.</dd></div><div><dt>What I recommended</dt><dd>Agree on approved wording with the product owner, identify the supporting evidence, and place material limitations beside the relevant promise.</dd></div></dl></section>
        <section><span class="route-number" aria-hidden="true">03</span><h3>Feature explanations needed a clearer route to action</h3><dl><div><dt>What I found</dt><dd>Broad homepage summaries offered little access to detailed answers about individual tasks.</dd></div><div><dt>Why it mattered</dt><dd>A visitor with one specific question had limited information for deciding whether the product fit.</dd></div><div><dt>What I recommended</dt><dd>Build focused pages with verified workflows, screenshots, limitations and commercial terms, then connect each to the relevant next step.</dd></div></dl></section>
      </div>
    </div></section>

    <section class="section container" aria-labelledby="rewrite-heading">
      <p class="small-label">Illustrative rewrite</p><h2 id="rewrite-heading">Make the claim easier to evaluate.</h2>
      <p class="audit-intro">This newly written example demonstrates the copy approach. It is not a quotation from the reviewed business or a deployed change.</p>
      <div class="audit-rewrite"><div><h3>Before concept</h3><p>“The smartest solution for every situation. Get instant confidence with advanced AI.”</p></div><div><h3>After concept</h3><p>“Review the information you provide in one place, with clear explanations of what the tool can assess and what needs independent confirmation.”</p><p class="audit-supporting">Supporting line: See how the feature works, what information it uses and where its limitations apply.</p></div></div>
      <p class="audit-intro">The recommendation replaces a broad promise with a defined task and a route to supporting detail. Final wording would require verification of the product’s actual behavior.</p>
    </section>

    <section class="section section-muted"><div class="container audit-context">
      <div><p class="small-label">Implementation order</p><h2>How I prioritized the work.</h2><ol class="process-list"><li>Repair missing destinations and verify responses.</li><li>Reconcile capabilities, evidence and commercial terms.</li><li>Improve page identity, internal links and accessible support content.</li><li>Build detailed pages for verified features.</li></ol><p>Measurement would follow the relevant journey: search visibility, qualified visits, CTA clicks and downstream activation or purchases. Those are separate outcomes.</p></div>
      <div><p class="small-label">The working deliverable</p><h2>From findings to a usable plan.</h2><p>The audit supplied a finding register, URL action inventory, copy proposals, page recommendations, acceptance checks and a staged roadmap. It defined the proposed changes and how to assess them.</p><p>A business or developer would still need to implement the technical repairs. No traffic, conversion or revenue improvement is asserted here.</p><a class="text-link" href="../../seo-audits/index.html">See the SEO audit scope and deliverables</a></div>
    </div></section>

    <section class="article-cta"><div class="container simple-cta"><div><p class="small-label">Work with me</p><h2>Start with the pages that matter most.</h2><p>Send me your URL, what you sell and the action you want visitors to take. I’ll recommend a scope for the review or an initial repair project.</p></div><a class="button button-primary" href="../../index.html?project=audit#contact">Discuss your website</a></div></section>
  </article>
</main>
${footer("../../")}
</body></html>`;
}

export const auditPreview = (prefix = "../") => `<section class="section container audit-preview" aria-labelledby="audit-preview-heading"><div><p class="small-label">See the approach</p><h2 id="audit-preview-heading">What does an audit uncover?</h2><p>An anonymized example showing how I investigated broken page paths, conflicting claims and gaps in product explanations—and prioritized the recommended repairs.</p></div><a class="button button-secondary" href="${prefix}services/seo-content-audit-example/index.html">Read the audit example</a></section>`;
