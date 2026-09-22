# PaulWrites.net

This is a deliberately simple static site: ordinary HTML, CSS, and JavaScript. It has no framework, database, CMS, or required installation.

## Open the site

Double-click `index.html`.

The homepage, portfolio filters, automatic pagination, and contact form all use relative files and work without running a local server. An internet connection is only needed to open external portfolio links, download remote pages, or submit the Formspree inquiry form.

## Add a portfolio or article entry

Open `posts.js`. Copy this familiar five-field object into `window.PAULWRITES_ITEMS` and edit the values:

```js
{
  title: "Article or project title",
  description: "One useful sentence about the work.",
  link: "https://example.com/the-work",
  date: "September 22, 2026",
  tags: ["Technology", "SEO & Content"],
}
```

That is enough for a basic article. For the complete visual portfolio treatment, use the richer fields already present in the file:

```js
{
  id: "descriptive-stable-id",
  title: "Article or project title",
  date: "2026-09-22",
  type: "Article",
  publisher: "Publication or client",
  summary: "The concise card summary.",
  projectContext: "The role, source material, collaboration, setting, or editorial challenge.",
  readingMinutes: 5,
  image: "public/images/work/descriptive-image.webp",
  imageAlt: "A useful description of the image",
  tags: ["Technology", "SEO & Content"],
  url: "https://example.com/the-work",
  linkLabel: "Read the article",
  featured: false
}
```

The loader also supports `datePrecision`. It accepts either a written date or `YYYY-MM-DD`. If only the year is known, use January 1 and add `datePrecision: "year"`; the page will show only the year. The portfolio automatically:

- sorts records newest first;
- creates filters from the tag list;
- shows eight records per page;
- adds more numbered pages as the list grows;
- creates a stable `#id` link from the title when an ID is not supplied.

Place local thumbnails in `public/images/work/`. Keep the files reasonably small, use WebP when practical, and record third-party image sources and licenses in both `image-credits.html` and `IMAGE_CREDITS.md`.

The current HTML contains a static list of the initial 28 records for crawlability and no-JavaScript access. `posts.js` becomes the display source when JavaScript is available. After adding important new records, also add their title/link to the static list in `portfolio.html` so search engines and no-JavaScript visitors receive the same library.

## Contact form

The homepage posts directly to:

`https://formspree.io/f/mwpvgolv`

Anti-bot measures in the site include Formspree’s `_gotcha` honeypot, a minimum completion time, native field validation, length limits, and duplicate-click prevention. Formspree’s own spam filtering remains server-side. CAPTCHA or stricter filtering can be enabled in the Formspree dashboard if needed; this repository does not claim those account settings are enabled.

To change the destination, replace the form `action` in `index.html`.

## Main files

```text
index.html          Homepage, services, about, and inquiry form
portfolio.html      Crawlable initial portfolio list
posts.js            Editable portfolio/article data
portfolio.js        Filtering, sorting, and automatic pagination
site.js             Contact-form prompts and bot timing check
styles.css          Complete responsive design
public/downloads/   Three research papers
public/images/work/ Local portfolio thumbnails
image-credits.html  Public source and license credits
SEO_AUDIT.md        Launch audit and next-step SEO plan
QA.md               Test record
```

## Optional deployment checks

Opening the site does not require Node. Node is used only for the optional production copy and automated checks:

```bash
npm run build
npm run check
```

The `dist/` directory is the deployable copy. The included Sites configuration is for a private preview and does not alter PaulWrites.net DNS.
