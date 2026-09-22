(() => {
  "use strict";

  const rawItems = Array.isArray(window.PAULWRITES_ITEMS) ? window.PAULWRITES_ITEMS : [];
  const list = document.querySelector("[data-portfolio-list]");
  const tools = document.querySelector("[data-portfolio-tools]");
  const filterList = document.querySelector("[data-filter-list]");
  const resultCount = document.querySelector("[data-result-count]");
  const pagination = document.querySelector("[data-pagination]");
  if (!rawItems.length || !list || !tools || !filterList || !pagination) return;

  const cleanLink = (value = "") => {
    const text = String(value).trim().replaceAll("\\&", "&").replaceAll("\\_", "_");
    const markdown = text.match(/^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/);
    return markdown ? markdown[1] : text;
  };

  const slugify = (value = "") => String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  const normalizeDate = (value) => {
    const text = String(value || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    const parsed = new Date(text);
    return Number.isNaN(parsed.valueOf()) ? "1970-01-01" : parsed.toISOString().slice(0, 10);
  };

  const inferPublisher = (url) => {
    if (/workinman\.com/i.test(url)) return "Workinman Interactive";
    if (/linkedin\.com/i.test(url)) return "LinkedIn";
    if (/medium\.com/i.test(url)) return "Medium";
    if (/\.pdf(?:$|[?#])/i.test(url)) return "PaulWrites research";
    return "Published work";
  };

  const usedIds = new Set();
  const items = rawItems.map((item, index) => {
    const url = cleanLink(item.url || item.link);
    const baseId = item.id || slugify(item.title) || `work-${index + 1}`;
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) { id = `${baseId}-${suffix}`; suffix += 1; }
    usedIds.add(id);
    const publisher = item.publisher || inferPublisher(url);
    return {
      ...item,
      id,
      title: String(item.title || "Untitled work"),
      date: normalizeDate(item.date),
      type: item.type || "Article",
      publisher,
      summary: item.summary || item.description || "",
      projectContext: item.projectContext || "This piece shows how Paul turns source material and a defined editorial goal into a clear finished work.",
      readingMinutes: Math.max(1, Number.parseInt(item.readingMinutes, 10) || 4),
      image: cleanLink(item.image),
      imageAlt: String(item.imageAlt || ""),
      tags: Array.isArray(item.tags) ? item.tags : [],
      url,
      linkLabel: item.linkLabel || (/\.pdf(?:$|[?#])/i.test(url) ? "Read the research paper" : `Read on ${publisher}`)
    };
  }).filter((item) => item.url);

  const PAGE_SIZE = 8;
  const preferredTags = [
    "Environmental Science",
    "Research",
    "Scientific Communication",
    "Client Work",
    "Technology",
    "Interactive Media",
    "B2B",
    "SEO & Content",
    "Sustainability",
    "Rochester",
    "Freelancing",
    "Education & Community",
    "Article"
  ];

  const collator = new Intl.Collator("en", { sensitivity: "base" });
  items.sort((a, b) => b.date.localeCompare(a.date) || collator.compare(a.title, b.title));

  const availableTags = new Set(items.flatMap((item) => item.tags || []));
  const tags = preferredTags.filter((tag) => availableTags.has(tag));
  [...availableTags].sort(collator.compare).forEach((tag) => {
    if (!tags.includes(tag)) tags.push(tag);
  });

  const query = new URLSearchParams(window.location.search);
  let activeTag = tags.includes(query.get("tag")) ? query.get("tag") : "All";
  let currentPage = Math.max(1, Number.parseInt(query.get("page"), 10) || 1);

  const hashId = decodeURIComponent(window.location.hash.slice(1));
  if (hashId) {
    const hashIndex = items.findIndex((item) => item.id === hashId);
    if (hashIndex >= 0) currentPage = Math.floor(hashIndex / PAGE_SIZE) + 1;
  }

  const formatDate = (item) => {
    if (item.datePrecision === "year") return item.date.slice(0, 4);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(`${item.date}T12:00:00Z`));
  };

  const updateAddress = () => {
    if (!/^https?:$/.test(window.location.protocol)) return;
    const params = new URLSearchParams();
    if (activeTag !== "All") params.set("tag", activeTag);
    if (currentPage > 1) params.set("page", String(currentPage));
    const next = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
    try { window.history.replaceState(null, "", next); } catch (_) { /* file-safe */ }
  };

  const makeItem = (item, priorityImage = false) => {
    const localUrl = `work/${item.id}/index.html`;
    const article = document.createElement("article");
    article.className = "portfolio-item";
    article.id = item.id;

    const dateBox = document.createElement("div");
    dateBox.className = "portfolio-date";
    const time = document.createElement("time");
    time.dateTime = item.date;
    time.textContent = formatDate(item);
    dateBox.append(time);

    const visual = document.createElement("a");
    visual.className = "portfolio-image-link";
    visual.href = localUrl;
    visual.setAttribute("aria-label", `Read ${item.title}`);
    const image = document.createElement("img");
    image.className = "portfolio-image";
    image.src = item.image;
    image.alt = item.imageAlt;
    image.width = 1200;
    image.height = 750;
    image.loading = priorityImage ? "eager" : "lazy";
    if (priorityImage) image.fetchPriority = "high";
    image.decoding = "async";
    visual.append(image);

    const copy = document.createElement("div");
    copy.className = "portfolio-copy";

    const meta = document.createElement("p");
    meta.className = "item-meta";
    meta.textContent = `${item.type} · ${item.publisher} · Est. ${item.readingMinutes} min read`;

    const heading = document.createElement("h2");
    const titleLink = document.createElement("a");
    titleLink.href = localUrl;
    titleLink.textContent = item.title;
    heading.append(titleLink);

    const summary = document.createElement("p");
    summary.textContent = item.summary;

    const tagList = document.createElement("ul");
    tagList.className = "tag-list";
    tagList.setAttribute("aria-label", "Topics");
    (item.tags || []).forEach((tag) => {
      const li = document.createElement("li");
      li.textContent = tag;
      tagList.append(li);
    });

    const workLink = document.createElement("a");
    workLink.className = "work-link";
    workLink.href = localUrl;
    workLink.setAttribute("aria-label", `Read ${item.title} on PaulWrites.net`);
    workLink.append(document.createTextNode("Read "));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    workLink.append(arrow);

    const notesToggle = document.createElement("button");
    notesToggle.type = "button";
    notesToggle.className = "notes-toggle";
    notesToggle.textContent = "Project details";
    notesToggle.setAttribute("aria-expanded", "false");
    const panelId = `${item.id}-notes`;
    notesToggle.setAttribute("aria-controls", panelId);
    const notesCopy = document.createElement("div");
    notesCopy.className = "project-notes-copy";
    notesCopy.id = panelId;
    notesCopy.hidden = true;
    const notesText = document.createElement("p");
    notesText.textContent = item.projectContext;
    notesCopy.append(notesText);
    notesToggle.addEventListener("click", () => {
      const willOpen = notesCopy.hidden;
      notesCopy.hidden = !willOpen;
      notesToggle.setAttribute("aria-expanded", String(willOpen));
      notesToggle.textContent = willOpen ? "Hide project details" : "Project details";
    });

    const originalLink = document.createElement("a");
    originalLink.className = "original-link";
    originalLink.href = item.url;
    originalLink.textContent = /\.pdf(?:$|[?#])/i.test(item.url) ? "View source PDF ↗" : "View original ↗";
    originalLink.setAttribute("aria-label", `${originalLink.textContent.replace(" ↗", "")}: ${item.title}`);
    if (/^https?:/.test(item.url)) {
      originalLink.target = "_blank";
      originalLink.rel = "noopener noreferrer";
    }

    const actions = document.createElement("div");
    actions.className = "work-actions";
    actions.append(workLink, notesToggle, originalLink);

    copy.append(meta, heading, summary, tagList, actions, notesCopy);
    article.append(dateBox, visual, copy);
    return article;
  };

  const renderFilters = () => {
    filterList.replaceChildren();

    const select = document.createElement("select");
    select.className = "filter-select";
    select.setAttribute("aria-labelledby", "filter-label");
    ["All", ...tags].forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      option.selected = tag === activeTag;
      select.append(option);
    });
    select.addEventListener("change", () => {
      activeTag = select.value;
      currentPage = 1;
      render();
    });
    filterList.append(select);

    ["All", ...tags].forEach((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-button";
      button.textContent = tag;
      button.setAttribute("aria-pressed", String(tag === activeTag));
      button.addEventListener("click", () => {
        activeTag = tag;
        currentPage = 1;
        render();
      });
      filterList.append(button);
    });
  };

  const renderPagination = (pageCount) => {
    pagination.replaceChildren();
    pagination.hidden = pageCount <= 1;
    if (pageCount <= 1) return;

    const previous = document.createElement("button");
    previous.type = "button";
    previous.textContent = "Previous";
    previous.disabled = currentPage === 1;
    previous.addEventListener("click", () => changePage(currentPage - 1));
    pagination.append(previous);

    for (let page = 1; page <= pageCount; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(page);
      button.setAttribute("aria-label", `Portfolio page ${page}`);
      if (page === currentPage) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => changePage(page));
      pagination.append(button);
    }

    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Next";
    next.disabled = currentPage === pageCount;
    next.addEventListener("click", () => changePage(currentPage + 1));
    pagination.append(next);
  };

  const changePage = (page) => {
    currentPage = page;
    render();
    const heading = document.querySelector(".portfolio-section");
    if (heading) heading.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const render = () => {
    const filtered = activeTag === "All"
      ? items
      : items.filter((item) => (item.tags || []).includes(activeTag));
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(currentPage, 1), pageCount);
    const start = (currentPage - 1) * PAGE_SIZE;
    const visible = filtered.slice(start, start + PAGE_SIZE);

    const fragment = document.createDocumentFragment();
    let lastYear = "";
    visible.forEach((item, index) => {
      const year = item.date.slice(0, 4);
      if (year !== lastYear) {
        const yearHeading = document.createElement("h2");
        yearHeading.className = "year-heading";
        yearHeading.textContent = year;
        fragment.append(yearHeading);
        lastYear = year;
      }
      fragment.append(makeItem(item, index === 0));
    });
    list.replaceChildren(fragment);

    const from = filtered.length ? start + 1 : 0;
    const to = Math.min(start + PAGE_SIZE, filtered.length);
    resultCount.textContent = activeTag === "All"
      ? `Showing ${from}–${to} of ${filtered.length} items`
      : `Showing ${from}–${to} of ${filtered.length} tagged “${activeTag}”`;

    renderFilters();
    renderPagination(pageCount);
    updateAddress();
  };

  tools.hidden = false;
  render();

  if (hashId) {
    window.requestAnimationFrame(() => {
      const target = document.getElementById(hashId);
      if (target) {
        target.scrollIntoView({ block: "center" });
        target.classList.add("linked-item");
      }
    });
  }
})();
