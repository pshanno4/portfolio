# PaulWrites.net SEO and AI-search audit

Audit date: September 23, 2026
Scope: finished static source and production build, 28 project overviews, 28 full reading pages, services, author entity, portfolio, internal linking, metadata, structured data, images, mobile behavior, robots, sitemap, redirects, and deployment configuration.

## Unbiased implementation score: 9.0/10

This is a technical and content-readiness score, not a promise of rankings. PaulWrites now has a strong small-publication architecture, clear subject expertise, original research, a crawlable overview for every current project, and a separate reading URL for every piece. Remaining points depend mostly on post-launch indexing evidence, real-user performance data, verified identity links, and external authority.

| Area | Score | Assessment |
| --- | ---: | --- |
| Crawlability and technical foundations | 1.9 / 2.0 | Static server-visible HTML, clean canonical URLs, robots.txt, a 66-URL sitemap, legacy redirects, direct-entry pages, and a real 404 file are present. Production response headers and redirects still require a final check on the custom domain. |
| Titles, descriptions, headings, and semantics | 1.45 / 1.5 | Canonical pages have unique titles and descriptions, one H1, semantic landmarks, useful headings, social metadata, descriptive links, and visible breadcrumbs where appropriate. |
| Portfolio content and information architecture | 1.9 / 2.0 | Every current item has separate discovery, overview, and reading layers, a unique image, project context, source attribution, related work, author connection, and service route. Twenty-four articles and three reports are complete on-site editions; one unverifiable source remains a transparent guide. |
| Entity clarity and AI-search readiness | 1.4 / 1.5 | A stable Paul Shannon ProfilePage/Person entity, consistent author IDs, expertise passages, first-party research, nearby evidence, and strong internal relationships are implemented. Workinman articles distinguish author from publisher. Verified `sameAs` identity links have not been supplied. |
| Images, performance, and mobile | 1.15 / 1.25 | Local WebP files, unique article imagery, dimensions, lazy loading, hero preload, minimal JavaScript, and zero overflow across the seven required widths are verified. Field Core Web Vitals and a public Lighthouse run are not yet available. |
| Accessibility and conversion UX | 0.95 / 1.0 | Skip navigation, keyboard focus, semantic controls, 44px controls, reduced motion, readable article widths, direct email, and a problem-based Formspree inquiry route are present. A formal third-party WCAG audit remains worthwhile. |
| Measurement and external authority | 0.25 / 0.75 | The content provides credible first-party evidence, but Search Console coverage, query data, backlinks/citations, and field performance cannot exist until the revised public site is launched and measured. |

## Implemented strengths

### Crawlability and indexable page inventory

- All important content is present in the initial HTML; JavaScript is not required to discover or read the work pages.
- Every current portfolio record has a permanent `/work/[slug]/` overview and a separate `/article/` or `/report/` reading URL.
- The portfolio’s full 28-item library remains in server-visible HTML before filters and pagination enhance it.
- The sitemap contains the homepage, portfolio, services index, three service pages, author page, all 28 work overviews, all 28 reading pages, and public information pages.
- robots.txt permits crawling and names the sitemap.
- Self-referencing canonicals consistently use the non-www HTTPS origin.
- Legacy `.html`, `/about`, `/articles`, and portfolio-index routes consolidate through redirects where the hosting layer supports the included rules.

### Portfolio and research evidence

- Work overviews state the subject, publication context, Paul’s role, editorial or research approach, and source-publication relationship in a scannable format.
- Seventeen independently published articles and all seven authorized Workinman articles are available as complete, indexable on-site editions.
- Workinman reading pages visibly and structurally identify Paul Shannon as author and Workinman Interactive as original publisher while preserving the original publisher URL.
- Workinman notes are individually written around each assignment’s audience, subject, workflow, and studio collaboration.
- Research pages turn PDFs into readable HTML covering the question, methods, findings, interpretation, limitations, setting, Paul’s role, and access to the source paper.
- Regional HAB work accurately names the nine-county scope and the NYSDEC, NOAA, and USDA NRCS data sources.
- Rhizofiltration work identifies Hudson Falls High School and the University at Albany Science Research in the High School program.
- The phytoremediation review identifies its Nazareth University context and compares the actual macrophytes and feasibility constraints in the supplied paper.

### Service intent and internal linking

- `/environmental-science-writer/`, `/technical-writer/`, and `/seo-content-writer/` each have distinct intent, expertise, deliverables, process, portfolio proof, FAQs, schema, and CTAs.
- Environmental pages connect to HAB, freshwater, remediation, and research work.
- Technical pages connect to relevant interactive-media and B2B client projects.
- SEO pages connect to research-led editorial examples rather than generic keyword claims.
- Every work page links to one relevant service and three genuinely related works.
- Homepage, services, portfolio, author profile, research, and inquiry routes form a connected architecture with no important orphan pages.

### Metadata and structured data

- All 66 canonical pages have unique titles, unique meta descriptions, canonical tags, Open Graph data, and Twitter/X card data.
- `WebSite`, `ProfessionalService`, `Person`, `ProfilePage`, `CollectionPage`, `Service`, `FAQPage`, `Article`, `ScholarlyArticle`, and `BreadcrumbList` appear only where the visible page supports them.
- Every article/research page points to one canonical Paul Shannon Person `@id`.
- No reviews, ratings, prices, testimonials, outcomes, or credentials are invented in structured data.

### AI-search fundamentals

- Important claims are stated in clear passages with nearby methods, limitations, source links, authorship, and project context.
- Original research and client-process evidence give retrieval systems specific material that generic service copy does not.
- Content relationships are explicit: work → author, work → related work, work → service, service → proof.
- The implementation uses conventional crawlability and entity clarity rather than fake AI schema, mass-generated articles, or `llms.txt` claims.

## Remaining limitations

1. **Post-launch index evidence is unavailable.** Search Console has not yet confirmed discovery, canonical selection, or index coverage for the new URLs.
2. **One source remains unverified.** Sustainable585 Issue #2 cannot be converted to a complete edition until a matching manuscript or correct original URL is supplied.
3. **No verified identity links were supplied.** A confirmed LinkedIn profile, institutional profile, ORCID, or other authoritative identity page could strengthen the Person entity through truthful `sameAs` links.
4. **No field Core Web Vitals exist for the new page set.** The implementation is lean, but CrUX/real-user data requires public traffic.
5. **External authority cannot be built in code.** Relevant client author credits, university/research profiles, partner references, and editorial links would strengthen trust and discovery.
6. **Views and likes are absent by design.** Accurate shared totals need a persistent backend; fake client-only counts would weaken credibility.

## Action plan after launch

### First 48 hours

1. Verify a Google Search Console Domain property for `paulwrites.net` through DNS if one is not already active.
2. Submit `https://paulwrites.net/sitemap.xml`.
3. Inspect the homepage, portfolio, author page, all three service pages, one Workinman overview and its complete article, and all three research reports with URL Inspection.
4. Confirm the public server returns 200 for canonical pages, 301 for legacy variants, and 404 for a nonexistent URL.
5. Verify HTTP → HTTPS and www → non-www behavior after deployment.
6. Run PageSpeed Insights on the homepage, portfolio, one image-heavy article, and the longest research page; record mobile LCP, CLS, and INP/field availability.

### First month

1. Review index coverage weekly and investigate pages marked duplicate, crawled-not-indexed, or discovered-not-indexed.
2. Use query/impression data to refine titles and openings only when the actual search intent is clear; do not manufacture near-duplicate service pages.
3. Add complete owned article text where Paul has the manuscript and republication rights, preserving the original-publication link and date.
4. Add verified identity URLs to the Person node only after Paul confirms them.
5. Ask relevant clients, research partners, and institutional profiles to link to the most useful owned page where editorially appropriate.
6. Monitor source links and keep the PaulWrites case page useful if an external publication moves or disappears.

### Optional future platform work

- If public view totals are strategically useful, add a small edge/serverless endpoint and persistent datastore with page-load deduplication, crawler filtering, and rate limits.
- Likes need the same persistent layer plus an anonymous cookie/device token, privacy disclosure, and server-side uniqueness enforcement. Describe it accurately as one like per browser identity, not one guaranteed human.
- A future CMS should write into the same content schema and preserve the generated URLs, metadata, and relationships rather than replacing the frontend architecture.

## Research basis

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images)
- [web.dev Core Web Vitals](https://web.dev/articles/vitals)

The practical conclusion remains conventional: useful indexable pages, stable identity, original evidence, descriptive internal links, and accurate claims create the best foundation for both ordinary search and AI-assisted retrieval.
