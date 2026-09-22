import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const origin = "https://paulwrites.net";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const exists = async (target) => {
  try { await access(target); return true; } catch { return false; }
};

const dataSource = await readFile(path.join(root, "posts.js"), "utf8");
const dataWindow = {};
Function("window", `${dataSource}\nreturn window.PAULWRITES_ITEMS;`)(dataWindow);
const items = dataWindow.PAULWRITES_ITEMS;

assert(Array.isArray(items), "posts.js must set window.PAULWRITES_ITEMS to an array.");
assert(items.length >= 28, `Expected at least the initial 28 records; found ${items.length}.`);

const cleanLink = (value = "") => {
  const text = String(value).trim().replaceAll("\\&", "&").replaceAll("\\_", "_");
  const markdown = text.match(/^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/);
  return markdown ? markdown[1] : text;
};

const required = ["title", "date", "tags"];
const ids = new Set();
for (const item of items) {
  for (const key of required) assert(item[key], `${item.id || "A record"} is missing ${key}.`);
  assert(item.summary || item.description, `${item.id || item.title} needs summary or description.`);
  const url = cleanLink(item.url || item.link);
  assert(url, `${item.id || item.title} needs url or link.`);
  assert(!Number.isNaN(Date.parse(item.date)), `Invalid date: ${item.id || item.title}`);
  assert(Array.isArray(item.tags) && item.tags.length > 0, `${item.id || item.title} needs at least one tag.`);
  assert(item.image && item.imageAlt, `${item.id || item.title} needs an image and descriptive alt text.`);
  assert(Number.isInteger(item.readingMinutes) && item.readingMinutes > 0, `${item.id || item.title} needs a positive readingMinutes estimate.`);
  assert(item.projectContext, `${item.id || item.title} needs expandable project context.`);
  assert(await exists(path.join(root, item.image)), `Missing portfolio image: ${item.image}`);
  assert(/^https?:\/\//.test(url) || !url.startsWith("/"), `${item.id || item.title} must use a direct-open-safe URL.`);
  if (item.id) {
    assert(!ids.has(item.id), `Duplicate record id: ${item.id}`);
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id), `Invalid id: ${item.id}`);
    ids.add(item.id);
  }
}

assert(items.filter((item) => item.publisher === "Workinman Interactive").length === 7, "Expected seven Workinman records.");
assert(items.filter((item) => cleanLink(item.url || item.link).endsWith(".pdf")).length === 3, "Expected three research PDFs.");

for (const item of items.filter((entry) => cleanLink(entry.url || entry.link).endsWith(".pdf"))) {
  const pdfUrl = cleanLink(item.url || item.link);
  const pdf = path.join(root, pdfUrl);
  assert(await exists(pdf), `Missing source PDF: ${pdfUrl}`);
  const header = await readFile(pdf, { encoding: "utf8" });
  assert(header.startsWith("%PDF-"), `Invalid PDF: ${pdfUrl}`);
}

const pageFiles = ["index.html", "portfolio.html", "privacy.html", "accessibility.html", "image-credits.html", "404.html"];
const titles = new Set();
for (const filename of pageFiles) {
  const html = await readFile(path.join(root, filename), "utf8");
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert(title && !titles.has(title), `Missing or duplicate title in ${filename}.`);
  titles.add(title);
  assert((html.match(/<h1(?:\s|>)/g) || []).length === 1, `${filename} must have one H1.`);
  assert(/<html lang="en">/.test(html), `${filename} is missing the language.`);
  assert(/class="skip-link"/.test(html), `${filename} is missing the skip link.`);
  assert(/<main(?:\s|>)/.test(html), `${filename} is missing the main landmark.`);
  if (filename !== "404.html") {
    assert(/<meta name="description" content="[^"]+">/.test(html), `${filename} is missing a meta description.`);
    assert(/<link rel="canonical" href="https:\/\/paulwrites\.net\/[^"]*">/.test(html), `${filename} is missing its canonical.`);
  } else {
    assert(/<meta name="robots" content="noindex,follow">/.test(html), "404.html must be noindex.");
  }
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|data:|#)/.test(reference)) continue;
    const localPath = reference.split(/[?#]/, 1)[0];
    assert(await exists(path.join(root, localPath)), `${filename} links to missing local file ${localPath}.`);
  }
}

const home = await readFile(path.join(root, "index.html"), "utf8");
assert(home.includes('action="https://formspree.io/f/mwpvgolv"'), "The Formspree endpoint is incorrect.");
assert(home.includes('name="_gotcha"'), "The form honeypot is missing.");
assert(home.includes('data-start-time'), "The minimum-completion-time field is missing.");
assert(home.includes("pshannon@paulwrites.net"), "The current PaulWrites contact email is missing.");
assert((home.match(/<option value="(?:environmental|technical|seo|web|thought-leadership|editing|agency|other)">/g) || []).length === 8, "The project-problem choices are incomplete.");

const portfolioHtml = await readFile(path.join(root, "portfolio.html"), "utf8");
for (const item of items) {
  const escapedTitle = item.title.replaceAll("&", "&amp;");
  assert(portfolioHtml.includes(item.title) || portfolioHtml.includes(escapedTitle), `Static portfolio is missing ${item.id}.`);
}

const portfolioJs = await readFile(path.join(root, "portfolio.js"), "utf8");
for (const marker of ["PAGE_SIZE = 8", "aria-pressed", "URLSearchParams", "replaceChildren", "datePrecision", "readingMinutes", "projectContext", "notes-toggle"]) {
  assert(portfolioJs.includes(marker), `portfolio.js is missing ${marker}.`);
}

const css = await readFile(path.join(root, "styles.css"), "utf8");
for (const marker of [":focus-visible", "prefers-reduced-motion: reduce", "@media print", "max-width: 23rem"]) {
  assert(css.includes(marker), `styles.css is missing ${marker}.`);
}

const expectedOutput = [
  ...pageFiles,
  "styles.css",
  "site.js",
  "posts.js",
  "portfolio.js",
  "robots.txt",
  "sitemap.xml",
  "_redirects",
  ".openai/hosting.json"
];
for (const file of expectedOutput) assert(await exists(path.join(dist, file)), `Build output is missing ${file}.`);

const sourceFiles = new Set(await readdir(dist));
for (const file of ["index.html", "portfolio.html", "styles.css", "posts.js"]) assert(sourceFiles.has(file), `dist is missing ${file}.`);

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
for (const route of ["/", "/portfolio.html", "/privacy.html", "/accessibility.html", "/image-credits.html"]) {
  assert(sitemap.includes(`<loc>${origin}${route}</loc>`), `Sitemap is missing ${route}.`);
}

console.log(`Validated ${pageFiles.length} pages, ${items.length} portfolio records, 7 Workinman pieces, 3 research papers, the Formspree integration, and the production output.`);
