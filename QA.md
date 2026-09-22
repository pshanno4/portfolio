# Quality assurance record

Release checked on September 22, 2026.

## Automated checks

- The production copy builds successfully from the root HTML/CSS/JS files.
- `posts.js` contains 28 unique records: 7 Workinman pieces, 3 research papers, and 18 additional published articles.
- Every record has a valid ID, date, summary, direct link, tag list, local image, descriptive alt text, reading-time estimate, and expandable project context.
- All 20 local WebP files exist; every one of the 28 records resolves to one of them.
- All three research PDFs exist and have valid PDF headers.
- Every public HTML page has one H1, a unique title, a description where appropriate, a skip link, a main landmark, and the intended robots/canonical behavior.
- Every local `href` and `src` in the public HTML resolves to a real source file.
- Homepage and portfolio JSON-LD parse as valid JSON.
- The current `pshannon@paulwrites.net` address is present, and retired launch-only wording is absent.
- The Formspree endpoint, honeypot, timing field, and eight problem-based inquiry choices are present.
- `sitemap.xml`, `robots.txt`, redirects, reduced-motion CSS, print CSS, image credits, SEO audit, and deployment output are present.

Run the same checks with:

```bash
npm run build
npm run check
```

Node is optional and is not needed to open or use the source site.

## Browser checks

- Rendered and inspected the homepage, portfolio, privacy statement, accessibility statement, image-credit page, and 404 page.
- Confirmed one visible H1 on every page.
- Confirmed the portfolio initially shows 8 of 28 records and automatically creates 4 pages.
- Tested the Research filter: it returns exactly 3 records and updates the address to `?tag=Research`.
- Tested portfolio page 2: it shows records 9–16 and updates the address to `?page=2`.
- Tested the Project notes control: it changes to “Hide project notes,” reports `aria-expanded="true"`, and reveals the correct Workinman studio context.
- Tested the SEO inquiry route: its help text, question label, and Formspree subject update correctly.
- Confirmed all seven Workinman article URLs and all LinkedIn article URLs return successfully. Medium rejects automated HTTP checks, but the ENGin article and exact URL were independently verified in search.
- Did not submit the external contact form, so no test message or personal data was sent.
- No site-origin console warnings or errors were found. Browser-extension and sign-in-page diagnostics were unrelated and excluded.

## Responsive checks

The homepage and portfolio were rendered at 320, 375, 390, 430, 768, 1024, and 1440 CSS pixels.

- Document `scrollWidth` equaled `clientWidth` at every tested width: no horizontal document overflow.
- The 320px homepage and portfolio were visually inspected.
- The image-led hero remains readable at narrow and wide widths with adequate overlay contrast.
- Every portfolio thumbnail keeps its intended 8:5 crop without stretching.
- Topic buttons become one compact topic selector at tablet and phone widths.
- Read and Project notes controls measure 44px high at every tested portfolio width.
- Navigation remains available without a mobile-menu script.
- Long titles, date rows, tags, form fields, and calls to action wrap without clipping.
- The form stacks into one column on narrow screens and remains within the viewport at every tested width.
- Reduced-motion and print behavior are included.

## Content and implementation safeguards

- Workinman and third-party articles are summarized and linked; their complete text is not republished.
- Workinman thumbnails remain credited to the publisher/rights holders.
- Other portfolio images are public domain or Creative Commons; source pages and licenses are published in `image-credits.html` and recorded in `IMAGE_CREDITS.md`.
- Research summaries do not invent new findings, credentials, clients, testimonials, permissions, or results.
- Important positioning, services, experience, identity, and portfolio links exist in the initial HTML.
- Portfolio filtering is an enhancement: the initial 28-item HTML list remains useful without JavaScript.
- All runtime assets use relative paths so `index.html` can be opened directly from the filesystem.

## Deployment boundary

- A private Sites deployment was created and completed successfully.
- PaulWrites.net DNS was not changed.
- Canonicals intentionally point to `https://paulwrites.net/`; recheck HTTP status, redirects, canonicals, Search Console, and field Core Web Vitals after the custom domain is connected.
