import { existsSync } from "fs";
import fs from "fs/promises";
import matter from "gray-matter";
import path from "path";

const NOW_FILE = path.join(process.cwd(), "content", "now.md");

export interface NowSection {
  heading: string;
  paragraphs: string[];
}

export interface NowPage {
  title: string;
  updated: string;
  sections: NowSection[];
  footer: string | null;
}

function parseNowSections(content: string): { sections: NowSection[]; footer: string | null } {
  const parts = content.split(/\n---\n/);
  const main = parts[0] ?? "";
  const footer = parts[1]?.trim() || null;

  const sections: NowSection[] = [];
  const blocks = main.split(/^## /m).filter(Boolean);

  for (const block of blocks) {
    const [headingLine, ...bodyLines] = block.split("\n");
    const heading = headingLine?.trim() ?? "";
    const paragraphs = bodyLines
      .join("\n")
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (heading) {
      sections.push({ heading, paragraphs });
    }
  }

  return { sections, footer };
}

export async function getNowPage(): Promise<NowPage> {
  if (!existsSync(NOW_FILE)) {
    throw new Error("Now page content not found");
  }

  const raw = await fs.readFile(NOW_FILE, "utf8");
  const { data, content } = matter(raw);

  if (!data.title || !data.updated) {
    throw new Error("Now page requires title and updated frontmatter");
  }

  const { sections, footer } = parseNowSections(content);

  return {
    title: String(data.title),
    updated: String(data.updated),
    sections,
    footer,
  };
}

export async function getNowPageUpdatedAt(): Promise<Date> {
  try {
    const page = await getNowPage();
    return new Date(page.updated);
  } catch {
    return new Date();
  }
}
