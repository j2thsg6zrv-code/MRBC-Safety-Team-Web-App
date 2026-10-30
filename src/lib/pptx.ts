import JSZip from "jszip";

/** A picture from a slide, ready to upload. */
export type SlidePicture = { data: Uint8Array; ext: "png" | "jpg" | "gif" | "webp"; type: string };
export type ImportedSlide = { title: string; body: string; picture?: SlidePicture };
export type ImportedDeck = { title: string; summary: string | null; slides: ImportedSlide[] };
/** What the browser sends to the server: the text, plus where each slide's picture was uploaded. */
export type DeckToSave = { title: string; summary: string | null; slides: { title: string; body: string; image_path?: string }[] };

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

/**
 * Drops element prefixes (<a:p> becomes <p>) so files from other apps, which
 * name their prefixes differently, read the same, and drops the fallback copy
 * of content saved twice for older PowerPoints.
 */
function simplify(xml: string) {
  return xml
    .replace(/<mc:Fallback>[\s\S]*?<\/mc:Fallback>/g, "")
    .replace(/<(\/?)[A-Za-z][\w.-]*:/g, "<$1");
}

/** Every element named `name` in simplified XML, with its contents. */
function elements(xml: string, name: string) {
  return xml.match(new RegExp(`<${name}(?:\\s[^>]*[^/])?>[\\s\\S]*?<\\/${name}>`, "g")) ?? [];
}

/** The text of each paragraph in a piece of simplified slide XML. */
function paragraphs(xml: string) {
  return elements(xml, "p")
    .map((p) => decode(elements(p, "t").map((t) => t.replace(/<[^>]*>/g, "")).join("")).trim())
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

const PICTURE_TYPES: Record<string, SlidePicture["ext"]> = { png: "png", jpg: "jpg", jpeg: "jpg", gif: "gif", webp: "webp" };

/**
 * Reads a PowerPoint (.pptx) file: each slide's title, its text as bullet
 * points, its speaker notes, and its biggest picture (photos placed on the
 * slide or its background). Charts, shapes and the theme's logos aren't
 * carried over.
 */
export async function readPptx(data: ArrayBuffer, fileName = ""): Promise<ImportedDeck> {
  const zip = await JSZip.loadAsync(data);
  const read = async (path: string) => (await zip.file(path)?.async("string")) ?? null;

  // The main part is usually ppt/presentation.xml, but the package says where.
  const rootRels = relationships((await read("_rels/.rels")) ?? "");
  const mainTarget = [...rootRels.values()].find((r) => r.type.endsWith("/officeDocument"))?.target ?? "ppt/presentation.xml";
  const mainPath = resolve("", mainTarget);
  const folder = mainPath.replace(/\/?[^/]+$/, "");
  const presentation = await read(mainPath);
  if (!presentation) throw new Error("That doesn't look like a PowerPoint (.pptx) file.");
  const rels = relationships((await read(`${folder}/_rels/${mainPath.split("/").pop()}.rels`)) ?? "");

  // Slides in the order the presentation lists them, or by file name if that list can't be read.
  let slidePaths = (simplify(presentation).match(/<sldId\s[^>]*>/g) ?? [])
    .map((tag) => tag.match(/\s\w+:id="([^"]+)"/)?.[1])
    .map((id) => (id ? rels.get(id)?.target : undefined))
    .filter((t): t is string => !!t)
    .map((t) => resolve(folder, t));
  if (!slidePaths.length) {
    slidePaths = Object.keys(zip.files)
      .filter((f) => /\/slides\/slide\d+\.xml$/.test(f))
      .sort((a, b) => Number(a.match(/(\d+)\.xml$/)![1]) - Number(b.match(/(\d+)\.xml$/)![1]));
  }
  if (!slidePaths.length) throw new Error("No slides were found in that file.");

  const slides: ImportedSlide[] = [];
  for (const path of slidePaths) {
    const raw = await read(path);
    if (!raw) continue;
    const xml = simplify(raw);
    let title = "";
    const lines: string[] = [];
    for (const shape of elements(xml, "sp")) {
      const isTitle = /<ph[^>]*type="(?:title|ctrTitle)"/.test(shape);
      const text = paragraphs(shape);
      if (isTitle && !title) title = text.join(" ");
      else lines.push(...text);
    }
    // Tables: one bullet per row, cells separated by dots.
    for (const row of elements(xml, "tr")) {
      const cells = elements(row, "tc").map((cell) => paragraphs(cell).join(" ")).filter(Boolean);
      if (cells.length) lines.push(cells.join(" · "));
    }

    // Speaker notes become plain paragraphs under the bullet points.
    const notes: string[] = [];
    let picture: SlidePicture | undefined;
    const slideRels = await read(path.replace(/slides\/(slide\d+\.xml)$/, "slides/_rels/$1.rels"));
    if (slideRels) {
      const slideRelMap = relationships(slideRels);
      // The biggest picture the slide actually shows becomes the lesson picture.
      const used = new Set([...raw.matchAll(/\s\w+:embed="([^"]+)"/g)].map((m) => m[1]));
      for (const id of used) {
        const rel = slideRelMap.get(id);
        if (!rel?.type.endsWith("/image")) continue;
        const ext = PICTURE_TYPES[rel.target.split(".").pop()?.toLowerCase() ?? ""];
        const file = ext && zip.file(resolve(path.replace(/\/[^/]+$/, ""), rel.target));
        if (!file) continue;
        const data = await file.async("uint8array");
        if (data.length > (picture?.data.length ?? 20_000)) {
          picture = { data, ext, type: ext === "jpg" ? "image/jpeg" : `image/${ext}` };
        }
      }
      for (const { target, type } of slideRelMap.values()) {
        const partXml = await read(resolve(path.replace(/\/[^/]+$/, ""), target));
        if (!partXml) continue;
        if (type.endsWith("/notesSlide")) {
          for (const shape of elements(simplify(partXml), "sp")) {
            if (/<ph[^>]*type="body"/.test(shape)) notes.push(...paragraphs(shape));
          }
        } else if (type.endsWith("/diagramData")) {
          // SmartArt keeps its text in a separate part.
          lines.push(...paragraphs(simplify(partXml)));
        }
      }
    }

    if (!title && !lines.length && !notes.length && !picture) continue;
    slides.push({
      title: title || lines.shift() || "",
      body: [...lines.map((l) => `- ${l}`), ...notes].join("\n"),
      picture,
    });
  }

  if (!slides.length) {
    throw new Error(
      `Found ${slidePaths.length} slide${slidePaths.length === 1 ? "" : "s"}, but no text or pictures on them that can be read.`,
    );
  }

  // Slides saved as pictures have no text, so the file's name names the class.
  if (slides.every((s) => !s.title && !s.body)) {
    const title = fileName.replace(/\.pptx$/i, "").replace(/_+/g, " ").trim() || "Imported class";
    return { title, summary: null, slides: slides.map((s, i) => ({ ...s, title: `Slide ${i + 1}` })) };
  }

  // A short first slide is the cover: its title names the class and the rest is the summary.
  let title = "Imported class";
  let summary: string | null = null;
  const first = slides[0];
  if (slides.length > 1 && !first.picture && first.body.split("\n").filter(Boolean).length <= 2) {
    slides.shift();
    title = first.title;
    summary = first.body.replace(/^- /gm, "").replace(/\n/g, " ").trim() || null;
  } else {
    title = first.title;
  }
  return { title, summary, slides: slides.map((s, i) => ({ ...s, title: s.title || `Slide ${i + 1}` })) };
}
