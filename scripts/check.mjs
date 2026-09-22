import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

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
  assert(cleanLink(item.url || item.link), `${item.id} needs an original/source URL.`);
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

const canonicalPages = [
  ["index.html", `${origin}/`],
  ["portfolio/index.html", `${origin}/portfolio/`],
  ["services/index.html", `${origin}/services/`],
  ["environmental-science-writer/index.html", `${origin}/environmental-science-writer/`],
  ["technical-writer/index.html", `${origin}/technical-writer/`],
  ["seo-content-writer/index.html", `${origin}/seo-content-writer/`],
  ["authors/paul-shannon/index.html", `${origin}/authors/paul-shannon/`],
  ...items.map((item) => [`work/${item.id}/index.html`, `${origin}/work/${item.id}/`]),
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

for (const item of items) {
  const page = await readFile(path.join(root, "work", item.id, "index.html"), "utf8");
  assert(page.includes("<h1>"), `${item.id} is missing its H1.`);
  assert(page.includes("BreadcrumbList") && page.includes('class="breadcrumbs"'), `${item.id} is missing visible/schema breadcrumbs.`);
  assert(page.includes('class="author-box'), `${item.id} is missing its author box.`);
  assert(page.includes('class="related-work'), `${item.id} is missing related work.`);
  assert(page.includes('class="source-note'), `${item.id} is missing its publication/source note.`);
  assert(page.includes(item.image), `${item.id} does not use its unique featured image.`);
  assert(page.includes("Paul Shannon") && page.includes("authors/paul-shannon"), `${item.id} is not connected to Paul’s author entity.`);
}

const portfolio = await readFile(path.join(root, "portfolio.html"), "utf8");
assert((portfolio.match(/<article class="portfolio-item"/g) || []).length === items.length, "The static portfolio must contain all 28 items.");
for (const item of items) {
  assert(portfolio.includes(`work/${item.id}/index.html`), `Portfolio is missing the owned Read URL for ${item.id}.`);
  assert(portfolio.includes(item.image), `Portfolio is missing the featured image for ${item.id}.`);
}

const home = await readFile(path.join(root, "index.html"), "utf8");
assert(home.includes('action="https://formspree.io/f/mwpvgolv"'), "The Formspree endpoint is incorrect.");
assert(home.includes('name="_gotcha"') && home.includes("data-start-time"), "Contact anti-bot fields are incomplete.");
assert(home.includes("pshannon@paulwrites.net"), "The current contact email is missing.");
assert((home.match(/<option value="(?:environmental|technical|seo|web|thought-leadership|editing|agency|other)">/g) || []).length === 8, "The problem-based inquiry choices are incomplete.");

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
}

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
assert((sitemap.match(/<url>/g) || []).length === canonicalPages.length, `Sitemap should contain ${canonicalPages.length} canonical URLs.`);
for (const [, canonical] of canonicalPages) assert(sitemap.includes(`<loc>${canonical}</loc>`), `Sitemap is missing ${canonical}.`);

const robots = await readFile(path.join(root, "robots.txt"), "utf8");
assert(/User-agent:\s*\*/.test(robots) && /Allow:\s*\//.test(robots), "robots.txt does not allow ordinary crawling.");
assert(robots.includes("Sitemap: https://paulwrites.net/sitemap.xml"), "robots.txt does not reference the sitemap.");

const redirects = await readFile(path.join(root, "_redirects"), "utf8");
for (const route of ["/portfolio.html /portfolio/ 301", "/about /authors/paul-shannon/ 301", "/privacy.html /privacy/ 301"]) {
  assert(redirects.includes(route), `Missing redirect: ${route}`);
}

const css = await readFile(path.join(root, "styles.css"), "utf8");
for (const marker of [":focus-visible", "prefers-reduced-motion: reduce", "@media print", "max-width: 23rem", ".publication-grid", ".related-grid", ".breadcrumbs"]) {
  assert(css.includes(marker), `styles.css is missing ${marker}.`);
}

const portfolioJs = await readFile(path.join(root, "portfolio.js"), "utf8");
for (const marker of ["PAGE_SIZE = 8", "aria-pressed", "URLSearchParams", "replaceChildren", "Project details", "original-link", "localUrl"]) {
  assert(portfolioJs.includes(marker), `portfolio.js is missing ${marker}.`);
}

const distFiles = await walk(dist);
const publicCode = (await Promise.all(distFiles.filter((file) => /\.(?:html|js)$/.test(file)).map((file) => readFile(file, "utf8")))).join("\n");
assert(!/\b(?:view|like)[-_ ]?count\b/i.test(publicCode), "A view/like-count UI was found without a persistent backend.");

console.log(`Validated ${canonicalPages.length} canonical pages, ${items.length} unique portfolio images and work pages, 7 distinct Workinman notes, 3 research papers, metadata/schema, sitemap, robots, redirects, internal links, accessibility markers, and the production build.`);
