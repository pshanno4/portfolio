# PaulWrites.net SEO and AI-search audit

Audit date: September 22, 2026  
Scope: finished static site source, production build, private preview, portfolio data, metadata, structured data, internal links, images, mobile behavior, and deployment files.

## Unbiased score: 7.8/10

This is a launch-readiness score, not a promise of rankings. The site has strong technical fundamentals for a small static portfolio, unusually clear positioning, and credible first-party evidence. It loses points because most portfolio evidence still lives on one filterable page or on third-party publications, there is no dedicated Paul Shannon entity page, and no Search Console or field-performance data is available yet.

| Area | Score | What the score means |
| --- | ---: | --- |
| Crawlability and technical foundations | 1.9 / 2.0 | Static HTML, robots.txt, XML sitemap, canonicals, redirects, 404 handling, and crawlable fallback links are present. Final production status/header behavior still needs verification on PaulWrites.net. |
| Titles, descriptions, headings, and semantics | 1.4 / 1.5 | Pages have unique titles/descriptions, one H1, useful headings, landmarks, and descriptive links. The site has only a small number of independently indexable pages. |
| Portfolio content and information architecture | 1.2 / 2.0 | Twenty-eight records are well organized, dated, tagged, illustrated, summarized, and linked. Individual projects do not yet have owned HTML URLs, so Google cannot rank most pieces as distinct PaulWrites pages. |
| Entity clarity and AI-search readiness | 1.0 / 1.5 | The homepage clearly establishes Paul, location, expertise, education, and experience; Person references use one stable `@id`. A canonical author/ProfilePage and verified `sameAs` links are still missing. |
| Images, performance, and mobile | 1.15 / 1.25 | Local WebP images, explicit dimensions, alt text, lazy loading, an eager first portfolio image, and a preloaded hero image are implemented. Real-user Core Web Vitals are not available before public launch. |
| Accessibility and conversion UX | 0.95 / 1.0 | Keyboard-visible controls, skip links, semantic form labels, 44px primary portfolio controls, reduced motion, clear project routes, and a direct-email fallback are present. |
| Measurement and external authority | 0.2 / 0.75 | There is credible work and original research, but no verified Search Console data, index coverage, query data, or documented backlink/citation baseline yet. |

## What is already strong

### Crawlability and ordinary SEO

- Important positioning, services, experience, and portfolio links are rendered as ordinary HTML.
- The portfolio has a complete 28-item fallback list before JavaScript enhancement. Filters and pagination do not gate access to the source links.
- `robots.txt` allows crawling and points to `sitemap.xml`.
- Five indexable site pages have self-referencing canonicals; the 404 is `noindex,follow`.
- Route aliases such as `/work`, `/articles`, `/services`, `/about`, and `/contact` have redirects.
- Page titles and meta descriptions are specific rather than slogan-led.

### Portfolio evidence

- Every item has a title, date, publisher, type, summary, tags, image, descriptive alt text, estimated reading time, direct source, and expandable project context.
- Workinman pieces explain the multidisciplinary studio process without inventing metrics or outcomes.
- Research items identify the actual setting: Hudson Falls High School through UAlbany’s Science Research in the High School program, the Climate Solutions Accelerator, and Nazareth University.
- Research PDFs are local and remain directly accessible.
- Third-party articles are summarized and linked rather than copied in full.

### Images and rights handling

- The seven Workinman records use the corresponding publisher thumbnail.
- Other records use public-domain or Creative Commons images, stored locally as compressed WebP files.
- A public image-credit page records creators, source pages, and licenses.
- Images have explicit width and height attributes, useful alt text, and below-the-fold lazy loading.

### Entity and structured data

- The homepage includes `WebSite`, `Person`, and `ProfessionalService` JSON-LD.
- The portfolio includes `CollectionPage` and refers to the same Paul Shannon `Person` identifier.
- Visible content and structured data agree on Paul’s role, location, education, and areas of expertise.
- No ratings, testimonials, prices, awards, or outcomes are fabricated in schema.

### AI-search fundamentals

- The site uses concrete passages and clear headings instead of keyword-stuffed copy.
- Claims about work sit near supporting project summaries, source links, dates, and publishers.
- Original environmental research gives the site evidence that generic portfolio copy cannot reproduce.
- The architecture does not rely on `llms.txt`, fake “AI schema,” mass-generated articles, or doorway pages.

## Material limitations

1. **Most work does not have an owned, indexable detail page.** Hash links such as `portfolio.html#games-for-brands` point into one document; they are not separate search results. This is the largest SEO and AI-retrieval limitation.
2. **The richest project context is JavaScript-enhanced.** Google can render JavaScript, but owned static project pages would make the evidence easier for more crawlers and answer systems to retrieve reliably.
3. **There is no canonical author page.** The homepage identifies Paul well, but `/authors/paul-shannon/` with visible biography and `ProfilePage` + `Person` data would create a stronger stable entity node.
4. **No verified identity links are available.** A real LinkedIn profile, ORCID, institutional profile, or other verified identity URL should be added only after Paul confirms it.
5. **No production search data exists yet.** The audit cannot verify index coverage, query impressions, click-through rate, backlinks, or real Core Web Vitals before public launch and Search Console verification.
6. **The sitemap covers site pages, not portfolio detail URLs.** That is appropriate for the current architecture but limits the number of owned pages that can rank.
7. **Preview and canonical origins differ by design.** The private preview uses a ChatGPT Site URL while canonicals point to `https://paulwrites.net/`. After domain launch, the custom-domain response, redirects, and canonical consistency must be rechecked.

## Action plan for the next go

### Priority 1 — highest search impact

| Action | Impact | Effort | Done when |
| --- | --- | --- | --- |
| Generate owned static pages at `/work/[slug]/` from `posts.js` for the three research projects and seven Workinman pieces first | Very high | Medium | Each page has unique visible context, title, description, canonical, image, role, source link, related work, and appropriate CreativeWork/Article schema. |
| Add `/authors/paul-shannon/` | High | Low–medium | The page visibly contains Paul’s role, location, expertise, education, experience, representative work, contact details, and `ProfilePage` + `Person` JSON-LD using the existing Person `@id`. |
| Put every new work URL in the sitemap and link it from the portfolio, services, homepage, and author page where relevant | High | Low | No important project page is orphaned; internal anchors describe the destination. |
| Render project context in the initial HTML of each owned work page | High | Medium | The useful passage is available without client-side JavaScript and can be retrieved as a standalone answer source. |

Do not create 28 thin pages automatically. A page should exist only when there is enough distinct context, proof, and reader value to justify it.

### Priority 2 — launch measurement and validation

1. Verify a **Domain property** for `paulwrites.net` in Google Search Console, preferably through DNS.
2. Submit `https://paulwrites.net/sitemap.xml` and confirm that Google can fetch it.
3. Inspect the homepage, portfolio, author page, and two representative work pages with URL Inspection after launch.
4. Validate JSON-LD with Google’s Rich Results Test and Schema.org’s validator; fix errors, but do not add irrelevant properties merely to eliminate optional warnings.
5. Record a baseline for indexed pages, impressions, clicks, click-through rate, and the queries that reach the site.
6. Run PageSpeed Insights on mobile and desktop after the public domain has stable caching. Check LCP, INP, and CLS using field data when it becomes available.

### Priority 3 — deepen evidence and conversion

- Add permission-safe excerpts, research questions, methods, editorial decisions, limitations, and deliverable context to owned work pages.
- Add concrete outcomes only when documented. Do not invent traffic, conversion, ranking, readership, or revenue figures.
- Cross-link services to the strongest relevant work and each work page back to one relevant service route.
- Add verified identity URLs to the Person entity after Paul supplies them.
- Seek legitimate links from client author pages, institutional research profiles, project partners, or publications where editorially appropriate. Do not manufacture mentions.
- Create a lightweight “selected work” configuration in `posts.js` only; do not turn every record into homepage content.

### Priority 4 — technical refinement

- Consider extensionless canonical URLs only if the deployment can support consistent 301 redirects and there is no risk of creating duplicate `.html` and extensionless versions.
- Generate sitemap `<lastmod>` values from the content records once work pages exist.
- Add page-specific Open Graph images and Article/CreativeWork metadata to owned detail pages.
- Consider an `ItemList` on the portfolio page after detail pages have stable owned URLs.
- Re-test at 320, 375, 390, 430, 768, 1024, and 1440 pixels after any template change.
- Monitor broken external publication links periodically; keep the owned context useful if a third-party URL disappears.

## Research basis

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: Optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images)
- [Google SEO guide for web developers](https://developers.google.com/search/docs/fundamentals/get-started-developers)
- [Google ProfilePage structured-data guidance](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Google structured-data introduction and guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google Search Console getting-started guidance](https://developers.google.com/search/docs/monitor-debug/search-console-start)
- [web.dev Core Web Vitals guidance](https://web.dev/articles/vitals)

The research supports a conventional conclusion: strong AI-search visibility starts with crawlable, useful, well-linked content and a stable entity—not a separate collection of “GEO hacks.”
