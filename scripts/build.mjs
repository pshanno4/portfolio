import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

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

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of files) {
  await cp(path.join(root, file), path.join(output, file));
}

await cp(path.join(root, "public"), path.join(output, "public"), { recursive: true });
await cp(path.join(root, ".openai"), path.join(output, ".openai"), { recursive: true });

console.log(`Built ${files.length} static files plus portfolio images and research downloads.`);
