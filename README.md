# PaulWrites.net

PaulWrites is a deliberately lightweight static site built with ordinary HTML, CSS, and JavaScript. It has no framework, runtime database, account system, or CMS dependency. The production build contains server-visible HTML for every important page.

## Open the source site

Open `index.html` in a browser. The homepage, inquiry form, portfolio filters, and automatic portfolio pagination work from local files. An internet connection is required only for external publications and Formspree submission.

## Content architecture

- `posts.js` is the structured portfolio library and the first place to add a new record.
- `scripts/site-content.mjs` holds expanded, page-specific editorial content for the current work and service pages.
- `scripts/generate.mjs` generates the portfolio index, every `/work/[slug]/` page, services, author page, and sitemap.
- `styles.css` is the shared responsive design system.
- `public/images/work/` contains local optimized featured images.
- `public/downloads/` contains the three research PDFs.

The current build generates 28 permanent work pages, three dedicated service pages, a services index, and Paul’s author/entity page. The complete portfolio remains visible in the initial HTML; JavaScript adds filtering and eight-item pagination without becoming a crawlability requirement.

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
3. Run `pnpm run build`. The generator creates the permanent work page, updates the portfolio HTML and sitemap, and writes the deployable site to `dist/`.
4. Run `pnpm run check` before publishing.

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

The automated audit verifies 38 canonical pages, 28 unique article images, metadata, JSON-LD parsing, one H1 per page, local link integrity, PDFs, sitemap coverage, robots directives, redirects, and the absence of retired contact or placeholder language.

## Important implementation boundary

Article views and likes are intentionally absent. A shared count that survives sessions requires a persistent server-side or serverless datastore and an endpoint that can reject duplicate/bot activity. A browser-only `localStorage` counter would not be reliable and is not included.

## Deployment

`.openai/hosting.json` publishes `dist/`. The included redirect file consolidates legacy `.html`, `/about`, `/work`, and related routes onto their canonical destinations. Publishing this repository does not itself change PaulWrites.net DNS.

See `QA.md`, `SEO_AUDIT.md`, `IMAGE_CREDITS.md`, and `EASTER_EGGS.md` for release documentation.
