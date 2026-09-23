import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { AUTHOR_COPY, SERVICE_PAGES, WORK_PAGE_CONTENT } from "./site-content.mjs";
import { loadResearchReport, isResearchReport } from "./research-parser.mjs";

const root = process.cwd();
const origin = "https://paulwrites.net";
const today = "2026-09-23";
const authorId = `${origin}/authors/paul-shannon/#person`;
const websiteId = `${origin}/#website`;
const favicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='10' fill='%23166534'/%3E%3Cpath d='M18 48V16h16c9 0 14 5 14 13s-5 13-14 13h-7v6H18zm9-15h7c3 0 5-1 5-4s-2-4-5-4h-7v8z' fill='white'/%3E%3C/svg%3E";
const writeGenerated = (filename, content) => writeFile(filename, content.replace(/[ \t]+$/gm, ""));
const SEO_TITLES = {
  "phytoremediation-habs-feasibility-review": "Phytoremediation for Harmful Algal Blooms | Paul Shannon",
  "noovie-trivia-levels-up": "Noovie Trivia: Faster Play and New 1v1 Battles | Paul Shannon",
  "why-entrepreneurship-became-a-trend": "Dropshipping Hype and the Entrepreneurship Trend | Paul Shannon",
  "bonn-2025-climate-negotiations": "Why the Bonn 2025 Climate Talks Matter | Paul Shannon",
  "clean-water-climate-change-habs": "Climate Change and Harmful Algal Blooms | Paul Shannon",
  "freelancers-stay-broke-after-clients": "Why Freelancers Stay Broke After Landing Clients | Paul Shannon",
  "carbon-offsets-insetting": "Carbon Offsets vs. Carbon Insetting | Paul Shannon",
  "what-makes-a-good-portfolio": "What Makes a Good Writing Portfolio? | Paul Shannon",
  "sustainable585-issue-3": "Sustainable585: May 4 Regional Roundup | Paul Shannon",
  "sustainable585-issue-5": "Sustainable585: June 1 Regional Roundup | Paul Shannon",
  "ai-corporate-sustainability": "How AI Is Reshaping Corporate Sustainability | Paul Shannon",
  "smart-thermostat-wont-save-you": "Why a Smart Thermostat Won’t Save the Climate | Paul Shannon",
  "rochester-sustainable-fashion-brands": "Five Rochester Sustainable Fashion Brands | Paul Shannon",
  "katy-perry-spaceflight-climate": "The Climate Cost of Katy Perry’s Spaceflight | Paul Shannon",
  "museums-relevant-with-digital-exhibits": "Designing Memorable Digital Museum Exhibits | Paul Shannon",
  "climate-change-harmful-algal-blooms-genesee-finger-lakes": "Climate Change and Harmful Algal Blooms in the Finger Lakes",
  "rhizofiltration-microcystis-water-hyacinth": "Water Hyacinth Rhizofiltration for Microcystis Blooms",
  "engin-ukraine-connections": "ENGin: Rebuilding Ukraine Through Personal Connections",
  "why-freelance-writers-quit": "Why Freelance Writers Quit—and How to Last | Paul Shannon"
};

const source = await readFile(path.join(root, "posts.js"), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);
const items = context.window.PAULWRITES_ITEMS;

if (!Array.isArray(items) || items.length === 0) throw new Error("posts.js did not provide portfolio records.");

const readJsonIfPresent = async (filename) => {
  try {
    return JSON.parse(await readFile(filename, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
};

const cleanLink = (value = "") => {
  const text = String(value).trim().replaceAll("\\&", "&").replaceAll("\\_", "_");
  const markdown = text.match(/^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/);
  return markdown ? markdown[1] : text;
};

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const jsonLd = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");
const isExternal = (value = "") => /^https?:\/\//.test(value);
const isPdf = (value = "") => /\.pdf(?:$|[?#])/i.test(value);
const isResearch = (item) => item.tags.includes("Research");

const formatDate = (item) => {
  if (item.datePrecision === "year") return item.date.slice(0, 4);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${item.date}T12:00:00Z`));
};

const schemaDate = (item) => item.datePrecision === "year" ? item.date.slice(0, 4) : item.date;

const words = (content) => {
  const chunks = [
    ...(content.overview || []),
    content.role || "",
    ...(content.sections || []).flatMap((section) => [section.heading || "", ...(section.paragraphs || []), ...(section.bullets || [])])
  ];
  return chunks.join(" ").trim().split(/\s+/).filter(Boolean).length;
};

const localReadMinutes = (content) => Math.max(2, Math.ceil(words(content) / 220));

const pageContentFor = (item) => WORK_PAGE_CONTENT[item.id] || {
  eyebrow: `${item.type} · ${item.publisher}`,
  overview: [item.summary, item.projectContext],
  sections: [
    {
      heading: "What this work addresses",
      paragraphs: [`The piece was developed around ${item.tags.map((tag) => tag.toLowerCase()).join(", ")}. Its purpose is to make the subject useful to the intended reader without removing the distinctions that make the topic worth understanding.`]
    },
    {
      heading: "Editorial approach",
      paragraphs: ["Paul organized the source material around the reader’s likely questions, built a clear progression, and revised the language for accuracy, rhythm, and practical value."]
    }
  ],
  role: item.projectContext
};

const wordCountForBlocks = (blocks = []) => blocks
  .filter((block) => !["h2", "h3"].includes(block.type))
  .reduce((total, block) => total + String(block.text || "").split(/\s+/).filter(Boolean).length, 0);

const normalizeImportedArticle = (article) => {
  if (!article) return null;
  let blocks = [...article.blocks];
  const cutoff = blocks.findIndex((block) => [
    /^Sustainable585\s+Image:/i,
    /^More articles by Paul Shannon$/i,
    /^Explore content categories$/i,
    /^\* LinkedIn ©/i
  ].some((pattern) => pattern.test(String(block.text || "").trim())));
  if (cutoff >= 0) blocks = blocks.slice(0, cutoff);
  blocks = blocks
    .filter((block) => !/^(?:\+ Follow|\+ Subscribe|Like|Celebrate|Support|Love|Insightful|Funny|Comment|Share)$/i.test(String(block.text || "").trim()))
    .map((block) => {
      if (/^[-*]\s+/.test(block.text || "")) return { ...block, type: "li", text: block.text.replace(/^[-*]\s+/, "") };
      if (/^Image\s+courtesy/i.test(block.text || "")) return { ...block, type: "note" };
      return block;
    });

  const hasH2 = blocks.some((block) => block.type === "h2");
  let seenH2 = false;
  blocks = blocks.map((block) => {
    if (block.type === "h2") seenH2 = true;
    if (block.type !== "h3") return block;
    if (!hasH2) return { ...block, type: "h2" };
    if (!seenH2) return { ...block, type: "p" };
    return block;
  });
  return { ...article, blocks, wordCount: wordCountForBlocks(blocks) };
};

const guideFor = (item) => {
  const project = pageContentFor(item);
  const blocks = [
    { type: "h2", text: "What the published article covers" },
    ...(project.overview || [item.summary]).map((text) => ({ type: "p", text })),
    ...(project.sections || []).flatMap((section) => [
      { type: "h2", text: section.heading },
      ...(section.paragraphs || []).map((text) => ({ type: "p", text })),
      ...(section.bullets || []).map((text) => ({ type: "li", text }))
    ]),
    { type: "h2", text: "Paul’s contribution" },
    { type: "p", text: project.role || item.projectContext }
  ];
  return {
    id: item.id,
    source: item.publisher,
    sourceUrl: cleanLink(item.url || item.link),
    reproduction: "publisher-protected-guide",
    wordCount: wordCountForBlocks(blocks),
    blocks
  };
};

const fullContentById = new Map();
for (const item of items) {
  const report = isResearchReport(item.id) ? await loadResearchReport(root, item.id) : null;
  const article = report || normalizeImportedArticle(await readJsonIfPresent(path.join(root, "content", "articles", `${item.id}.json`)));
  fullContentById.set(item.id, article || guideFor(item));
}

const readerFor = (item) => {
  const content = fullContentById.get(item.id);
  const report = isResearchReport(item.id);
  const guide = content.reproduction === "publisher-protected-guide";
  const authorizedClient = content.reproduction === "authorized-client-portfolio-edition";
  const segment = report ? "report" : "article";
  const minutes = Math.max(1, Math.ceil(content.wordCount / 220));
  return {
    ...content,
    report,
    guide,
    authorizedClient,
    complete: !guide,
    segment,
    minutes,
    href: `${segment}/index.html`,
    canonical: `${origin}/work/${item.id}/${segment}/`,
    label: report ? "Read Report" : guide ? "Read Article Guide" : "Read Article"
  };
};

const readingMinutesFor = (item) => readerFor(item).minutes;

const personNode = {
  "@type": "Person",
  "@id": authorId,
  name: "Paul Shannon",
  url: `${origin}/authors/paul-shannon/`,
  email: "mailto:pshannon@paulwrites.net",
  jobTitle: "Environmental science and technical writer",
  homeLocation: { "@type": "Place", name: "Rochester, New York" },
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: "Nazareth University"
  },
  knowsAbout: [
    "Environmental science",
    "Scientific communication",
    "Harmful algal blooms",
    "Freshwater systems",
    "Technical writing",
    "SEO content",
    "Interactive media"
  ]
};

const head = ({ title, description, canonical, image, imageAlt, type = "website", prefix = "", schema }) => `
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="Paul Shannon">
  <meta name="theme-color" content="#166534">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="alternate" type="application/rss+xml" title="PaulWrites published work" href="${origin}/feed.xml">
  <meta property="og:type" content="${esc(type)}">
  <meta property="og:site_name" content="PaulWrites.net">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:image:alt" content="${esc(imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">
  <meta name="twitter:image:alt" content="${esc(imageAlt)}">
  <link rel="icon" type="image/svg+xml" href="${favicon}">
  <link rel="stylesheet" href="${prefix}styles.css">
  <script type="application/ld+json">${jsonLd(schema)}</script>
</head>`;

const header = (prefix, current = "") => `
  <a class="skip-link" href="#main">Skip to main content</a>
  <header class="site-header">
    <div class="container header-row">
      <a class="brand" href="${prefix}index.html">PaulWrites</a>
      <nav aria-label="Primary navigation">
        <a href="${prefix}portfolio.html"${current === "portfolio" ? ' aria-current="page"' : ""}>Portfolio</a>
        <a href="${prefix}services/index.html"${current === "services" ? ' aria-current="page"' : ""}>Services</a>
        <a href="${prefix}authors/paul-shannon/index.html"${current === "about" ? ' aria-current="page"' : ""}>About</a>
        <a class="nav-contact" href="${prefix}index.html#contact">Discuss a project</a>
      </nav>
    </div>
  </header>`;

const footer = (prefix) => `
  <footer class="site-footer">
    <div class="container footer-row">
      <div><strong>Paul Shannon</strong><span>Environmental science &amp; technical writer · Rochester, New York</span></div>
      <nav aria-label="Footer navigation">
        <a href="${prefix}portfolio.html">Portfolio</a>
        <a href="${prefix}services/index.html">Services</a>
        <a href="${prefix}authors/paul-shannon/index.html">About</a>
        <a href="${prefix}privacy.html">Privacy</a>
        <a href="${prefix}accessibility.html">Accessibility</a>
        <a href="${prefix}image-credits.html">Image credits</a>
      </nav>
      <span>© 2026 Paul Shannon</span>
    </div>
  </footer>`;

const breadcrumbs = (links) => `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>${links.map((link, index) => `<li>${index === links.length - 1 ? `<span aria-current="page">${esc(link.label)}</span>` : `<a href="${link.href}">${esc(link.label)}</a>`}</li>`).join("")}</ol>
    </nav>`;

const breadcrumbSchema = (links) => ({
  "@type": "BreadcrumbList",
  itemListElement: links.map((link, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: link.label,
    item: link.canonical
  }))
});

const relatedItems = (item, content) => {
  const preferred = (content.relatedIds || []).map((id) => items.find((entry) => entry.id === id)).filter(Boolean);
  if (preferred.length >= 3) return preferred.slice(0, 3);
  const chosen = new Set([item.id, ...preferred.map((entry) => entry.id)]);
  const ranked = items
    .filter((candidate) => !chosen.has(candidate.id))
    .map((candidate) => ({
      candidate,
      score: candidate.tags.filter((tag) => item.tags.includes(tag)).length * 3
        + (candidate.publisher === item.publisher ? 2 : 0)
        + (isResearch(candidate) === isResearch(item) ? 1 : 0)
    }))
    .sort((a, b) => b.score - a.score || b.candidate.date.localeCompare(a.candidate.date));
  return [...preferred, ...ranked.map(({ candidate }) => candidate)].slice(0, 3);
};

const serviceFor = (item) => {
  if (item.tags.includes("Environmental Science") || item.tags.includes("Research")) {
    return { href: "../../environmental-science-writer/index.html", label: "Environmental science writing" };
  }
  if (item.publisher === "Workinman Interactive" || item.tags.includes("Technology") || item.tags.includes("B2B")) {
    return { href: "../../technical-writer/index.html", label: "Technical and B2B writing" };
  }
  return { href: "../../seo-content-writer/index.html", label: "Research-driven SEO content" };
};

const renderSection = (section) => `
          <section>
            <h2>${esc(section.heading)}</h2>
            ${(section.paragraphs || []).map((paragraph) => `<p>${scientificText(paragraph)}</p>`).join("\n")}
            ${(section.bullets || []).length ? `<ul>${section.bullets.map((bullet) => `<li>${scientificText(bullet)}</li>`).join("")}</ul>` : ""}
          </section>`;

const scientificNames = [
  "Microcystis aeruginosa",
  "Eichhornia crassipes",
  "Pontederia crassipes",
  "Lemna trisulca",
  "Lemna minor",
  "Myriophyllum aquaticum",
  "Raphidiopsis raciborskii",
  "Dolichospermum flos-aquae",
  "Anabaena flos-aquae",
  "Paucibacter toxinivorans",
  "Pistia stratiotes",
  "Spirodela polyrhiza",
  "Ceratophyllum demersum",
  "Chrysopogon zizanioides",
  "Karenia brevis",
  "Sedum plumbizincicola",
  "Pteris vittata",
  "Synechococcus elongatus",
  "Neochetina bruchi",
  "Neochetina eichhorniae",
  "M. aeruginosa",
  "E. crassipes",
  "P. crassipes",
  "L. trisulca",
  "L. minor",
  "M. aquaticum",
  "R. raciborskii",
  "D. flos-aquae",
  "Microcystis",
  "Eichhornia",
  "Pontederia",
  "Lemna",
  "Myriophyllum",
  "Raphidiopsis",
  "Dolichospermum",
  "Anabaena",
  "Paucibacter",
  "Pistia",
  "Spirodela",
  "Ceratophyllum",
  "Chrysopogon",
  "Oscillatoria",
  "Acinetobacter",
  "Agrobacterium",
  "Azospirillum",
  "Burkholderia",
  "Caulobacter",
  "Methylibium",
  "Pseudomonas",
  "Sphingomonas",
  "Karenia",
  "Sedum",
  "Pteris",
  "Synechococcus",
  "Neochetina"
].sort((a, b) => b.length - a.length);

const scientificNamePattern = new RegExp(
  `\\b(?:${scientificNames.map((name) => name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")).join("|")})\\b`,
  "g"
);

const scientificText = (value = "") => {
  const corrected = String(value)
    .replace(/\bE crassipes\b/g, "E. crassipes")
    .replace(/\bEichornia crassipes\b/g, "Eichhornia crassipes")
    .replace(/\bEichhornia crassiper\b/g, "Eichhornia crassipes")
    .replace(/\blemna trisulca\b/g, "Lemna trisulca")
    .replace(/\blemna minor\b/g, "Lemna minor")
    .replace(/\bsedum plumbizincicola\b/g, "Sedum plumbizincicola")
    .replace(/\bpteris vittata\b/g, "Pteris vittata")
    .replace(/\bprevelant\b/g, "prevalent")
    .replace(/\bfrowth form\b/g, "growth form")
    .replace(/\bits shows\b/g, "it shows")
    .replace(/\bfreefloating\b/g, "free-floating");
  let text = esc(corrected).replace(scientificNamePattern, (name) => `<i>${name}</i>`);
  text = text.replace(/\bhttps?:\/\/[^\s<]+/g, (match) => {
    const trailing = match.match(/[.,;)]+$/)?.[0] || "";
    const url = trailing ? match.slice(0, -trailing.length) : match;
    return `<a href="${url}">${url}</a>${trailing}`;
  });
  return text;
};

const summaryCardOverrides = {
  "sustainable585-issue-5:A repeatable editorial format": "A consistent regional-dispatch structure makes varied local developments easy to follow from issue to issue.",
  "elon-musk-mars:Editorial method": "The commentary separates technological possibility, practical probability, environmental cost, and public branding.",
  "sustainable585-issue-4:Local editorial value": "Place-specific water and climate reporting is translated for readers without a technical background.",
  "what-makes-a-good-portfolio:Applied on this site": "PaulWrites pairs every clip with its brief, audience, process, contribution, and original publication context.",
  "sustainable585-issue-3:Regional reporting skills": "Source discovery and concise synthesis connect separate environmental events without flattening their differences.",
  "katy-perry-spaceflight-climate:Accessible quantitative writing": "Emissions estimates are translated for general readers while their uncertainty and accounting boundaries remain visible.",
  "sustainable585-issue-2:Series continuity": "A stable regional lens and explanatory voice allow the subjects to change without fragmenting the series.",
  "climate-change-harmful-algal-blooms-genesee-finger-lakes:Research question and data sources": "The analysis tests whether climate patterns, bloom reports, lake history, and watershed soils align across nine New York counties.",
  "museums-relevant-with-digital-exhibits:Grounded in studio examples": "Real exhibit and interactive-media examples connect design principles to decisions museum teams can act on."
};

const summaryCardText = (item, section) => {
  const override = summaryCardOverrides[`${item.id}:${section.heading}`];
  if (override) return override;
  if (section.bullets?.length) return section.bullets[0];
  const paragraph = section.paragraphs?.[0] || "";
  const [firstSentence] = paragraph.split(/(?<=[.!?])\s+(?=[A-Z0-9“‘])/u);
  return firstSentence || paragraph;
};

const anchorFor = (value = "") => String(value)
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const truncateAtWord = (value = "", limit = 280) => {
  if (value.length <= limit) return value;
  const clipped = value.slice(0, limit + 1);
  const boundary = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, boundary > limit * 0.7 ? boundary : limit).trimEnd()}…`;
};

const overviewAudience = (item) => {
  if (isResearch(item)) return "Environmental and scientific readers; research, policy, and content teams";
  if (item.publisher === "Workinman Interactive") return "Prospective clients and decision-makers in interactive media, games, exhibits, or experiential technology";
  if (item.tags.includes("Freelancing")) return "Freelance writers, independent professionals, and creative-business readers";
  if (item.tags.includes("Rochester")) return "Rochester-area readers following regional sustainability work";
  return "General readers who need a clear entry point into a research-heavy subject";
};

const snapshotFor = (item) => {
  if (item.id === "rhizofiltration-microcystis-water-hyacinth") return [
    ["1.5×", "faster phosphate depletion with water hyacinth than Microcystis alone"],
    ["1.25×", "faster decline in total dissolved solids in the hyacinth groups"],
    ["p ≈ 0.01", "reported two-tailed test result for phosphate removal during remediation"]
  ];
  if (item.id === "climate-change-harmful-algal-blooms-genesee-finger-lakes") return [
    ["6×", "increase in individual HAB reports across the regional period studied"],
    ["r = 0.77", "reported relationship between precipitation anomaly and HAB-report frequency"],
    ["3 hotspots", "Yates, Seneca, and Ontario counties emerged as the clearest regional hotspots"]
  ];
  if (item.id === "phytoremediation-habs-feasibility-review") return [
    ["3 plants", "water hyacinth, star duckweed, and parrot’s feather compared"],
    ["86–95%", "anatoxin-a removal reported for star duckweed in cited studies"],
    ["Best fit", "star duckweed showed the strongest long-term feasibility in the review"]
  ];
  return [];
};

const renderSnapshot = (item) => {
  const snapshot = snapshotFor(item);
  if (!snapshot.length) return "";
  return `<aside class="finding-strip" aria-label="Selected findings">${snapshot.map(([value, label]) => `<div><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join("")}</aside>`;
};

const climateTable = `
  <figure class="data-figure" aria-labelledby="lake-severity-caption">
    <div class="table-scroll" tabindex="0" role="region" aria-label="Lake severity results" aria-describedby="lake-severity-caption">
      <table>
        <thead><tr><th scope="col">Water body</th><th scope="col">5-year average</th><th scope="col">5-year peak</th><th scope="col">Classification</th><th scope="col">Runoff potential</th></tr></thead>
        <tbody>
          <tr><th scope="row">Conesus Lake</th><td>7.4</td><td>13</td><td>Low severity</td><td>Moderate–high</td></tr>
          <tr><th scope="row">Hemlock Lake</th><td>3</td><td>5</td><td>Low severity</td><td>Moderate–high</td></tr>
          <tr><th scope="row">Lake Ontario (Monroe)</th><td>8.2</td><td>24</td><td>Low severity</td><td>Moderate–high</td></tr>
          <tr><th scope="row">Honeoye Lake</th><td>42.2</td><td>55</td><td>Mid severity</td><td>High if undrained</td></tr>
          <tr><th scope="row">Canandaigua Lake</th><td>113.2</td><td>292</td><td>High severity</td><td>High if undrained</td></tr>
          <tr><th scope="row">Cayuga Lake</th><td>107</td><td>147</td><td>High severity</td><td>High if undrained</td></tr>
          <tr><th scope="row">Seneca Lake</th><td>189</td><td>377</td><td>High severity</td><td>High if undrained</td></tr>
          <tr><th scope="row">Java Lake</th><td>4.2</td><td>7</td><td>Low severity</td><td>Moderate–high if undrained</td></tr>
          <tr><th scope="row">Keuka Lake</th><td>13.4</td><td>16</td><td>Mid severity</td><td>High</td></tr>
        </tbody>
      </table>
    </div>
    <figcaption id="lake-severity-caption">Selected recurring water bodies from the report’s 2020–2024 NYSDEC analysis. The report’s classifications are comparative research categories, not official risk designations. Source: Shannon (2025), using NYSDEC and USDA Web Soil Survey data. <a href="../../../public/downloads/climate-change-habs-genesee-finger-lakes.pdf">Source PDF</a>.</figcaption>
  </figure>`;

const macrophyteTable = `
  <figure class="data-figure" aria-labelledby="macrophyte-caption">
    <div class="table-scroll" tabindex="0" role="region" aria-label="Macrophyte comparison" aria-describedby="macrophyte-caption">
      <table>
        <thead><tr><th scope="col">Macrophyte</th><th scope="col">Growth form</th><th scope="col">Primary mechanism</th><th scope="col">North American restrictions</th><th scope="col">Adverse-effect tendency</th></tr></thead>
        <tbody>
          <tr><th scope="row"><i>Eichhornia crassipes</i></th><td>Free-floating</td><td>Rhizofiltration</td><td>12+ states</td><td>Extreme</td></tr>
          <tr><th scope="row"><i>Lemna trisulca</i></th><td>Submerged</td><td>Bioaccumulation</td><td>None identified</td><td>Low–moderate</td></tr>
          <tr><th scope="row"><i>Myriophyllum aquaticum</i></th><td>Emergent and submerged</td><td>Allelopathy</td><td>20+ states and Canada</td><td>Moderate–high</td></tr>
        </tbody>
      </table>
    </div>
    <figcaption id="macrophyte-caption">Table 1. The review’s feasibility framework combines mechanism, regional restrictions, management burden, and adverse-effect pathways. Source: Shannon (2026). <a href="../../../public/downloads/phytoremediation-habs-literature-review.pdf">Source PDF</a>.</figcaption>
  </figure>`;

const renderResearchMedia = (item) => {
  if (item.id === "rhizofiltration-microcystis-water-hyacinth") return `
    <section class="research-figures" aria-labelledby="rhizo-figures"><h2 id="rhizo-figures">Figures and research visuals</h2>
      <p class="figure-intro">Every non-decorative visual from the source paper is reproduced below, including the study’s reference images, field photograph, and result charts.</p>
      <div class="figure-grid">
        <figure class="figure-compact"><img src="../../../public/images/research/rhizofiltration-abbreviations.webp" alt="Abbreviation key defining HAB, microcystin-LR, microcystins, total suspended solids, biological oxygen demand, electrical conductivity, and phosphate" width="322" height="232" loading="lazy" decoding="async"><figcaption>Abbreviation key used in the paper. Source: Shannon (2023), reproduced in Shannon’s research report. <a href="../../../public/downloads/rhizofiltration-microcystis-water-hyacinth.pdf">Source PDF</a>.</figcaption></figure>
        <figure><img src="../../../public/images/research/rhizofiltration-baltic-hab.webp" alt="Satellite view of a swirling green harmful algal bloom surrounding an island in the Baltic Sea" width="478" height="371" loading="lazy" decoding="async"><figcaption>Satellite image illustrating the scale and visible structure of a large algal bloom. Source: European Space Agency (2019), as credited in Shannon’s report. <a href="../../../public/downloads/rhizofiltration-microcystis-water-hyacinth.pdf">Source PDF</a>.</figcaption></figure>
        <figure class="figure-wide"><img src="../../../public/images/research/rhizofiltration-mechanical-removal.webp" alt="A harvesting boat mechanically removing dense water hyacinth from the Euphrates River" width="1200" height="720" loading="lazy" decoding="async"><figcaption>A boat physically removes water hyacinth from the Euphrates River, illustrating the management burden created by dense mats. Source: AFP (2020), as credited in Shannon’s report. <a href="../../../public/downloads/rhizofiltration-microcystis-water-hyacinth.pdf">Source PDF</a>.</figcaption></figure>
        <figure><img src="../../../public/images/research/rhizofiltration-field-site.webp" alt="A duckweed-covered pond near the Empire State Trail used as a source for model soil" width="341" height="355" loading="lazy" decoding="async"><figcaption>Field site used to source soil for the constructed wetland models. Photograph: Paul Shannon (2023). <a href="../../../public/downloads/rhizofiltration-microcystis-water-hyacinth.pdf">Source PDF</a>.</figcaption></figure>
        <figure><img src="../../../public/images/research/rhizofiltration-secchi-depth.webp" alt="Line chart comparing Secchi depth in two water-hyacinth groups and a control after water hyacinth introduction" width="517" height="374" loading="lazy" decoding="async"><figcaption>Figure 1. Secchi depth decreased in the water-hyacinth groups while increasing in the control, an unexpected result that limits turbidity as a stand-alone proxy for cyanobacterial biomass. Source: Shannon (2024). <a href="../../../public/downloads/rhizofiltration-microcystis-water-hyacinth.pdf">Source PDF</a>.</figcaption></figure>
        <figure><img src="../../../public/images/research/rhizofiltration-tds.webp" alt="Line chart comparing total dissolved solids in two water-hyacinth groups and a control across the experiment" width="387" height="321" loading="lazy" decoding="async"><figcaption>Figure 2. Total dissolved solids declined more quickly in the water-hyacinth groups than in the control. Source: Shannon (2024). <a href="../../../public/downloads/rhizofiltration-microcystis-water-hyacinth.pdf">Source PDF</a>.</figcaption></figure>
      </div>
    </section>`;
  if (item.id === "climate-change-harmful-algal-blooms-genesee-finger-lakes") return `
    <section class="research-figures" aria-labelledby="climate-figures"><h2 id="climate-figures">Regional data and figures</h2>
      ${climateTable}
      <div class="figure-grid">
        <figure><img src="../../../public/images/research/climate-watershed-soils.webp" alt="Web Soil Survey map showing hydrologic soil groups around Conesus Lake" width="532" height="593" loading="lazy" decoding="async"><figcaption>Figure 1. Representative USDA Web Soil Survey analysis for the Conesus Lake watershed. Source: USDA Natural Resources Conservation Service Web Soil Survey, reproduced in Shannon (2025). <a href="../../../public/downloads/climate-change-habs-genesee-finger-lakes.pdf">Source PDF</a>.</figcaption></figure>
        <figure class="figure-wide"><img src="../../../public/images/research/climate-hab-report-trend.webp" alt="Line chart comparing harmful algal bloom reports in hotspot and non-hotspot counties from 2020 through 2024" width="1200" height="742" loading="lazy" decoding="async"><figcaption>Figure 2. Reported HAB submissions rose sharply in the three counties categorized as hotspots. Source: Paul Shannon’s analysis of NYSDEC report data (2020–2024). <a href="../../../public/downloads/climate-change-habs-genesee-finger-lakes.pdf">Source PDF</a>.</figcaption></figure>
        <figure class="figure-wide"><img src="../../../public/images/research/climate-reported-waterbodies.webp" alt="Line chart comparing the number of affected water bodies in hotspot and non-hotspot counties" width="1244" height="770" loading="lazy" decoding="async"><figcaption>Figure 3. The number of affected water bodies remained higher in the hotspot group. Source: Paul Shannon’s analysis of NYSDEC report data (2020–2024). <a href="../../../public/downloads/climate-change-habs-genesee-finger-lakes.pdf">Source PDF</a>.</figcaption></figure>
      </div>
    </section>`;
  if (item.id === "phytoremediation-habs-feasibility-review") return `
    <section class="research-figures" aria-labelledby="comparison-heading">
      <h2 id="comparison-heading">Feasibility framework and source figures</h2>
      <p class="figure-intro">The web table preserves the review’s comparison framework in an accessible format. The two embedded visuals below reproduce every additional table or figure contained in the source PDF.</p>
      ${macrophyteTable}
      <div class="figure-grid figure-grid-stacked">
        <figure><img src="../../../public/images/research/phytoremediation-rootzone-diversity.webp" alt="Table comparing Shannon, Simpson, and Chao-1 alpha-diversity indices across the water-hyacinth root zone and its lower and upper quartiles" width="616" height="218" loading="lazy" decoding="async"><figcaption>Table 2. Alpha-diversity indices for the <i>E. crassipes</i> root zone and its lower and upper quartiles. Source: Singh, Sodhi, and Singh (2024), reproduced in Shannon’s review. <a href="../../../public/downloads/phytoremediation-habs-literature-review.pdf">Source PDF</a>.</figcaption></figure>
        <figure><img src="../../../public/images/research/phytoremediation-duckweed-microbiome.webp" alt="Stacked bar charts comparing bacterial abundance in duckweed samples and a Venn diagram comparing bacterial communities" width="604" height="472" loading="lazy" decoding="async"><figcaption>Figure 1. Relative abundance and overlap of bacterial communities associated with duckweed samples. Source: Acosta et al. (2020), reproduced in Shannon’s review. <a href="https://doi.org/10.1371/journal.pone.0228560">Original study</a> · <a href="../../../public/downloads/phytoremediation-habs-literature-review.pdf">Source PDF</a>.</figcaption></figure>
      </div>
    </section>`;
  return "";
};

const renderReaderBlock = (block) => {
  if (block.type === "h2") return `<h2 id="${anchorFor(block.text)}">${esc(block.text)}</h2>`;
  if (block.type === "h3") return `<h3 id="${anchorFor(block.text)}">${esc(block.text)}</h3>`;
  if (block.type === "blockquote") return `<blockquote><p>${scientificText(block.text)}</p></blockquote>`;
  if (block.type === "reference") return `<p class="reference-entry">${scientificText(block.text)}</p>`;
  if (block.type === "note") return `<aside class="article-note"><strong>Original publication image credit</strong><span>${scientificText(block.text.replace(/^Image\s+courtesy\s*(?:of\s*)?/i, ""))}</span></aside>`;
  if (block.type === "pre") return `<pre class="research-data"><code>${esc(block.text)}</code></pre>`;
  if (block.type === "li") return `<li>${scientificText(block.text)}</li>`;
  return `<p>${scientificText(block.text)}</p>`;
};

const renderReaderBody = (reader, item) => {
  const output = [];
  let listItems = [];
  let mediaInserted = false;
  const flushList = () => {
    if (!listItems.length) return;
    output.push(`<ul class="reader-list">${listItems.map(renderReaderBlock).join("")}</ul>`);
    listItems = [];
  };
  for (const block of reader.blocks) {
    const insertionPoint = reader.report && (
      (item.id === "phytoremediation-habs-feasibility-review" && block.type === "h2" && block.text === "Eichhornia crassipes")
      || (item.id !== "phytoremediation-habs-feasibility-review" && block.type === "h2" && block.text === "References")
    );
    if (insertionPoint && !mediaInserted) {
      flushList();
      output.push(renderResearchMedia(item));
      mediaInserted = true;
    }
    if (block.type === "li") listItems.push(block);
    else {
      flushList();
      output.push(renderReaderBlock(block));
    }
  }
  flushList();
  if (reader.report && !mediaInserted) output.push(renderResearchMedia(item));
  return output.join("\n");
};

const renderRelated = (item, content, { rootPrefix = "../../", relatedPrefix = "../" } = {}) => `
      <section class="related-work" aria-labelledby="related-heading">
        <div class="section-heading compact-heading">
          <div><p class="small-label">Related work</p><h2 id="related-heading">Continue through the subject.</h2></div>
          <a href="${rootPrefix}portfolio.html">Browse the complete portfolio</a>
        </div>
        <div class="related-grid">
          ${relatedItems(item, content).map((related) => `
          <article class="related-card">
            <a class="related-image" href="${relatedPrefix}${related.id}/index.html"><img src="${rootPrefix}${esc(related.image)}" alt="${esc(related.imageAlt)}" width="1200" height="750" loading="lazy" decoding="async"></a>
            <p class="item-meta">${esc(related.type)} · ${esc(related.publisher)}</p>
            <h3><a href="${relatedPrefix}${related.id}/index.html">${esc(related.title)}</a></h3>
            <p>${scientificText(related.summary)}</p>
          </article>`).join("")}
        </div>
      </section>`;

const renderWorkPage = (item) => {
  const content = pageContentFor(item);
  const reader = readerFor(item);
  const canonical = `${origin}/work/${item.id}/`;
  const original = cleanLink(item.url || item.link);
  const originalHref = original ? (isExternal(original) ? original : `../../${original}`) : "";
  const sourceLabel = isPdf(original) ? "View original PDF" : "View original publisher";
  const description = truncateAtWord(`Project overview: ${item.summary}`, 158);
  const titleBase = (SEO_TITLES[item.id] || `${item.title} | Paul Shannon`).replace(/\s*\|\s*Paul Shannon$/, "");
  const crumbs = [
    { label: "Home", href: "../../index.html", canonical: `${origin}/` },
    { label: "Portfolio", href: "../../portfolio.html", canonical: `${origin}/portfolio/` },
    { label: item.title, href: "", canonical }
  ];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#page`,
        url: canonical,
        name: `${item.title} — Project overview`,
        description,
        mainEntity: { "@id": `${canonical}#project` },
        isPartOf: { "@id": websiteId }
      },
      {
        "@type": "CreativeWork",
        "@id": `${canonical}#project`,
        name: item.title,
        description: item.summary,
        creator: { "@id": authorId },
        ...(item.publisher === "Workinman Interactive" ? {
          author: { "@id": authorId },
          publisher: { "@type": "Organization", name: "Workinman Interactive", url: "https://workinman.com/" }
        } : {}),
        dateCreated: schemaDate(item),
        image: `${origin}/${item.image}`,
        about: item.tags,
        subjectOf: { "@id": `${reader.canonical}#article` }
      },
      personNode,
      breadcrumbSchema(crumbs)
    ]
  };
  const service = serviceFor(item);
  const summaryCards = (content.sections || []).slice(0, 3).map((section) => {
    const text = summaryCardText(item, section);
    return `<article><p class="small-label">${esc(section.heading)}</p><p>${scientificText(text)}</p></article>`;
  }).join("");
  const sourceAction = originalHref ? `<a class="button button-tertiary button-small" href="${esc(originalHref)}"${isExternal(original) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(sourceLabel)} <span aria-hidden="true">↗</span></a>` : "";

  return `<!doctype html>
<html lang="en">${head({
    title: `Project: ${titleBase}`,
    description,
    canonical,
    image: `${origin}/${item.image}`,
    imageAlt: item.imageAlt,
    prefix: "../../",
    schema
  })}
<body class="work-page overview-page">
${header("../../", "portfolio")}
  <main id="main" tabindex="-1">
    <div class="container">${breadcrumbs(crumbs)}</div>
    <article class="publication">
      <header class="publication-header container">
        <div class="publication-heading">
          <p class="kicker">${esc(content.eyebrow || `${item.type} · ${item.publisher}`)}</p>
          <h1${item.title.length > 76 ? ' class="long-title"' : ""}>${esc(item.title)}</h1>
          <p class="publication-lede">${scientificText(item.summary)}</p>
          <ul class="publication-meta" aria-label="Project details">
            <li><strong>By</strong> <a href="../../authors/paul-shannon/index.html" rel="author">Paul Shannon</a></li>
            <li><strong>Context</strong> ${esc(item.publisher)}</li>
            <li><strong>Date</strong> <time datetime="${esc(item.date)}">${esc(formatDate(item))}</time></li>
            <li><strong>Full ${reader.report ? "report" : reader.guide ? "guide" : "article"}</strong> ${reader.minutes} min read</li>
          </ul>
          <div class="actions publication-actions">
            <a class="button button-primary" href="${reader.href}">${reader.label} <span aria-hidden="true">→</span><span class="button-time">${reader.minutes} min</span></a>
            ${sourceAction}
          </div>
        </div>
        <figure class="publication-figure">
          <img src="../../${esc(item.image)}" alt="${esc(item.imageAlt)}" width="1200" height="750" fetchpriority="high" decoding="async">
          <figcaption>${esc(item.imageAlt)} <a href="../../image-credits.html">Image source and license</a>.</figcaption>
        </figure>
      </header>

      <section class="overview-summary container" aria-labelledby="summary-heading">
        <div class="overview-summary-intro">
          <p class="small-label">Project in 60 seconds</p>
          <h2 id="summary-heading">What it covers—and what Paul contributed.</h2>
          ${(content.overview || [item.summary]).map((paragraph) => `<p>${scientificText(paragraph)}</p>`).join("\n")}
        </div>
        <div class="overview-summary-grid">${summaryCards}</div>
      </section>

      ${renderSnapshot(item)}

      <div class="publication-grid container overview-details">
        <div class="article-body">
          ${(content.sections || []).map(renderSection).join("\n")}
          <section><h2>Paul’s role</h2><p>${scientificText(content.role || item.projectContext)}</p></section>
          <aside class="source-note" aria-labelledby="source-note-heading">
            <p class="small-label" id="source-note-heading">Reading note</p>
            <p>${reader.report
              ? "The complete paper is available as a semantic, accessible report on PaulWrites. The original PDF remains available as a secondary source document."
              : reader.authorizedClient
                ? "This authorized portfolio edition reproduces Paul’s complete public-facing article with permission. Paul Shannon is the author, and Workinman Interactive remains the original publisher."
              : reader.guide
                ? "This internal reading guide documents the subject and assignment without reproducing publisher-controlled copy. The official publisher remains the source for the complete client article."
                : "The complete independently published article is available as an owned PaulWrites web edition, with the original publication retained as a secondary source."}</p>
            ${originalHref ? `<a href="${esc(originalHref)}"${isExternal(original) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(sourceLabel)}</a>` : ""}
          </aside>
        </div>

        <aside class="project-facts" aria-label="Project facts">
          <p class="small-label">Project facts</p>
          <dl>
            <div><dt>Type</dt><dd>${esc(item.type)}</dd></div>
            <div><dt>Publication / context</dt><dd>${esc(item.publisher)}</dd></div>
            <div><dt>Audience</dt><dd>${esc(overviewAudience(item))}</dd></div>
            <div><dt>Published</dt><dd>${esc(formatDate(item))}</dd></div>
            <div><dt>Topics</dt><dd>${item.tags.map(esc).join(" · ")}</dd></div>
          </dl>
          <a class="text-link" href="${service.href}">Related service: ${esc(service.label)}</a>
        </aside>
      </div>

      <section class="read-next-band"><div class="container"><div><p class="small-label">Continue to the work</p><h2>${reader.label} on PaulWrites.</h2><p>${reader.guide ? "Read the on-site editorial guide, then use the publisher link for the protected article text." : "Open the complete, indexable web edition."}</p></div><div class="actions"><a class="button button-primary" href="${reader.href}">${reader.label} · ${reader.minutes} min</a>${sourceAction}</div></div></section>

      <section class="author-box container" aria-labelledby="author-heading"><div><p class="small-label">Author</p><h2 id="author-heading"><a href="../../authors/paul-shannon/index.html">Paul Shannon</a></h2></div><p>Paul is a Rochester-based professional writer studying Environmental Science &amp; Sustainability at Nazareth University. He specializes in research-heavy environmental, scientific, technical, and B2B subjects.</p></section>
      <div class="container">${renderRelated(item, content)}</div>
      <section class="article-cta"><div class="container simple-cta"><div><p class="small-label">Have a complex subject?</p><h2>Build the explanation around the evidence.</h2></div><a class="button button-primary" href="../../index.html#contact">Discuss a project</a></div></section>
    </article>
  </main>
${footer("../../")}
</body>
</html>`;
};

const renderReadingPage = (item) => {
  const project = pageContentFor(item);
  const reader = readerFor(item);
  const original = cleanLink(item.url || item.link);
  const originalHref = original ? (isExternal(original) ? original : `../../../${original}`) : "";
  const sourceLabel = isPdf(original) ? "View original PDF" : "View original publisher";
  const articleLabel = reader.report ? "Full research report" : reader.guide ? "Editorial portfolio guide" : "Full article";
  const description = truncateAtWord(reader.report
    ? `Read Paul Shannon’s complete research report: ${item.summary}`
    : reader.guide
      ? `Read Paul Shannon’s portfolio guide to ${item.title}, including the subject, editorial approach, and project context.`
      : `Read the complete article by Paul Shannon: ${item.summary}`, 158);
  const crumbs = [
    { label: "Home", href: "../../../index.html", canonical: `${origin}/` },
    { label: "Portfolio", href: "../../../portfolio.html", canonical: `${origin}/portfolio/` },
    { label: item.title, href: "../index.html", canonical: `${origin}/work/${item.id}/` },
    { label: reader.report ? "Full report" : reader.guide ? "Article guide" : "Full article", href: "", canonical: reader.canonical }
  ];
  const schemaType = reader.report ? "ScholarlyArticle" : reader.guide ? "Article" : "BlogPosting";
  const publisherNode = reader.authorizedClient
    ? { "@type": "Organization", name: "Workinman Interactive", url: "https://workinman.com/" }
    : { "@type": "ProfessionalService", "@id": `${origin}/#writing-service`, name: "PaulWrites", url: `${origin}/` };
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": schemaType,
        "@id": `${reader.canonical}#article`,
        headline: reader.guide ? `${item.title}: article guide` : item.title,
        description,
        url: reader.canonical,
        mainEntityOfPage: reader.canonical,
        datePublished: schemaDate(item),
        author: { "@id": authorId },
        publisher: publisherNode,
        image: `${origin}/${item.image}`,
        about: item.tags,
        articleSection: item.type,
        wordCount: reader.wordCount,
        timeRequired: `PT${reader.minutes}M`,
        isPartOf: { "@id": `${origin}/work/${item.id}/#project` },
        ...(reader.authorizedClient && isExternal(original) ? { sameAs: original } : {}),
        ...(original ? { isBasedOn: { "@type": isPdf(original) ? "ScholarlyArticle" : "CreativeWork", name: item.title, url: isExternal(original) ? original : `${origin}/${original}`, publisher: { "@type": "Organization", name: item.publisher } } } : {})
      },
      personNode,
      breadcrumbSchema(crumbs)
    ]
  };
  const service = serviceFor(item);
  const headings = reader.blocks.filter((block) => block.type === "h2").map((block) => block.text);
  const body = renderReaderBody(reader, item);
  const sourceAction = originalHref ? `<a href="${esc(originalHref)}"${isExternal(original) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(sourceLabel)} <span aria-hidden="true">↗</span></a>` : "";

  return `<!doctype html>
<html lang="en">${head({
    title: reader.guide ? `${item.title}: Article Guide | Paul Shannon` : item.seoTitle || SEO_TITLES[item.id] || `${item.title} | Paul Shannon`,
    description,
    canonical: reader.canonical,
    image: `${origin}/${item.image}`,
    imageAlt: item.imageAlt,
    type: "article",
    prefix: "../../../",
    schema
  })}
<body class="reading-page">
${header("../../../", "portfolio")}
  <main id="main" tabindex="-1">
    <div class="container">${breadcrumbs(crumbs)}</div>
    <article>
      <header class="reading-header container">
        <p class="kicker">${esc(articleLabel)} · ${esc(item.publisher)}</p>
        <h1${item.title.length > 76 ? ' class="long-title"' : ""}>${esc(item.title)}</h1>
        <p class="reading-dek">${scientificText(item.summary)}</p>
        <ul class="publication-meta" aria-label="Article details"><li><strong>Author</strong> <a href="../../../authors/paul-shannon/index.html" rel="author">Paul Shannon</a></li>${reader.authorizedClient ? '<li><strong>Original publisher</strong> <a href="https://workinman.com/" target="_blank" rel="noopener noreferrer">Workinman Interactive</a></li>' : ""}<li><strong>Published</strong> <time datetime="${esc(item.date)}">${esc(formatDate(item))}</time></li><li><strong>Reading time</strong> ${reader.minutes} min</li><li><strong>Words</strong> ${reader.wordCount.toLocaleString("en-US")}</li></ul>
        <div class="reading-context-links"><a href="../index.html">About this project</a>${sourceAction}</div>
        <figure class="reading-hero"><img src="../../../${esc(item.image)}" alt="${esc(item.imageAlt)}" width="1200" height="750" fetchpriority="high" decoding="async"><figcaption>${esc(item.imageAlt)} <a href="../../../image-credits.html">Image source and license</a>.</figcaption></figure>
      </header>

      <div class="reading-shell container">
        <div class="reading-main">
          ${reader.authorizedClient ? `<aside class="edition-note"><p class="small-label">Authorized portfolio edition</p><p>Written by Paul Shannon and originally published by Workinman Interactive. This complete, public-facing article is reproduced here with permission; Workinman Interactive remains the publisher.</p>${sourceAction}</aside>` : ""}
          ${reader.guide ? `<aside class="rights-note"><p class="small-label">Publisher-protected work</p><p>This page is an original portfolio guide to the assignment. It does not reproduce the client publication’s protected text. ${originalHref ? "The official publisher link provides the complete published article." : "The supplied source did not provide a verified matching article URL, so no external reading link is shown."}</p>${sourceAction}</aside>` : ""}
          ${renderSnapshot(item)}
          ${headings.length > 2 ? `<nav class="reader-toc" aria-label="On this page"><p class="small-label">On this page</p><ol>${headings.map((heading) => `<li><a href="#${anchorFor(heading)}">${scientificText(heading)}</a></li>`).join("")}</ol></nav>` : ""}
          <div class="reading-copy">${body}</div>
        </div>
        <aside class="reader-context" aria-label="Article context"><p class="small-label">Portfolio context</p><p>${scientificText(item.summary)}</p><a class="text-link" href="../index.html">Project overview and Paul’s role</a><a class="text-link" href="${service.href.replace("../../", "../../../")}">${esc(service.label)}</a>${originalHref ? sourceAction : ""}</aside>
      </div>

      <section class="project-funnel"><div class="container"><div><p class="small-label">About this project</p><h2>See the assignment, process, and Paul’s contribution.</h2><p>${scientificText(project.role || item.projectContext)}</p></div><div class="funnel-links"><a class="button button-secondary" href="../index.html">Back to project overview</a><a class="button button-primary" href="../../../index.html#contact">Discuss a project</a></div></div></section>
      <section class="author-box container" aria-labelledby="reader-author"><div><p class="small-label">Author</p><h2 id="reader-author"><a href="../../../authors/paul-shannon/index.html">Paul Shannon</a></h2></div><p>Paul is a Rochester-based environmental science student, researcher, and professional writer focused on scientific, technical, and research-heavy subjects. <a href="../../../authors/paul-shannon/index.html">Read his background and credentials.</a></p></section>
      <div class="container">${renderRelated(item, project, { rootPrefix: "../../../", relatedPrefix: "../../" })}</div>
    </article>
  </main>
${footer("../../../")}
</body>
</html>`;
};

const portfolioStaticCard = (item, index) => {
  const original = cleanLink(item.url || item.link);
  const originalLabel = isPdf(original) ? "View source PDF" : "View original";
  return `
        <article class="portfolio-item" id="${esc(item.id)}">
          <div class="portfolio-date"><time datetime="${esc(item.date)}">${esc(formatDate(item))}</time></div>
          <a class="portfolio-image-link" href="work/${esc(item.id)}/index.html" aria-label="Read ${esc(item.title)}">
            <img class="portfolio-image" src="${esc(item.image)}" alt="${esc(item.imageAlt)}" width="1200" height="750" loading="${index < 2 ? "eager" : "lazy"}"${index < 2 ? ' fetchpriority="high"' : ""} decoding="async">
          </a>
          <div class="portfolio-copy">
            <p class="item-meta">${esc(item.type)} · ${esc(item.publisher)} · Est. ${readingMinutesFor(item)} min read</p>
            <h2><a href="work/${esc(item.id)}/index.html">${esc(item.title)}</a></h2>
            <p>${scientificText(item.summary)}</p>
            <ul class="tag-list" aria-label="Topics">${item.tags.map((tag) => `<li>${esc(tag)}</li>`).join("")}</ul>
            <div class="work-actions">
              <a class="work-link" href="work/${esc(item.id)}/index.html">Read <span aria-hidden="true">→</span></a>
              <details class="project-notes-native"><summary>Project details</summary><div class="project-notes-copy"><p>${scientificText(item.projectContext)}</p></div></details>
              ${original ? `<a class="original-link" href="${esc(original)}"${isExternal(original) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(originalLabel)} <span aria-hidden="true">↗</span></a>` : ""}
            </div>
          </div>
        </article>`;
};

const renderPortfolio = () => {
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  const canonical = `${origin}/portfolio/`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#page`,
        url: canonical,
        name: "Writing Portfolio and Research — Paul Shannon",
        description: "Environmental science writing, technical client work, research, interactive media articles, SEO content, and scientific communication by Paul Shannon.",
        author: { "@id": authorId },
        isPartOf: { "@id": websiteId },
        hasPart: sorted.flatMap((item) => [
          { "@id": `${origin}/work/${item.id}/#project` },
          { "@id": `${readerFor(item).canonical}#article` }
        ])
      },
      personNode
    ]
  };
  return `<!doctype html>
<html lang="en">${head({
    title: "Writing Portfolio: Science, Technical & SEO | Paul Shannon",
    description: "Browse Paul Shannon’s environmental science and technical writing, original research, interactive-media articles, SEO content, and scientific communication.",
    canonical,
    image: `${origin}/public/images/work/lake-erie-hab.webp`,
    imageAlt: "A green-blue algal bloom lining the shore of Lake Erie",
    prefix: "",
    schema
  })}
<body>
${header("", "portfolio")}
  <main id="main" tabindex="-1">
    <section class="page-intro container">
      <p class="kicker">Portfolio &amp; published writing</p>
      <h1>Environmental research, technical writing, and published work.</h1>
      <p>Browse original research, scientific communication, Workinman Interactive client articles, SEO content, regional environmental reporting, and independent commentary. Every item has an owned PaulWrites project page; filters make the complete library easier to narrow without hiding it from search engines.</p>
    </section>

    <section class="portfolio-section container" aria-labelledby="work-heading">
      <div class="portfolio-tools" data-portfolio-tools hidden>
        <div>
          <p class="filter-label" id="filter-label">Filter by topic</p>
          <div class="filter-list" role="group" aria-labelledby="filter-label" data-filter-list></div>
        </div>
        <p class="result-count" role="status" aria-live="polite" data-result-count></p>
      </div>
      <div class="portfolio-list" data-portfolio-list>
        <h2 class="visually-hidden" id="work-heading">Complete portfolio</h2>
${sorted.map(portfolioStaticCard).join("")}
      </div>
      <nav class="pagination" aria-label="Portfolio pages" data-pagination hidden></nav>
    </section>

    <section class="portfolio-cta">
      <div class="container simple-cta">
        <div><p class="small-label">Have a complex subject?</p><h2>Tell me what your reader needs to understand.</h2></div>
        <a class="button button-primary" href="index.html#contact">Discuss a project</a>
      </div>
    </section>
  </main>
${footer("")}
  <script src="reading-times.js" defer></script>
  <script src="posts.js" defer></script>
  <script src="portfolio.js" defer></script>
</body>
</html>`;
};

const serviceProofCard = (item, prefix = "../") => `
        <article class="proof-card">
          <a class="proof-card-image" href="${prefix}work/${item.id}/index.html"><img src="${prefix}${esc(item.image)}" alt="${esc(item.imageAlt)}" width="1200" height="750" loading="lazy" decoding="async"></a>
          <p class="item-meta">${esc(item.type)} · ${esc(item.publisher)}</p>
          <h3><a href="${prefix}work/${item.id}/index.html">${esc(item.title)}</a></h3>
          <p>${scientificText(item.summary)}</p>
        </article>`;

const renderServicePage = (service) => {
  const canonical = `${origin}/${service.slug}/`;
  const proof = service.portfolioIds.map((id) => items.find((item) => item.id === id)).filter(Boolean);
  const crumbs = [
    { label: "Home", href: "../index.html", canonical: `${origin}/` },
    { label: "Services", href: "../services/index.html", canonical: `${origin}/services/` },
    { label: service.eyebrow, href: "", canonical }
  ];
  const image = proof[0]?.image || "public/images/work/rochester.webp";
  const imageAlt = proof[0]?.imageAlt || "Genesee River and downtown Rochester under a blue sky";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${canonical}#service`,
        name: service.eyebrow,
        description: service.description,
        url: canonical,
        provider: { "@type": "ProfessionalService", "@id": `${origin}/#writing-service`, name: "PaulWrites", founder: { "@id": authorId } },
        areaServed: "United States",
        serviceType: service.deliverables
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: service.faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer }
        }))
      },
      personNode,
      breadcrumbSchema(crumbs)
    ]
  };
  return `<!doctype html>
<html lang="en">${head({
    title: service.title,
    description: service.description,
    canonical,
    image: `${origin}/${image}`,
    imageAlt,
    prefix: "../",
    schema
  })}
<body class="service-page">
${header("../", "services")}
  <main id="main" tabindex="-1">
    <div class="container">${breadcrumbs(crumbs)}</div>
    <section class="service-hero container">
      <p class="kicker">${esc(service.eyebrow)}</p>
      <h1>${esc(service.h1)}</h1>
      <p class="service-lede">${scientificText(service.lede)}</p>
      <div class="actions"><a class="button button-primary" href="../index.html#contact">Discuss this kind of project</a><a class="button button-secondary" href="#proof">See relevant work</a></div>
    </section>

    <section class="service-copy container">
      <div class="article-body">
        <h2>When the subject needs more than surface-level copy</h2>
        ${service.opening.map((paragraph) => `<p>${scientificText(paragraph)}</p>`).join("")}
        <h2>What Paul can produce</h2>
        <ul class="deliverable-list">${service.deliverables.map((deliverable) => `<li>${esc(deliverable)}</li>`).join("")}</ul>
        <h2>Source material</h2>
        <p>${scientificText(service.sourceMaterial)}</p>
      </div>
      <aside class="project-facts" aria-label="Working process">
        <p class="small-label">Working process</p>
        <ol class="process-list">${service.process.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>
        <a class="text-link" href="../authors/paul-shannon/index.html">About Paul’s research background</a>
      </aside>
    </section>

    <section class="section section-muted" id="proof" aria-labelledby="proof-heading">
      <div class="container">
        <div class="section-heading compact-heading"><div><p class="small-label">Relevant evidence</p><h2 id="proof-heading">Work connected to this service.</h2></div><a href="../portfolio.html">View the complete portfolio</a></div>
        <div class="proof-grid">${proof.map((item) => serviceProofCard(item)).join("")}</div>
      </div>
    </section>

    <section class="section container faq-section" aria-labelledby="faq-heading">
      <p class="small-label">Questions</p><h2 id="faq-heading">Useful before an inquiry.</h2>
      <div class="faq-list">${service.faqs.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${scientificText(answer)}</p></details>`).join("")}</div>
    </section>

    <section class="article-cta"><div class="container simple-cta"><div><p class="small-label">Next step</p><h2>Share the subject, audience, and source material.</h2></div><a class="button button-primary" href="../index.html#contact">Discuss a project</a></div></section>
  </main>
${footer("../")}
</body>
</html>`;
};

const renderServicesIndex = () => {
  const canonical = `${origin}/services/`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${origin}/#writing-service`,
        name: "PaulWrites",
        url: `${origin}/`,
        founder: { "@id": authorId },
        areaServed: "United States",
        description: "Environmental science, technical, SEO, research-driven writing, and editing services."
      },
      personNode,
      breadcrumbSchema([
        { label: "Home", canonical: `${origin}/` },
        { label: "Services", canonical }
      ])
    ]
  };
  return `<!doctype html>
<html lang="en">${head({
    title: "Writing Services for Complex Subjects | Paul Shannon",
    description: "Environmental science writing, technical and B2B content, research-driven SEO articles, web copy, thought leadership, and substantive editing by Paul Shannon.",
    canonical,
    image: `${origin}/public/images/work/digital-board-games.webp`,
    imageAlt: "Board-game pieces beside an article title about making digital board games feel real",
    prefix: "../",
    schema
  })}
<body>
${header("../", "services")}
  <main id="main" tabindex="-1">
    <div class="container">${breadcrumbs([
      { label: "Home", href: "../index.html" },
      { label: "Services", href: "" }
    ])}</div>
    <section class="page-intro container services-intro">
      <p class="kicker">Writing services</p>
      <h1>Research-driven writing for subjects that take time to understand.</h1>
      <p>Paul works with environmental organizations, technical and creative teams, agencies, and research-heavy businesses that need accurate source material turned into clear published content.</p>
    </section>
    <section class="section container service-route-grid" aria-label="Primary writing services">
      ${SERVICE_PAGES.map((service, index) => `<article><span class="route-number" aria-hidden="true">0${index + 1}</span><h2><a href="../${service.slug}/index.html">${esc(service.eyebrow)}</a></h2><p>${scientificText(service.description)}</p><a class="text-link" href="../${service.slug}/index.html">Explore this service</a></article>`).join("")}
    </section>
    <section class="section section-muted"><div class="container service-support"><div><p class="small-label">Additional support</p><h2>Web copy, thought leadership, editing, and agency capacity.</h2></div><p>Projects can also include landing pages, interview-led thought leadership, source review, substantive editing, fact-checking support, and dependable overflow work inside an established editorial process.</p></div></section>
    <section class="article-cta"><div class="container simple-cta"><div><p class="small-label">Project inquiry</p><h2>Start with what needs to become clear.</h2></div><a class="button button-primary" href="../index.html#contact">Discuss a project</a></div></section>
  </main>
${footer("../")}
</body>
</html>`;
};

const renderAuthor = () => {
  const canonical = `${origin}/authors/paul-shannon/`;
  const representative = [
    "climate-change-harmful-algal-blooms-genesee-finger-lakes",
    "games-for-brands",
    "phytoremediation-habs-feasibility-review"
  ].map((id) => items.find((item) => item.id === id)).filter(Boolean);
  const crumbs = [
    { label: "Home", href: "../../index.html", canonical: `${origin}/` },
    { label: "Authors", href: "", canonical: `${origin}/authors/` },
    { label: "Paul Shannon", href: "", canonical }
  ];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${canonical}#profile-page`,
        url: canonical,
        name: AUTHOR_COPY.title,
        description: AUTHOR_COPY.description,
        mainEntity: { "@id": authorId },
        isPartOf: { "@id": websiteId },
        dateModified: today
      },
      personNode,
      breadcrumbSchema(crumbs)
    ]
  };
  return `<!doctype html>
<html lang="en">${head({
    title: AUTHOR_COPY.title,
    description: AUTHOR_COPY.description,
    canonical,
    image: `${origin}/public/images/work/rochester.webp`,
    imageAlt: "Genesee River and downtown Rochester under a blue sky",
    prefix: "../../",
    schema
  })}
<body class="author-page">
${header("../../", "about")}
  <main id="main" tabindex="-1">
    <div class="container">${breadcrumbs(crumbs)}</div>
    <section class="author-hero container">
      <p class="kicker">Writer · Environmental scientist · Researcher</p>
      <h1>${esc(AUTHOR_COPY.h1)}</h1>
      <p class="author-lede">${scientificText(AUTHOR_COPY.lede)}</p>
      <div class="actions"><a class="button button-primary" href="../../portfolio.html">View Paul’s work</a><a class="button button-secondary" href="mailto:pshannon@paulwrites.net">pshannon@paulwrites.net</a></div>
    </section>

    <section class="author-layout container">
      <div class="article-body">
        <h2>Writing, science, and research reinforce one another.</h2>
        ${AUTHOR_COPY.narrative.map((paragraph) => `<p>${scientificText(paragraph)}</p>`).join("")}
        <h2>Environmental research</h2>
        <p>Paul’s research experience includes harmful algal blooms, cyanobacteria, freshwater systems, climate and precipitation analysis, rhizofiltration, phytoremediation, environmental remediation, and scientific literature review. His work has included original experiments, regional data analysis, and feasibility-focused synthesis.</p>
        <h2>Professional writing</h2>
        <p>Through PaulWrites, Paul produces long-form articles, SEO content, web and landing-page copy, thought leadership, LinkedIn ghostwriting, technical content, scientific communication, and editing. His Workinman Interactive work translated game design, interactive media, experiential technology, and product updates within a collaborative studio workflow.</p>
      </div>
      <aside class="credential-list" aria-label="Education and experience">
        <section><p class="small-label">Education</p><h2>Nazareth University</h2><p>B.S. Environmental Science &amp; Sustainability<br>Minor in Biology<br>Expected May 2027</p></section>
        <section><p class="small-label">Experience</p><ul><li>PaulWrites — Founder &amp; Freelance Writer, 2022–Present</li><li>Workinman Interactive — Freelance Copywriter, April 2025–April 2026</li><li>Climate Solutions Accelerator — Volunteer Researcher, November 2024–Present</li><li>BrookEdge Academy — Writer, Editor &amp; Educational Resource Designer, February 2023–Present</li><li>University at Albany — Student Researcher, September 2021–June 2024</li></ul></section>
        <section><p class="small-label">Recognition</p><ul><li>American Society for Microbiology Award</li><li>Regeneron Certificate of Excellence</li></ul></section>
        <section><p class="small-label">Location</p><p>Rochester, New York</p></section>
      </aside>
    </section>

    <section class="section section-muted" aria-labelledby="representative-heading"><div class="container"><div class="section-heading compact-heading"><div><p class="small-label">Representative work</p><h2 id="representative-heading">Research and published writing.</h2></div><a href="../../portfolio.html">Browse all work</a></div><div class="proof-grid">${representative.map((item) => serviceProofCard(item, "../../")).join("")}</div></div></section>
    <section class="article-cta"><div class="container simple-cta"><div><p class="small-label">Contact</p><h2>Have a research-heavy subject to explain?</h2></div><a class="button button-primary" href="../../index.html#contact">Discuss a project</a></div></section>
  </main>
${footer("../../")}
</body>
</html>`;
};

const sitemapRoutes = [
  { path: "/", priority: "1.0", lastmod: today },
  { path: "/portfolio/", priority: "0.9", lastmod: today },
  { path: "/services/", priority: "0.8", lastmod: today },
  ...SERVICE_PAGES.map((service) => ({ path: `/${service.slug}/`, priority: "0.8", lastmod: today })),
  { path: "/authors/paul-shannon/", priority: "0.7", lastmod: today },
  ...items.flatMap((item) => [
    { path: `/work/${item.id}/`, priority: isResearch(item) ? "0.8" : "0.7", lastmod: item.date },
    { path: `/work/${item.id}/${readerFor(item).segment}/`, priority: readerFor(item).complete ? "0.8" : "0.6", lastmod: item.date }
  ]),
  { path: "/privacy/", priority: "0.2", lastmod: today },
  { path: "/accessibility/", priority: "0.3", lastmod: today },
  { path: "/image-credits/", priority: "0.2", lastmod: today }
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRoutes.map((route) => `  <url><loc>${origin}${route.path}</loc><lastmod>${route.lastmod}</lastmod><priority>${route.priority}</priority></url>`).join("\n")}
</urlset>\n`;

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PaulWrites — Published work and research</title>
    <link>${origin}/</link>
    <description>Environmental science, technical writing, research, and independent articles by Paul Shannon.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(`${today}T12:00:00Z`).toUTCString()}</lastBuildDate>
    <atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml" />
${[...items].sort((a, b) => b.date.localeCompare(a.date)).map((item) => {
  const reader = readerFor(item);
  return `    <item><title>${esc(reader.guide ? `${item.title}: article guide` : item.title)}</title><link>${reader.canonical}</link><guid isPermaLink="true">${reader.canonical}</guid><pubDate>${new Date(`${item.date}T12:00:00Z`).toUTCString()}</pubDate><description>${esc(item.summary)}</description><author>pshannon@paulwrites.net (Paul Shannon)</author></item>`;
}).join("\n")}
  </channel>
</rss>\n`;

const readingTimesScript = `window.PAULWRITES_READING_TIMES = ${JSON.stringify(Object.fromEntries(items.map((item) => [item.id, readingMinutesFor(item)])), null, 2)};\n`;

const redirects = [
  "/index.html / 301",
  "/portfolio /portfolio/ 301",
  "/portfolio.html /portfolio/ 301",
  "/services /services/ 301",
  ...SERVICE_PAGES.flatMap((service) => [
    `/${service.slug} /${service.slug}/ 301`,
    `/${service.slug}/index.html /${service.slug}/ 301`
  ]),
  "/authors/paul-shannon /authors/paul-shannon/ 301",
  "/authors/paul-shannon/index.html /authors/paul-shannon/ 301",
  ...items.flatMap((item) => [
    `/work/${item.id} /work/${item.id}/ 301`,
    `/work/${item.id}/index.html /work/${item.id}/ 301`,
    `/work/${item.id}/${readerFor(item).segment} /work/${item.id}/${readerFor(item).segment}/ 301`,
    `/work/${item.id}/${readerFor(item).segment}/index.html /work/${item.id}/${readerFor(item).segment}/ 301`
  ]),
  "/work /portfolio/ 301",
  "/work/ /portfolio/ 301",
  "/articles /portfolio/ 301",
  "/articles/ /portfolio/ 301",
  "/about /authors/paul-shannon/ 301",
  "/about/ /authors/paul-shannon/ 301",
  "/contact /#contact 301",
  "/contact/ /#contact 301",
  "/privacy /privacy/ 301",
  "/privacy.html /privacy/ 301",
  "/accessibility /accessibility/ 301",
  "/accessibility.html /accessibility/ 301",
  "/image-credits /image-credits/ 301",
  "/image-credits.html /image-credits/ 301"
].join("\n") + "\n";

for (const directory of ["work", "services", "authors", ...SERVICE_PAGES.map((service) => service.slug)]) {
  await rm(path.join(root, directory), { recursive: true, force: true });
}

for (const item of items) {
  const directory = path.join(root, "work", item.id);
  await mkdir(directory, { recursive: true });
  await writeGenerated(path.join(directory, "index.html"), renderWorkPage(item));
  const reader = readerFor(item);
  const readingDirectory = path.join(directory, reader.segment);
  await mkdir(readingDirectory, { recursive: true });
  await writeGenerated(path.join(readingDirectory, "index.html"), renderReadingPage(item));
}

for (const service of SERVICE_PAGES) {
  const directory = path.join(root, service.slug);
  await mkdir(directory, { recursive: true });
  await writeGenerated(path.join(directory, "index.html"), renderServicePage(service));
}

await mkdir(path.join(root, "services"), { recursive: true });
await writeGenerated(path.join(root, "services", "index.html"), renderServicesIndex());

await mkdir(path.join(root, "authors", "paul-shannon"), { recursive: true });
await writeGenerated(path.join(root, "authors", "paul-shannon", "index.html"), renderAuthor());

await writeGenerated(path.join(root, "portfolio.html"), renderPortfolio());
await writeGenerated(path.join(root, "sitemap.xml"), sitemap);
await writeGenerated(path.join(root, "feed.xml"), feed);
await writeGenerated(path.join(root, "reading-times.js"), readingTimesScript);
await writeGenerated(path.join(root, "_redirects"), redirects);

console.log(`Generated ${items.length} project overviews, ${items.length} reading pages, ${SERVICE_PAGES.length + 1} service pages, the author page, portfolio, RSS, sitemap, and canonical redirects.`);
