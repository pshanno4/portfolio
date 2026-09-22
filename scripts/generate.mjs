import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { AUTHOR_COPY, SERVICE_PAGES, WORK_PAGE_CONTENT } from "./site-content.mjs";

const root = process.cwd();
const origin = "https://paulwrites.net";
const today = "2026-09-22";
const authorId = `${origin}/authors/paul-shannon/#person`;
const websiteId = `${origin}/#website`;
const favicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='10' fill='%23166534'/%3E%3Cpath d='M18 48V16h16c9 0 14 5 14 13s-5 13-14 13h-7v6H18zm9-15h7c3 0 5-1 5-4s-2-4-5-4h-7v8z' fill='white'/%3E%3C/svg%3E";
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
            ${(section.paragraphs || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join("\n")}
            ${(section.bullets || []).length ? `<ul>${section.bullets.map((bullet) => `<li>${esc(bullet)}</li>`).join("")}</ul>` : ""}
          </section>`;

const renderRelated = (item, content) => `
      <section class="related-work" aria-labelledby="related-heading">
        <div class="section-heading compact-heading">
          <div><p class="small-label">Related work</p><h2 id="related-heading">Continue through the subject.</h2></div>
          <a href="../../portfolio.html">Browse the complete portfolio</a>
        </div>
        <div class="related-grid">
          ${relatedItems(item, content).map((related) => `
          <article class="related-card">
            <a class="related-image" href="../${related.id}/index.html"><img src="../../${esc(related.image)}" alt="${esc(related.imageAlt)}" width="1200" height="750" loading="lazy" decoding="async"></a>
            <p class="item-meta">${esc(related.type)} · ${esc(related.publisher)}</p>
            <h3><a href="../${related.id}/index.html">${esc(related.title)}</a></h3>
            <p>${esc(related.summary)}</p>
          </article>`).join("")}
        </div>
      </section>`;

const renderWorkPage = (item) => {
  const content = pageContentFor(item);
  const canonical = `${origin}/work/${item.id}/`;
  const original = cleanLink(item.url || item.link);
  const originalHref = isExternal(original) ? original : `../../${original}`;
  const sourceLabel = isPdf(original) ? "View source PDF" : `View original on ${item.publisher}`;
  const localMinutes = localReadMinutes(content);
  const description = item.seoDescription || item.summary;
  const schemaType = isResearch(item) ? "ScholarlyArticle" : "Article";
  const crumbs = [
    { label: "Home", href: "../../index.html", canonical: `${origin}/` },
    { label: "Portfolio", href: "../../portfolio.html", canonical: `${origin}/portfolio/` },
    { label: item.title, href: "", canonical }
  ];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": schemaType,
        "@id": `${canonical}#work`,
        headline: item.title,
        name: item.title,
        description,
        url: canonical,
        mainEntityOfPage: canonical,
        datePublished: item.date,
        dateModified: today,
        author: { "@id": authorId },
        publisher: { "@type": "ProfessionalService", "@id": `${origin}/#writing-service`, name: "PaulWrites", url: `${origin}/` },
        image: `${origin}/${item.image}`,
        about: item.tags,
        articleSection: item.type,
        timeRequired: `PT${localMinutes}M`,
        isBasedOn: {
          "@type": isPdf(original) ? "ScholarlyArticle" : "CreativeWork",
          name: item.title,
          url: isExternal(original) ? original : `${origin}/${original}`,
          publisher: { "@type": "Organization", name: item.publisher }
        }
      },
      personNode,
      breadcrumbSchema(crumbs)
    ]
  };
  const service = serviceFor(item);
  return `<!doctype html>
<html lang="en">${head({
    title: item.seoTitle || SEO_TITLES[item.id] || `${item.title} | Paul Shannon`,
    description,
    canonical,
    image: `${origin}/${item.image}`,
    imageAlt: item.imageAlt,
    type: "article",
    prefix: "../../",
    schema
  })}
<body class="work-page">
${header("../../", "portfolio")}
  <main id="main" tabindex="-1">
    <div class="container">${breadcrumbs(crumbs)}</div>
    <article class="publication">
      <header class="publication-header container">
        <div class="publication-heading">
          <p class="kicker">${esc(content.eyebrow || `${item.type} · ${item.publisher}`)}</p>
          <h1>${esc(item.title)}</h1>
          <p class="publication-lede">${esc(item.summary)}</p>
          <ul class="publication-meta" aria-label="Publication details">
            <li><strong>By</strong> <a href="../../authors/paul-shannon/index.html" rel="author">Paul Shannon</a></li>
            <li><strong>Original publication</strong> ${esc(item.publisher)}</li>
            <li><strong>Date</strong> <time datetime="${esc(item.date)}">${esc(formatDate(item))}</time></li>
            <li><strong>Reading time</strong> ${localMinutes} min</li>
          </ul>
          <div class="actions publication-actions">
            <a class="button button-secondary button-small" href="${esc(originalHref)}"${isExternal(original) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(sourceLabel)} <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <figure class="publication-figure">
          <img src="../../${esc(item.image)}" alt="${esc(item.imageAlt)}" width="1200" height="750" fetchpriority="high" decoding="async">
          <figcaption>${esc(item.imageAlt)} <a href="../../image-credits.html">Image source and license</a>.</figcaption>
        </figure>
      </header>

      <div class="publication-grid container">
        <div class="article-body">
          <section>
            <h2>About this work</h2>
            ${(content.overview || [item.summary]).map((paragraph) => `<p>${esc(paragraph)}</p>`).join("\n")}
          </section>
          ${(content.sections || []).map(renderSection).join("\n")}
          <section>
            <h2>Paul’s role</h2>
            <p>${esc(content.role || item.projectContext)}</p>
          </section>
          <aside class="source-note" aria-labelledby="source-note-heading">
            <p class="small-label" id="source-note-heading">Publication note</p>
            <p>${isPdf(original)
              ? "This HTML page presents the research in an accessible web format. The complete paper, references, tables, and figures remain available in the source PDF."
              : "This is an original PaulWrites project page documenting the assignment, editorial approach, and Paul’s contribution. It does not reproduce the complete external publication; use the source link to read the published article."}</p>
            <a href="${esc(originalHref)}"${isExternal(original) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(sourceLabel)}</a>
          </aside>
        </div>

        <aside class="project-facts" aria-label="Project facts">
          <p class="small-label">Project facts</p>
          <dl>
            <div><dt>Type</dt><dd>${esc(item.type)}</dd></div>
            <div><dt>Publication / context</dt><dd>${esc(item.publisher)}</dd></div>
            <div><dt>Published</dt><dd>${esc(formatDate(item))}</dd></div>
            <div><dt>Topics</dt><dd>${item.tags.map(esc).join(" · ")}</dd></div>
          </dl>
          <a class="text-link" href="${service.href}">Related service: ${esc(service.label)}</a>
        </aside>
      </div>

      <section class="author-box container" aria-labelledby="author-heading">
        <div>
          <p class="small-label">Author</p>
          <h2 id="author-heading"><a href="../../authors/paul-shannon/index.html">Paul Shannon</a></h2>
        </div>
        <p>Paul is a Rochester-based professional writer studying Environmental Science &amp; Sustainability at Nazareth University. He specializes in research-heavy environmental, scientific, technical, and B2B subjects.</p>
      </section>

      <div class="container">${renderRelated(item, content)}</div>

      <section class="article-cta">
        <div class="container simple-cta">
          <div><p class="small-label">Have a complex subject?</p><h2>Build the explanation around the evidence.</h2></div>
          <a class="button button-primary" href="../../index.html#contact">Discuss a project</a>
        </div>
      </section>
    </article>
  </main>
${footer("../../")}
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
            <p class="item-meta">${esc(item.type)} · ${esc(item.publisher)} · Est. ${Number(item.readingMinutes) || 4} min read</p>
            <h2><a href="work/${esc(item.id)}/index.html">${esc(item.title)}</a></h2>
            <p>${esc(item.summary)}</p>
            <ul class="tag-list" aria-label="Topics">${item.tags.map((tag) => `<li>${esc(tag)}</li>`).join("")}</ul>
            <div class="work-actions">
              <a class="work-link" href="work/${esc(item.id)}/index.html">Read <span aria-hidden="true">→</span></a>
              <details class="project-notes-native"><summary>Project details</summary><div class="project-notes-copy"><p>${esc(item.projectContext)}</p></div></details>
              <a class="original-link" href="${esc(original)}"${isExternal(original) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(originalLabel)} <span aria-hidden="true">↗</span></a>
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
        hasPart: sorted.map((item) => ({ "@id": `${origin}/work/${item.id}/#work` }))
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
          <p>${esc(item.summary)}</p>
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
      <p class="service-lede">${esc(service.lede)}</p>
      <div class="actions"><a class="button button-primary" href="../index.html#contact">Discuss this kind of project</a><a class="button button-secondary" href="#proof">See relevant work</a></div>
    </section>

    <section class="service-copy container">
      <div class="article-body">
        <h2>When the subject needs more than surface-level copy</h2>
        ${service.opening.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
        <h2>What Paul can produce</h2>
        <ul class="deliverable-list">${service.deliverables.map((deliverable) => `<li>${esc(deliverable)}</li>`).join("")}</ul>
        <h2>Source material</h2>
        <p>${esc(service.sourceMaterial)}</p>
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
      <div class="faq-list">${service.faqs.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join("")}</div>
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
      ${SERVICE_PAGES.map((service, index) => `<article><span class="route-number" aria-hidden="true">0${index + 1}</span><h2><a href="../${service.slug}/index.html">${esc(service.eyebrow)}</a></h2><p>${esc(service.description)}</p><a class="text-link" href="../${service.slug}/index.html">Explore this service</a></article>`).join("")}
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
      <p class="author-lede">${esc(AUTHOR_COPY.lede)}</p>
      <div class="actions"><a class="button button-primary" href="../../portfolio.html">View Paul’s work</a><a class="button button-secondary" href="mailto:pshannon@paulwrites.net">pshannon@paulwrites.net</a></div>
    </section>

    <section class="author-layout container">
      <div class="article-body">
        <h2>Writing, science, and research reinforce one another.</h2>
        ${AUTHOR_COPY.narrative.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
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
  ...items.map((item) => ({ path: `/work/${item.id}/`, priority: isResearch(item) ? "0.8" : "0.7", lastmod: item.date })),
  { path: "/privacy/", priority: "0.2", lastmod: today },
  { path: "/accessibility/", priority: "0.3", lastmod: today },
  { path: "/image-credits/", priority: "0.2", lastmod: today }
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRoutes.map((route) => `  <url><loc>${origin}${route.path}</loc><lastmod>${route.lastmod}</lastmod><priority>${route.priority}</priority></url>`).join("\n")}
</urlset>\n`;

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
    `/work/${item.id}/index.html /work/${item.id}/ 301`
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
  await writeFile(path.join(directory, "index.html"), renderWorkPage(item));
}

for (const service of SERVICE_PAGES) {
  const directory = path.join(root, service.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), renderServicePage(service));
}

await mkdir(path.join(root, "services"), { recursive: true });
await writeFile(path.join(root, "services", "index.html"), renderServicesIndex());

await mkdir(path.join(root, "authors", "paul-shannon"), { recursive: true });
await writeFile(path.join(root, "authors", "paul-shannon", "index.html"), renderAuthor());

await writeFile(path.join(root, "portfolio.html"), renderPortfolio());
await writeFile(path.join(root, "sitemap.xml"), sitemap);
await writeFile(path.join(root, "_redirects"), redirects);

console.log(`Generated ${items.length} work pages, ${SERVICE_PAGES.length + 1} service pages, the author page, portfolio, sitemap, and canonical redirects.`);
