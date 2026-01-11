import { marked } from 'marked';

/**
 * Frontmatter metadata from markdown files
 */
export interface MarkdownFrontmatter {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string[];
  [key: string]: any;
}

/**
 * Parsed markdown file
 */
export interface ParsedMarkdown {
  frontmatter: MarkdownFrontmatter;
  content: string;
  html: string;
}

/**
 * Parse frontmatter from markdown content
 * Expects YAML-style frontmatter between --- delimiters
 */
export function parseFrontmatter(content: string): { frontmatter: MarkdownFrontmatter; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: {},
      body: content,
    };
  }

  const [, frontmatterText, body] = match;
  const frontmatter: MarkdownFrontmatter = {};

  // Simple YAML parser for common cases
  const lines = frontmatterText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    let value: any = trimmed.substring(colonIndex + 1).trim();

    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }

    // Handle arrays (simple format: [item1, item2])
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .substring(1, value.length - 1)
        .split(',')
        .map((item: string) => item.trim().replace(/['"]/g, ''));
    }

    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

/**
 * Convert markdown to HTML using marked
 */
export function markdownToHtml(markdown: string): string {
  return marked(markdown) as string;
}

/**
 * Parse markdown file with frontmatter
 */
export function parseMarkdown(content: string): ParsedMarkdown {
  const { frontmatter, body } = parseFrontmatter(content);
  const html = markdownToHtml(body);

  return {
    frontmatter,
    content: body,
    html,
  };
}
