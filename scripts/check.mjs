import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";

const root = process.cwd();
const dist = path.join(root, "dist");
const origin = "https://paulwrites.net";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const exists = async (target) => {
  try { await access(target); return true; } catch { return false; }
};

const walk = async (directory) => {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walk(target));
    else output.push(target);
  }
  return output;
};

const cleanLink = (value = "") => {
  const text = String(value).trim().replaceAll("\\&", "&").replaceAll("\\_", "_");
  const markdown = text.match(/^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/);
  return markdown ? markdown[1] : text;
};

const dataSource = await readFile(path.join(root, "posts.js"), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(dataSource, context);
const items = context.window.PAULWRITES_ITEMS;

assert(Array.isArray(items), "posts.js must set window.PAULWRITES_ITEMS to an array.");
assert(items.length === 28, `Expected 28 portfolio records; found ${items.length}.`);

const ids = new Set();
const images = new Set();
const imageHashes = new Set();
for (const item of items) {
  for (const key of ["id", "title", "date", "type", "publisher", "summary", "projectContext", "image", "imageAlt"]) {
    assert(item[key], `${item.id || item.title || "A record"} is missing ${key}.`);
  }
  assert(!ids.has(item.id), `Duplicate record id: ${item.id}`);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id), `Invalid id: ${item.id}`);
  ids.add(item.id);
  assert(!images.has(item.image), `Duplicate featured image: ${item.image}`);
  images.add(item.image);
  assert(Array.isArray(item.tags) && item.tags.length > 0, `${item.id} needs at least one tag.`);
  assert(Number.isInteger(item.readingMinutes) && item.readingMinutes > 0, `${item.id} needs a positive reading-time estimate.`);
  assert(!Number.isNaN(Date.parse(item.date)), `Invalid date: ${item.id}`);
  assert(await exists(path.join(root, item.image)), `Missing portfolio image: ${item.image}`);
  const imageHash = createHash("sha256").update(await readFile(path.join(root, item.image))).digest("hex");
  assert(!imageHashes.has(imageHash), `${item.id} reuses another portfolio item’s image bytes.`);
  imageHashes.add(imageHash);
  assert(cleanLink(item.url || item.link) || item.sourceUnavailable === true, `${item.id} needs an original/source URL or an explicit sourceUnavailable flag.`);
}

const workinman = items.filter((item) => item.publisher === "Workinman Interactive");
assert(workinman.length === 7, `Expected seven Workinman records; found ${workinman.length}.`);
assert(new Set(workinman.map((item) => item.projectContext)).size === 7, "Every Workinman project note must be individually written.");

const research = items.filter((item) => cleanLink(item.url || item.link).endsWith(".pdf"));
assert(research.length === 3, `Expected three research PDFs; found ${research.length}.`);
for (const item of research) {
  const pdfPath = path.join(root, cleanLink(item.url || item.link));
  assert(await exists(pdfPath), `Missing source PDF: ${pdfPath}`);
  const pdf = await readFile(pdfPath);
  assert(pdf.subarray(0, 5).toString() === "%PDF-", `Invalid PDF: ${pdfPath}`);
}

const readerSegment = (item) => cleanLink(item.url || item.link).endsWith(".pdf") ? "report" : "article";
const readerCanonical = (item) => `${origin}/work/${item.id}/${readerSegment(item)}/`;

const canonicalPages = [
  ["index.html", `${origin}/`],
  ["portfolio/index.html", `${origin}/portfolio/`],
  ["services/index.html", `${origin}/services/`],
  ["environmental-science-writer/index.html", `${origin}/environmental-science-writer/`],
  ["technical-writer/index.html", `${origin}/technical-writer/`],
  ["seo-content-writer/index.html", `${origin}/seo-content-writer/`],
  ["authors/paul-shannon/index.html", `${origin}/authors/paul-shannon/`],
  ...items.flatMap((item) => [
    [`work/${item.id}/index.html`, `${origin}/work/${item.id}/`],
    [`work/${item.id}/${readerSegment(item)}/index.html`, readerCanonical(item)]
  ]),
  ["privacy/index.html", `${origin}/privacy/`],
  ["accessibility/index.html", `${origin}/accessibility/`],
  ["image-credits/index.html", `${origin}/image-credits/`]
];

const titles = new Set();
const descriptions = new Set();
const canonicals = new Set();
for (const [filename, expectedCanonical] of canonicalPages) {
  const file = path.join(dist, filename);
  assert(await exists(file), `Build output is missing canonical page ${filename}.`);
  const html = await readFile(file, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1]?.trim();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  assert(title && !titles.has(title), `Missing or duplicate title in ${filename}: ${title}`);
  assert(description && !descriptions.has(description), `Missing or duplicate meta description in ${filename}.`);
  assert(canonical === expectedCanonical, `Incorrect canonical in ${filename}: ${canonical}`);
  assert(!canonicals.has(canonical), `Duplicate canonical in canonical page set: ${canonical}`);
  titles.add(title);
  descriptions.add(description);
  canonicals.add(canonical);
  assert((html.match(/<h1(?:\s|>)/g) || []).length === 1, `${filename} must have exactly one H1.`);
  const headingLevels = [...html.matchAll(/<h([1-6])(?:\s|>)/g)].map((match) => Number(match[1]));
  for (let index = 1; index < headingLevels.length; index += 1) {
    assert(headingLevels[index] <= headingLevels[index - 1] + 1, `${filename} skips from H${headingLevels[index - 1]} to H${headingLevels[index]}.`);
  }
  assert(/<html lang="en">/.test(html), `${filename} is missing lang=en.`);
  assert(/class="skip-link"/.test(html), `${filename} is missing a skip link.`);
  assert(/<main(?:\s|>)/.test(html), `${filename} is missing a main landmark.`);
  for (const marker of ["og:title", "og:description", "og:image", "twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
    assert(html.includes(marker), `${filename} is missing ${marker} metadata.`);
  }
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  for (const img of html.matchAll(/<img\b([^>]+)>/g)) {
    assert(/\balt="[^"]*"/.test(img[1]), `${filename} contains an image without alt text.`);
    assert(/\bwidth="\d+"/.test(img[1]) && /\bheight="\d+"/.test(img[1]), `${filename} contains an image without explicit dimensions.`);
  }
}

// Crawl the deployable tree as deployed, not only the editable source. This
// catches relative-path regressions in clean-route aliases such as /portfolio/.
for (const file of (await walk(dist)).filter((entry) => entry.endsWith(".html"))) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|data:|#|\/)/.test(reference)) continue;
    const localReference = reference.split(/[?#]/, 1)[0];
    if (!localReference) continue;
    const target = path.resolve(path.dirname(file), localReference);
    assert(target.startsWith(dist), `${path.relative(dist, file)} links outside the deployable tree: ${reference}`);
    assert(await exists(target), `${path.relative(dist, file)} links to missing deployed target ${reference}.`);
  }
}

for (const item of items) {
  const page = await readFile(path.join(root, "work", item.id, "index.html"), "utf8");
  const segment = readerSegment(item);
  assert(/<h1(?:\s|>)/.test(page), `${item.id} is missing its H1.`);
  assert(page.includes("BreadcrumbList") && page.includes('class="breadcrumbs"'), `${item.id} is missing visible/schema breadcrumbs.`);
  assert(page.includes('class="author-box'), `${item.id} is missing its author box.`);
  assert(page.includes('class="related-work'), `${item.id} is missing related work.`);
  assert(page.includes('class="source-note'), `${item.id} is missing its publication/source note.`);
  assert(page.includes(item.image), `${item.id} does not use its unique featured image.`);
  assert(page.includes("Paul Shannon") && page.includes("authors/paul-shannon"), `${item.id} is not connected to Paul’s author entity.`);
  assert(page.includes(`href="${segment}/index.html"`), `${item.id} overview is missing its internal reading CTA.`);
  assert(/Read (?:Article|Report)/.test(page), `${item.id} overview is missing a clearly named Read Article/Report action.`);
  assert(page.includes("Project in 60 seconds") && page.includes("Paul’s role"), `${item.id} overview is missing its scannable project summary.`);
  const summaryGrid = page.match(/class="overview-summary-grid">([\s\S]*?)<\/div>/)?.[1] || "";
  assert(summaryGrid && !summaryGrid.includes("…"), `${item.id} overview contains a clipped summary-card ellipsis.`);

  const readerFile = path.join(root, "work", item.id, segment, "index.html");
  assert(await exists(readerFile), `${item.id} is missing its ${segment} page.`);
  const readerPage = await readFile(readerFile, "utf8");
  assert(readerPage.includes('class="reading-page"'), `${item.id} reading page is missing the editorial reading layout.`);
  assert(readerPage.includes('class="reading-copy"'), `${item.id} reading page is missing readable content.`);
  assert(readerPage.includes("About this project") && readerPage.includes("Back to project overview"), `${item.id} reading page is missing project context.`);
  assert(readerPage.includes("Paul Shannon") && readerPage.includes("authors/paul-shannon"), `${item.id} reading page is not connected to Paul’s author entity.`);
  assert(readerPage.length > 8_000, `${item.id} reading page is unexpectedly thin.`);
  if (segment === "report") {
    assert(readerPage.includes("ScholarlyArticle"), `${item.id} report is missing ScholarlyArticle schema.`);
    assert(readerPage.includes("Abstract") && readerPage.includes("References"), `${item.id} report is missing its scientific structure.`);
    assert(readerPage.length > 25_000, `${item.id} report does not appear to contain the complete source text.`);
  }
  if (item.sourceUnavailable) {
    assert(readerPage.includes("Publisher-protected work"), `${item.id} must disclose that its reading page is an original guide, not republished client text.`);
  }
  if (item.publisher === "Workinman Interactive") {
    assert(readerPage.includes("Authorized portfolio edition"), `${item.id} is missing its authorized-edition disclosure.`);
    assert(readerPage.includes("Original publisher</strong> <a href=\"https://workinman.com/\""), `${item.id} must visibly retain Workinman Interactive as the original publisher.`);
    assert(!readerPage.includes("Publisher-protected work"), `${item.id} incorrectly renders as a guide instead of the authorized complete article.`);
    const graphs = [...readerPage.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map((match) => JSON.parse(match[1]))
      .flatMap((record) => record["@graph"] || [record]);
    const articleSchema = graphs.find((record) => record["@id"] === `${readerCanonical(item)}#article`);
    assert(articleSchema?.author?.["@id"] === `${origin}/authors/paul-shannon/#person`, `${item.id} schema must identify Paul Shannon as author.`);
    assert(articleSchema?.publisher?.name === "Workinman Interactive", `${item.id} schema must identify Workinman Interactive as publisher.`);
  }
}

const researchFigureExpectations = {
  "climate-change-harmful-algal-blooms-genesee-finger-lakes": [
    "climate-watershed-soils.webp",
    "climate-hab-report-trend.webp",
    "climate-reported-waterbodies.webp"
  ],
  "rhizofiltration-microcystis-water-hyacinth": [
    "rhizofiltration-abbreviations.webp",
    "rhizofiltration-baltic-hab.webp",
    "rhizofiltration-mechanical-removal.webp",
    "rhizofiltration-field-site.webp",
    "rhizofiltration-secchi-depth.webp",
    "rhizofiltration-tds.webp"
  ],
  "phytoremediation-habs-feasibility-review": [
    "phytoremediation-rootzone-diversity.webp",
    "phytoremediation-duckweed-microbiome.webp"
  ]
};
for (const [id, filenames] of Object.entries(researchFigureExpectations)) {
  const report = await readFile(path.join(root, "work", id, "report", "index.html"), "utf8");
  for (const filename of filenames) assert(report.includes(filename), `${id} is missing research visual ${filename}.`);
  assert((report.match(/<figcaption>/g) || []).length >= filenames.length, `${id} is missing figure captions.`);
  assert(!/<p>\s*\d+\.\s*<\/p>/.test(report), `${id} contains a loose section number.`);
}

const portfolio = await readFile(path.join(root, "portfolio.html"), "utf8");
assert((portfolio.match(/<article class="portfolio-item"/g) || []).length === items.length, "The static portfolio must contain all 28 items.");
for (const item of items) {
  assert(portfolio.includes(`work/${item.id}/index.html`), `Portfolio is missing the owned Read URL for ${item.id}.`);
  assert(portfolio.includes(item.image), `Portfolio is missing the featured image for ${item.id}.`);
}

const ownedArticleFiles = (await readdir(path.join(root, "content", "articles"))).filter((file) => file.endsWith(".json"));
assert(ownedArticleFiles.length === 24, `Expected 24 complete article records; found ${ownedArticleFiles.length}.`);
let authorizedClientArticles = 0;
for (const filename of ownedArticleFiles) {
  const record = JSON.parse(await readFile(path.join(root, "content", "articles", filename), "utf8"));
  assert(["complete-owned-web-edition", "authorized-client-portfolio-edition"].includes(record.reproduction), `${filename} has an unexpected reproduction status.`);
  if (record.reproduction === "authorized-client-portfolio-edition") {
    authorizedClientArticles += 1;
    assert(record.source === "Workinman Interactive", `${filename} must retain Workinman Interactive as its source publisher.`);
  }
  const minimumBlocks = record.reproduction === "authorized-client-portfolio-edition" ? 5 : 10;
  assert(Array.isArray(record.blocks) && record.blocks.length > minimumBlocks, `${filename} does not contain a substantive article body.`);
}
assert(authorizedClientArticles === 7, `Expected seven authorized Workinman article records; found ${authorizedClientArticles}.`);

const home = await readFile(path.join(root, "index.html"), "utf8");
assert(home.includes('action="https://formspree.io/f/mwpvgolv"'), "The Formspree endpoint is incorrect.");
assert(home.includes('name="_gotcha"') && home.includes("data-start-time"), "Contact anti-bot fields are incomplete.");
assert(home.includes("pshannon@paulwrites.net"), "The current contact email is missing.");
assert((home.match(/<option value="(?:environmental|technical|seo|web|thought-leadership|editing|agency|other)">/g) || []).length === 8, "The problem-based inquiry choices are incomplete.");
const stylesheet = await readFile(path.join(root, "styles.css"), "utf8");
assert(/\.hero h1\s*\{[\s\S]*?font-weight:\s*900;/.test(stylesheet), "The full homepage hero statement does not share one strong weight.");
assert(!/notebooks arranged on a freelance writer’s desk/i.test(await readFile(path.join(root, "posts.js"), "utf8")), "The freelance-writer image caption still misidentifies books as notebooks.");

const allSourceHtml = (await walk(root))
  .filter((file) => file.endsWith(".html") && !file.includes(`${path.sep}dist${path.sep}`) && !file.includes(`${path.sep}node_modules${path.sep}`));
for (const file of allSourceHtml) {
  const html = await readFile(file, "utf8");
  assert(!/inquirewithps@gmail\.com/i.test(html), `Retired contact email found in ${path.relative(root, file)}.`);
  assert(!/placeholder site|coming soon|lorem ipsum|demo content|example portfolio|test page/i.test(html), `Public placeholder wording found in ${path.relative(root, file)}.`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|data:|#)/.test(reference)) continue;
    const localReference = reference.split(/[?#]/, 1)[0];
    if (!localReference) continue;
    const target = path.resolve(path.dirname(file), localReference);
    assert(target.startsWith(root), `${path.relative(root, file)} links outside the project: ${reference}`);
    assert(await exists(target), `${path.relative(root, file)} links to missing local target ${reference}.`);
  }

  const visibleBody = html
    .replace(/<head\b[\s\S]*?<\/head>/gi, " ")
    .replace(/<h[1-6]\b[\s\S]*?<\/h[1-6]>/gi, " ")
    .replace(/<i\b[^>]*>[\s\S]*?<\/i>/gi, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ");
  for (const scientificName of [
    "Microcystis aeruginosa", "Eichhornia crassipes", "Pontederia crassipes",
    "Lemna trisulca", "Lemna minor", "Myriophyllum aquaticum",
    "Raphidiopsis raciborskii", "Dolichospermum flos-aquae", "Anabaena flos-aquae",
    "Paucibacter toxinivorans", "Pistia stratiotes", "Spirodela polyrhiza",
    "Ceratophyllum demersum", "Chrysopogon zizanioides", "Karenia brevis",
    "Sedum plumbizincicola", "Pteris vittata", "Synechococcus elongatus",
    "Danio rerio", "Moorea producens", "Neochetina bruchi", "Neochetina eichhorniae",
    "M. aeruginosa", "E. crassipes", "L. trisulca", "L. minor", "M. aquaticum",
    "R. raciborskii", "D. flos-aquae", "Microcystis", "Eichhornia", "Pontederia",
    "Lemna", "Myriophyllum", "Raphidiopsis", "Dolichospermum", "Anabaena",
    "Paucibacter", "Pistia", "Spirodela", "Ceratophyllum", "Chrysopogon",
    "Oscillatoria", "Acinetobacter", "Agrobacterium", "Azospirillum", "Burkholderia",
    "Caulobacter", "Methylibium", "Pseudomonas", "Sphingomonas", "Karenia", "Sedum",
    "Pteris", "Synechococcus", "Danio", "Moorea", "Pseudanabaena", "Neochetina"
  ]) {
    assert(!visibleBody.includes(scientificName), `Unitalicized scientific name “${scientificName}” found in ${path.relative(root, file)}.`);
  }
}

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
assert((sitemap.match(/<url>/g) || []).length === canonicalPages.length, `Sitemap should contain ${canonicalPages.length} canonical URLs.`);
for (const [, canonical] of canonicalPages) assert(sitemap.includes(`<loc>${canonical}</loc>`), `Sitemap is missing ${canonical}.`);

const feed = await readFile(path.join(root, "feed.xml"), "utf8");
assert(/<rss version="2\.0"/.test(feed), "feed.xml is not a valid RSS 2.0 document.");
assert((feed.match(/<item>/g) || []).length === items.length, `RSS should contain ${items.length} portfolio entries.`);
for (const item of items) assert(feed.includes(readerCanonical(item)), `RSS is missing ${readerCanonical(item)}.`);

const readingTimes = await readFile(path.join(root, "reading-times.js"), "utf8");
for (const item of items) assert(readingTimes.includes(`"${item.id}"`), `reading-times.js is missing ${item.id}.`);

const robots = await readFile(path.join(root, "robots.txt"), "utf8");
assert(/User-agent:\s*\*/.test(robots) && /Allow:\s*\//.test(robots), "robots.txt does not allow ordinary crawling.");
assert(robots.includes("Sitemap: https://paulwrites.net/sitemap.xml"), "robots.txt does not reference the sitemap.");

const redirects = await readFile(path.join(root, "_redirects"), "utf8");
for (const route of ["/portfolio.html /portfolio/ 301", "/about /authors/paul-shannon/ 301", "/privacy.html /privacy/ 301"]) {
  assert(redirects.includes(route), `Missing redirect: ${route}`);
}

const css = await readFile(path.join(root, "styles.css"), "utf8");
for (const marker of [":focus-visible", "prefers-reduced-motion: reduce", "@media print", "max-width: 23rem", ".publication-grid", ".related-grid", ".breadcrumbs", ".reading-shell", ".overview-summary", ".hero-key", ".edition-note"]) {
  assert(css.includes(marker), `styles.css is missing ${marker}.`);
}

const portfolioJs = await readFile(path.join(root, "portfolio.js"), "utf8");
for (const marker of ["PAGE_SIZE = 8", "aria-pressed", "URLSearchParams", "replaceChildren", "Project details", "original-link", "localUrl"]) {
  assert(portfolioJs.includes(marker), `portfolio.js is missing ${marker}.`);
}

const distFiles = await walk(dist);
const publicCode = (await Promise.all(distFiles.filter((file) => /\.(?:html|js)$/.test(file)).map((file) => readFile(file, "utf8")))).join("\n");
assert(!/\b(?:view|like)[-_ ]?count\b/i.test(publicCode), "A view/like-count UI was found without a persistent backend.");

console.log(`Validated ${canonicalPages.length} canonical pages, ${items.length} unique portfolio images and work pages, 24 complete article editions (including 7 authorized Workinman articles), 7 distinct Workinman notes, 3 research papers, metadata/schema, sitemap, robots, redirects, internal links, accessibility markers, and the production build.`);
