import JSZip from "jszip";

export type ImportedSlide = { title: string; body: string };
export type ImportedDeck = { title: string; summary: string | null; slides: ImportedSlide[] };

function decode(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
}

/** The text of each paragraph (<a:p>) in a piece of slide XML. */
function paragraphs(xml: string) {
  return (xml.match(/<a:p>[\s\S]*?<\/a:p>|<a:p [\s\S]*?<\/a:p>/g) ?? [])
    .map((p) => decode((p.match(/<a:t>([\s\S]*?)<\/a:t>/g) ?? []).map((t) => t.replace(/<\/?a:t>/g, "")).join("")).trim())
    .filter(Boolean);
}

/** Turns a target like "../slides/slide3.xml" relative to a folder into a zip path. */
function resolve(folder: string, target: string) {
  const parts = `${folder}/${target}`.split("/");
  const out: string[] = [];
  for (const part of parts) {
    if (part === "..") out.pop();
    else if (part && part !== ".") out.push(part);
  }
  return out.join("/");
}

function relationships(xml: string) {
  const map = new Map<string, { target: string; type: string }>();
  for (const rel of xml.match(/<Relationship [^>]*>/g) ?? []) {
    const id = rel.match(/Id="([^"]+)"/)?.[1];
    const target = rel.match(/Target="([^"]+)"/)?.[1];
    const type = rel.match(/Type="([^"]+)"/)?.[1] ?? "";
    if (id && target) map.set(id, { target, type });
  }
  return map;
}

/**
 * Reads a PowerPoint (.pptx) file: each slide's title, its text as bullet
 * points, and its speaker notes. Pictures and charts are not carried over.
 */
export async function readPptx(data: ArrayBuffer): Promise<ImportedDeck> {
  const zip = await JSZip.loadAsync(data);
  const read = async (path: string) => (await zip.file(path)?.async("string")) ?? null;

  const presentation = await read("ppt/presentation.xml");
  const presRels = await read("ppt/_rels/presentation.xml.rels");
  if (!presentation || !presRels) throw new Error("That doesn't look like a PowerPoint (.pptx) file.");

  const rels = relationships(presRels);
  const slidePaths = (presentation.match(/<p:sldId [^>]*>/g) ?? [])
    .map((tag) => tag.match(/r:id="([^"]+)"/)?.[1])
    .map((id) => (id ? rels.get(id)?.target : undefined))
    .filter((t): t is string => !!t)
    .map((t) => resolve("ppt", t));

  const slides: ImportedSlide[] = [];
  for (const path of slidePaths) {
    const xml = await read(path);
    if (!xml) continue;
    let title = "";
    const lines: string[] = [];
    for (const shape of xml.match(/<p:sp>[\s\S]*?<\/p:sp>/g) ?? []) {
      const isTitle = /<p:ph[^>]*type="(?:title|ctrTitle)"/.test(shape);
      const text = paragraphs(shape);
      if (isTitle && !title) title = text.join(" ");
      else lines.push(...text);
    }
    // Tables: one bullet per row, cells separated by dots.
    for (const row of xml.match(/<a:tr[ >][\s\S]*?<\/a:tr>/g) ?? []) {
      const cells = (row.match(/<a:tc[ >][\s\S]*?<\/a:tc>/g) ?? []).map((cell) => paragraphs(cell).join(" ")).filter(Boolean);
      if (cells.length) lines.push(cells.join(" · "));
    }

    // Speaker notes become plain paragraphs under the bullet points.
    const notes: string[] = [];
    const slideRels = await read(path.replace(/slides\/(slide\d+\.xml)$/, "slides/_rels/$1.rels"));
    if (slideRels) {
      for (const { target, type } of relationships(slideRels).values()) {
        if (!type.endsWith("/notesSlide")) continue;
        const notesXml = await read(resolve(path.replace(/\/[^/]+$/, ""), target));
        if (!notesXml) continue;
        for (const shape of notesXml.match(/<p:sp>[\s\S]*?<\/p:sp>/g) ?? []) {
          if (/<p:ph[^>]*type="body"/.test(shape)) notes.push(...paragraphs(shape));
        }
      }
    }

    if (!title && !lines.length && !notes.length) continue;
    slides.push({
      title: title || lines.shift() || `Slide ${slides.length + 1}`,
      body: [...lines.map((l) => `- ${l}`), ...notes].join("\n"),
    });
  }

  if (!slides.length) throw new Error("No text was found on the slides in that file.");

  // A short first slide is the cover: its title names the class and the rest is the summary.
  let title = "Imported class";
  let summary: string | null = null;
  const first = slides[0];
  if (slides.length > 1 && first.body.split("\n").filter(Boolean).length <= 2) {
    slides.shift();
    title = first.title;
    summary = first.body.replace(/^- /gm, "").replace(/\n/g, " ").trim() || null;
  } else {
    title = first.title;
  }
  return { title, summary, slides };
}
