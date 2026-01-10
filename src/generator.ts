import path from 'path';
import fs from 'fs';
import type { SEOPageInfo, SEOPageMeta } from './types.js';
import { parseMarkdown } from './markdown.js';

/**
 * Generate static HTML for an SEO page
 */
export async function generateStaticPage(
  pageInfo: SEOPageInfo,
  outDir: string,
  indexHtmlTemplate: string
): Promise<void> {
  // Create output directory for this route
  const routePath = path.join(outDir, pageInfo.route);
  fs.mkdirSync(routePath, { recursive: true });

  const outputPath = path.join(routePath, 'index.html');
  let html = indexHtmlTemplate;
  
  // Handle markdown files
  if (pageInfo.isMarkdown) {
    const markdownContent = fs.readFileSync(pageInfo.componentPath, 'utf-8');
    const parsed = parseMarkdown(markdownContent);
    
    // Update pageInfo with frontmatter metadata
    if (!pageInfo.meta) {
      pageInfo.meta = parsed.frontmatter;
    }
    
    // Inject title and rendered markdown content
    html = html.replace(
      '</head>',
      `<title>${parsed.frontmatter.title || pageInfo.name}</title>
    ${parsed.frontmatter.description ? `<meta name="description" content="${parsed.frontmatter.description}">` : ''}
    ${parsed.frontmatter.ogImage ? `<meta property="og:image" content="${parsed.frontmatter.ogImage}">` : ''}
    </head>`
    );
    
    // Inject markdown HTML into body
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">
      <div class="markdown-content" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
        ${parsed.html}
      </div>
    </div>`
    );
  } else {
    // React component - placeholder for now
    html = html.replace(
      '</head>',
      `<title>${pageInfo.meta?.title || pageInfo.name}</title></head>`
    );
  }

  fs.writeFileSync(outputPath, html, 'utf-8');
}

/**
 * Extract SEO metadata from component file
 */
export function extractSEOMeta(content: string): SEOPageMeta | undefined {
  // Look for exported seoMeta object
  const metaRegex = /export\s+const\s+seoMeta\s*=\s*({[\s\S]*?});/;
  const match = content.match(metaRegex);
  
  if (!match) {
    return undefined;
  }

  try {
    // Simple extraction - in production, would use proper AST parsing
    const metaStr = match[1];
    // This is a simplified version - proper implementation would use babel to parse
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Render React component to static HTML string
 * This is a placeholder - will be implemented with ReactDOMServer
 */
export async function renderComponentToString(
  componentPath: string,
  pageInfo: SEOPageInfo
): Promise<string> {
  // TODO: Implement actual ReactDOMServer.renderToString
  // This will require:
  // 1. Dynamic import of the component
  // 2. Creating a proper React element
  // 3. Using ReactDOMServer.renderToString
  // 4. Handling the SEO context provider
  
  return `<div id="root">
    <h1>${pageInfo.name}</h1>
    <p>Static SEO page placeholder</p>
  </div>`;
}
