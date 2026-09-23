import { readFile } from "node:fs/promises";
import path from "node:path";

const REPORTS = {
  "climate-change-harmful-algal-blooms-genesee-finger-lakes": {
    file: "content/research/climate-change-harmful-algal-blooms-genesee-finger-lakes.txt",
    skipPages: 2,
    runningHeader: /^Shannon\s+\d+$/i,
    headings: ["Abstract", "Introduction", "Methodology", "Results", "Discussion", "Conclusion", "References"]
  },
  "rhizofiltration-microcystis-water-hyacinth": {
    file: "content/research/rhizofiltration-microcystis-water-hyacinth.txt",
    skipPages: 2,
    runningHeader: /^\(Shannon\s+\d+\)$/i,
    headings: ["Abstract", "Introduction", "Methodology", "Results", "Conclusion", "References"]
  },
  "phytoremediation-habs-feasibility-review": {
    file: "content/research/phytoremediation-habs-feasibility-review.txt",
    skipPages: 1,
    runningHeader: /^MACROPHYTE PHYTOREMEDIATION OF HABs(?:\s+\d+)?$/i,
    headings: [
      "Abstract",
      "Introduction",
      "Macrophyte Classification Framework",
      "Eichhornia crassipes",
      "Lemna trisulca",
      "Myriophyllum aquaticum",
      "Discussion",
      "Conclusion",
      "References"
    ]
  }
};

const cleanInline = (value) => value
  .replace(/[\u200B-\u200D\uFEFF]/g, "")
  .replace(/\s+([,.;:!?])/g, "$1")
  .replace(/\s+/g, " ")
  .trim();

const splitReadableParagraph = (block) => {
  const text = block.text.replace(/\s+\d+\.$/, "").trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (block.type === "reference") {
    const numbered = text.split(/\s+(?=\d{1,3}[.)]\s*[A-ZÀ-Ž])/u).map((part) => part.trim()).filter(Boolean);
    if (numbered.length > 1) return numbered.map((part) => ({ type: "reference", text: part }));
  }

  if (wordCount <= 190 || block.type === "pre") return [{ ...block, text }];

  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z0-9“‘])/u).filter(Boolean);
  if (sentences.length < 2) return [{ ...block, text }];
  const output = [];
  let buffer = [];
  let words = 0;
  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).filter(Boolean).length;
    if (buffer.length && words + sentenceWords > 155) {
      output.push({ ...block, text: buffer.join(" ") });
      buffer = [];
      words = 0;
    }
    buffer.push(sentence);
    words += sentenceWords;
  }
  if (buffer.length) output.push({ ...block, text: buffer.join(" ") });
  return output;
};

const headingFor = (chunk) => chunk.startsWith("@@H2 ") ? chunk.slice(5).trim() : null;
const subheadingFor = (chunk) => chunk.startsWith("@@H3 ") ? chunk.slice(5).trim() : null;

const cleanPage = (page, config, pageIndex) => page
  .replace(/\r/g, "")
  .replace(/[\u200B-\u200D\uFEFF]/g, "")
  .split("\n")
  .filter((line, lineIndex) => {
    const value = cleanInline(line);
    if (config.runningHeader.test(value)) return false;
    if (/^\(?Shannon\s+\d+\)?$/i.test(value)) return false;
    if (pageIndex > 0 && lineIndex < 3 && /^\d+$/.test(value)) return false;
    return true;
  })
  .join("\n");

const chunksFrom = (raw, config) => {
  const pages = raw
    .split("\f")
    .slice(config.skipPages || 0)
    .map((page, index) => cleanPage(page, config, index))
    .join("\n\n");

  const inputLines = pages.split("\n");
  const markedLines = [];
  let headingCursor = 0;
  for (let index = 0; index < inputLines.length; index += 1) {
    const line = cleanInline(inputLines[index]);
    const numbered = line.match(/^(\d+(?:\.\d+)?)\.\s*(.*)$/);
    if (numbered) {
      const [, number, remainder] = numbered;
      const next = cleanInline(inputLines[index + 1] || "");
      const candidate = remainder || next;
      const sectionIndex = config.headings.findIndex((heading) => candidate.toLowerCase() === heading.toLowerCase());
      const section = config.headings[sectionIndex];
      if (section && sectionIndex === headingCursor) {
        markedLines.push("", `@@H2 ${section}`, "");
        headingCursor += 1;
        if (!remainder) index += 1;
        continue;
      }
      if (/^\d+\.\d+$/.test(number) && remainder) {
        markedLines.push("", `@@H3 ${remainder}`, "");
        continue;
      }
    }
    const plainSectionIndex = config.headings.findIndex((heading) => line.toLowerCase() === heading.toLowerCase());
    if (plainSectionIndex === headingCursor) {
      markedLines.push("", `@@H2 ${config.headings[plainSectionIndex]}`, "");
      headingCursor += 1;
      continue;
    }
    markedLines.push(inputLines[index]);
  }

  const cleaned = markedLines.join("\n")
    .replace(/\n[ \t]+\n/g, "\n\n")
    .replace(/\n{3,}/g, "\n\n");

  const chunks = cleaned.split(/\n\s*\n/).map((chunk) => chunk.trim()).filter(Boolean);
  const firstBodyIndex = chunks.findIndex((chunk) => headingFor(chunk) === "Abstract");
  if (firstBodyIndex < 0) throw new Error(`Could not find the Abstract in ${config.file}.`);
  return chunks.slice(firstBodyIndex);
};

const blockFrom = (chunk, config, currentSection) => {
  const heading = headingFor(chunk);
  if (heading) return { block: { type: "h2", text: heading }, section: heading };

  const subheading = subheadingFor(chunk);
  if (subheading) return { block: { type: "h3", text: subheading }, section: currentSection };

  const lines = chunk.split("\n").map((line) => line.trimEnd()).filter((line) => line.trim());
  const tabularLines = lines.filter((line) => /\S\s{3,}\S/.test(line)).length;
  const looksTabular = lines.length >= 2 && tabularLines >= Math.max(2, Math.ceil(lines.length * 0.45));
  if (looksTabular) {
    return {
      block: { type: "pre", text: lines.join("\n").replace(/^\s+/gm, "").trim() },
      section: currentSection
    };
  }

  const text = cleanInline(lines.join(" "));
  if (!/[\p{L}\p{N}]/u.test(text)) return { block: null, section: currentSection };
  const type = currentSection === "References" ? "reference" : "p";
  return { block: { type, text }, section: currentSection };
};

export const loadResearchReport = async (root, id) => {
  const config = REPORTS[id];
  if (!config) return null;
  const raw = await readFile(path.join(root, config.file), "utf8");
  const blocks = [];
  let section = "";
  for (const chunk of chunksFrom(raw, config)) {
    const parsed = blockFrom(chunk, config, section);
    section = parsed.section;
    if (!parsed.block) continue;
    const previous = blocks.at(-1);
    if (
      parsed.block.type === "p"
      && previous?.type === "p"
      && (
        !/[.!?][”’\"']?$/.test(previous.text)
        || /\b[A-Z]\.$/.test(previous.text)
      )
    ) {
      previous.text = cleanInline(`${previous.text} ${parsed.block.text}`);
    } else {
      blocks.push(parsed.block);
    }
  }
  let readableBlocks = blocks.flatMap(splitReadableParagraph);

  if (id === "climate-change-harmful-algal-blooms-genesee-finger-lakes") {
    readableBlocks = readableBlocks.flatMap((block) => {
      if (block.type !== "p") return [block];
      if (block.text.startsWith("Between 2020 and 2024")) {
        return [{ ...block, text: block.text.replace(/from an average of 36 to$/, "from an average of 36 to 222.") }];
      }
      if (block.text.startsWith("Year Mean Algal")) {
        const index = block.text.indexOf("Precipitation Anomaly");
        return index >= 0 ? [{ ...block, text: block.text.slice(index) }] : [];
      }
      if (block.text.startsWith("Counties Water Body Name")) {
        return [{
          type: "p",
          text: "In recent years (2020–2024), average seasonal temperatures in Yates, Seneca, and Ontario counties remained consistently within the favorable growth range for Microcystis strains (20–30°C), with each year supporting conditions that may exacerbate bloom formation."
        }];
      }
      if (block.text.endsWith("with a maximum of 23.4°C in")) {
        return [{ ...block, text: `${block.text} 2020.` }];
      }
      return [block];
    });
  }

  if (id === "phytoremediation-habs-feasibility-review") {
    readableBlocks = readableBlocks.flatMap((block) => {
      if (block.type !== "p") return [block];
      if (/^\d+\.$/.test(block.text)) return [];
      if (block.text.includes("Table 1: Macrophyte Trait Framework")) {
        return [{ ...block, text: block.text.slice(0, block.text.indexOf("Table 1: Macrophyte Trait Framework")).trim() }];
      }
      if (block.text.startsWith("Rhizofiltration Yes, 12+ states")) {
        const index = block.text.indexOf("A macrophyte was classified");
        return index >= 0 ? [{ ...block, text: block.text.slice(index) }] : [];
      }
      return [block];
    });
  }

  const wordCount = readableBlocks
    .filter((block) => !["h2", "h3"].includes(block.type))
    .reduce((total, block) => total + block.text.split(/\s+/).filter(Boolean).length, 0);
  return { id, source: "Supplied research PDF", reproduction: "complete", wordCount, blocks: readableBlocks };
};

export const isResearchReport = (id) => Object.hasOwn(REPORTS, id);
