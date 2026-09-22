import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

// Regenerate every derived page from posts.js before creating the deployable copy.
await import("./generate.mjs");

const root = process.cwd();
const output = path.join(root, "dist");
const files = [
  "index.html",
  "portfolio.html",
  "privacy.html",
  "accessibility.html",
  "image-credits.html",
  "404.html",
  "styles.css",
  "site.js",
  "posts.js",
  "portfolio.js",
  "robots.txt",
  "sitemap.xml",
  "_redirects"
];
const generatedDirectories = [
  "work",
  "services",
  "authors",
  "environmental-science-writer",
  "technical-writer",
  "seo-content-writer"
];
const cleanRouteAliases = new Map([
  ["portfolio.html", "portfolio"],
  ["privacy.html", "privacy"],
  ["accessibility.html", "accessibility"],
  ["image-credits.html", "image-credits"]
]);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of files) {
  await cp(path.join(root, file), path.join(output, file));
}

for (const directory of generatedDirectories) {
  await cp(path.join(root, directory), path.join(output, directory), { recursive: true });
}

for (const [source, route] of cleanRouteAliases) {
  const destination = path.join(output, route);
  await mkdir(destination, { recursive: true });
  await cp(path.join(root, source), path.join(destination, "index.html"));
}

await cp(path.join(root, "public"), path.join(output, "public"), { recursive: true });
await cp(path.join(root, ".openai"), path.join(output, ".openai"), { recursive: true });

console.log(`Built ${files.length} root files, ${generatedDirectories.length} generated page groups, clean URL aliases, images, and research downloads.`);
