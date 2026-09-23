# PaulWrites.net

PaulWrites is a deliberately lightweight static site built with ordinary HTML, CSS, and JavaScript. It has no framework, runtime database, account system, or CMS dependency. The production build contains server-visible HTML for every important page.

## Open the source site

Open `index.html` in a browser. The homepage, inquiry form, portfolio filters, and automatic portfolio pagination work from local files. An internet connection is required only for external publications and Formspree submission.

## Content architecture

- `posts.js` is the structured portfolio library and the first place to add a new record.
- `scripts/site-content.mjs` holds expanded, page-specific editorial content for the current work and service pages.
- `content/articles/` contains structured full-text blocks for independently published work and authorized client portfolio editions.
- `content/research/` contains text extracted from the three supplied research PDFs; `scripts/research-parser.mjs` turns it into semantic report sections.
- `scripts/generate.mjs` generates the portfolio index, every project overview, every reading page, services, author page, RSS feed, reading-time map, redirects, and sitemap.
- `styles.css` is the shared responsive design system.
- `public/images/work/` contains local optimized featured images.
- `public/downloads/` contains the three research PDFs.

The current build generates three distinct portfolio layers:

1. `/portfolio/` is the complete, crawlable library. JavaScript progressively adds filtering and eight-item pagination.
2. `/work/[slug]/` is the project overview: subject, key findings or ideas, audience, Paul’s role, process, and source context.
3. `/work/[slug]/article/` or `/work/[slug]/report/` is the dedicated reading experience.

The build currently contains 28 overview pages and 28 reading pages, in addition to three dedicated service pages, a services index, and Paul’s author/entity page. It renders 24 complete article editions—17 independently published pieces and seven authorized Workinman client articles—plus three complete semantic research reports. The one record without a verified matching source, Sustainable585 Issue #2, deliberately remains an original guide.

## Add a portfolio item

Add one object to `window.PAULWRITES_ITEMS` in `posts.js`:

```js
{
  id: "descriptive-stable-id",
  title: "Article or project title",
  date: "2026-09-22",
  type: "Article",
  publisher: "Publication or client",
  summary: "A concise, original description of the work.",
  projectContext: "Paul’s role, source material, collaboration, setting, or editorial challenge.",
  readingMinutes: 5,
  image: "public/images/work/descriptive-image.webp",
  imageAlt: "An accurate description of the image",
  tags: ["Technology", "SEO & Content"],
  url: "https://example.com/original-work",
  featured: false
}
```

Then:

1. Add a unique, licensed image to `public/images/work/` and record its source in `image-credits.html` and `IMAGE_CREDITS.md`.
2. Add a matching entry to `WORK_PAGE_CONTENT` in `scripts/site-content.mjs` when richer project detail is available. The generator has a safe fallback, but important work should receive specific content.
3. If Paul owns the complete edition, add `content/articles/[id].json` with `reproduction: "complete-owned-web-edition"`. For client work with documented reproduction permission, use `authorized-client-portfolio-edition` and retain the original publisher/source fields. Without a complete-content record, the generator deliberately creates a publisher-protected guide rather than implying permission.
4. Run `pnpm run build`. The generator creates the overview and reading routes, recalculates reading time from the actual text, and updates the portfolio, feed, redirects, sitemap, and deployable `dist/` directory.
5. Run `pnpm run check` before publishing.

Dates use `YYYY-MM-DD`. When only a year is known, use January 1 and add `datePrecision: "year"`; visible pages will show only the year.

## Contact form

The homepage posts directly to `https://formspree.io/f/mwpvgolv` and displays `pshannon@paulwrites.net` as the email alternative.

The frontend includes Formspree’s `_gotcha` honeypot, a minimum completion time, native validation, field-length limits, and duplicate-submit prevention. Formspree’s server-side spam controls remain account settings and are not overstated here.

## Build and verify

```bash
pnpm run generate
pnpm run build
pnpm run check
```

`pnpm run build` already runs the generator. The explicit generate command is useful while editing content. `dist/` is the deployable static package.

The automated audit verifies 66 canonical pages, 28 byte-distinct article images, every overview-to-reading path, complete research structure, rights disclosures, metadata, JSON-LD parsing, one H1 per page, local link integrity, PDFs, RSS and sitemap coverage, robots directives, redirects, and the absence of retired contact or placeholder language.

`scripts/import_workinman.py` is a development-only refresh utility for the seven authorized public Workinman articles. The generated JSON files are committed, so running the site or adding ordinary portfolio records does not require Python, lxml, curl, a package install, or a network request.

## Important implementation boundary

Article views and likes are intentionally absent. A shared count that survives sessions requires a persistent server-side or serverless datastore and an endpoint that can reject duplicate/bot activity. A browser-only `localStorage` counter would not be reliable and is not included.

## Deployment

`.openai/hosting.json` publishes `dist/`. The included redirect file consolidates legacy `.html`, `/about`, `/work`, and related routes onto their canonical destinations. Publishing this repository does not itself change PaulWrites.net DNS.

See `QA.md`, `SEO_AUDIT.md`, `CONTENT_RIGHTS.md`, `IMAGE_CREDITS.md`, and `EASTER_EGGS.md` for release documentation.
