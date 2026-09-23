# PaulWrites release QA

Release checked on September 23, 2026.

## Automated crawl and build

`pnpm run build && pnpm run check` completed without errors.

### September 23 corrective pass

- The homepage hero now uses one consistent display weight, including the words “and” and “for,” while retaining selective color emphasis.
- Overview summary grids size to their content instead of stretching into empty gray panels; summary cards provide short information scent and the sections below expand on that material rather than repeating it verbatim.
- The phytoremediation overview contains the full Interpretation and Limitations text and no orphaned numeric paragraph after Management & Adverse Effects.
- Every non-decorative figure embedded in the three supplied research PDFs is represented on its respective HTML report: three climate/HAB figures, six rhizofiltration figures, and the phytoremediation paper's two embedded figures alongside its accessible HTML reconstruction of Table 1.
- Every research visual has a descriptive caption, a visible source/citation, and a source-document link; the new raster extracts are local WebP assets.
- Scientific binomials and supported abbreviated forms are italicized in body copy, summaries, metadata, tables of contents, project notes, and dynamically rendered portfolio text, while bold display titles retain their intended title styling.
- The freelance-writer article image caption now correctly identifies hardcover books rather than notebooks.
- Automated regressions now reject clipped summary text, missing expected research figures, loose numeric paragraphs, the incorrect caption, inconsistent hero weight, and unitalicized scientific names outside title contexts.

- 66 canonical/indexable HTML pages validated.
- 28 of 28 portfolio records have a permanent `/work/[slug]/` overview and a separate `/article/` or `/report/` reading page.
- 24 complete article editions are rendered from structured content, including all seven authorized Workinman articles.
- All three supplied research papers are rendered as complete semantic HTML reports, with their PDFs retained as secondary source documents.
- 28 of 28 portfolio records use a distinct featured-image file.
- All seven Workinman entries have different, assignment-specific project notes.
- All three research PDFs exist and have valid PDF headers.
- Every canonical page has one H1, a unique title, a unique meta description, a self-referencing canonical, Open Graph data, Twitter/X data, a skip link, and a main landmark.
- Current canonical title tags are 20–78 characters and meta descriptions are 66–158 characters; none rely on duplicate boilerplate.
- Every JSON-LD block parses successfully.
- All generated pages connect to the same Paul Shannon Person `@id`.
- Every work page includes visible and structured breadcrumbs, an author box, a publication/source note, relevant service link, and three related works.
- Every local HTML `href` and `src` resolves to a real source target.
- The deployable `dist/` tree is crawled separately, including clean-route aliases; `/portfolio/`, `/privacy/`, `/accessibility/`, and `/image-credits/` retain working relative CSS, scripts, images, and navigation.
- The sitemap contains all 66 canonical URLs; robots.txt allows crawling and references it.
- Canonical redirect rules exist for legacy `.html`, `/about`, `/work`, `/articles`, and information-page routes.
- No retired `inquirewithps@gmail.com`, placeholder wording, lorem ipsum, hardcoded view totals, or fake like totals remain.

## Browser and interaction checks

- Opened the homepage, portfolio, two work pages, a service page, and the author page by direct URL.
- Verified primary images load at their declared 1200×750 dimensions.
- Verified article pages have one H1, parsed schema, three relevant recommendations, and no document overflow.
- Portfolio enhancement shows 8 records per page and generates four pages for the 28-item library.
- The Research filter returns the correct three projects and updates the URL state.
- Project details expand in place and expose the correct project-specific context.
- The inquiry-type selector updates its guidance and project-detail prompt.
- Confirmed the Formspree endpoint and current contact email in rendered markup.
- Confirmed the skip link is the first keyboard focus target and navigates to `#main`.
- No site-origin console warning or error was found. Browser-extension diagnostics were unrelated to the site.
- The live form was not submitted, so no test message or visitor data was sent.

## Responsive checks

The homepage, portfolio, and a long research page were rendered inside true nested browser viewports at 320, 375, 390, 430, 768, 1024, and 1440 CSS pixels.

- `scrollWidth` never exceeded `clientWidth` on any tested page or width.
- All 21 page/width combinations contained exactly one H1.
- Header links and primary controls measured at least 44px high.
- The homepage hero and research-page header collapse to one column below the intended breakpoint and return to two columns on desktop.
- The 320px homepage and research article were visually inspected.
- Long scientific titles, breadcrumbs, publication metadata, images, filters, buttons, and footer/navigation content wrap without clipping.

## Content and rights safeguards

- All seven Workinman pages reproduce their complete public-facing article text under Paul’s stated portfolio permission. Visible metadata and JSON-LD identify Paul Shannon as author and Workinman Interactive as original publisher.
- Sustainable585 Issue #2 remains an original guide because its supplied URL resolves to a different issue; it makes no false full-text claim and exposes no incorrect original link.
- The three research overview pages summarize the actual supplied papers; their reading pages contain the full semantic reports and link the complete PDFs.
- Research findings include stated scope and limitations and do not invent new outcomes.
- Every non-client featured image is recorded with its source/license; the Workinman images identify their corresponding publisher pages.
- Image files are local WebP assets with explicit dimensions and descriptive alt text.

## Performance checks

- The site has no framework runtime, database client, analytics script, webfont request, animation library, or third-party JavaScript bundle.
- Runtime JavaScript is limited to the portfolio enhancement and contact-form behavior.
- Featured images have fixed dimensions; below-the-fold images lazy-load; the homepage hero is preloaded; layouts reserve image space.
- The largest current work image is below 400 KB, with most considerably smaller.
- A local Lighthouse score could not be produced because the build environment does not expose a Lighthouse-compatible Chrome executable, and the verified preview is private. This is recorded as a post-launch check rather than replaced by a fabricated score.

## Deliberately not implemented

- **Article views:** not implemented. This static architecture has no persistent shared datastore.
- **Article likes:** not implemented. A one-browser-only counter would not meet the requirement and was not added.

A future implementation needs a serverless/API endpoint plus persistent storage, bot/rate controls, and an anonymous-identity/privacy policy before either count should appear publicly.
