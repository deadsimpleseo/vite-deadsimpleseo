# Markdown Example

This example demonstrates markdown support in vite-deadsimpleseo.

## Features Demonstrated

- ✅ Markdown file parsing (.md files)
- ✅ YAML frontmatter for SEO metadata
- ✅ Automatic meta tag injection (title, description, og:image)
- ✅ Markdown to HTML conversion using marked
- ✅ Mixed React components and markdown pages

## Quick Start

```bash
npm install
npm run build
```

Visit `dist/example-markdown/index.html` to see the generated static page.

## File Structure

```
src/seo-pages/
├── AboutUs.tsx          # React component (from simple example)
├── Contact.tsx          # React component (from simple example)
├── Features.tsx         # React component (from simple example)
└── ExampleMarkdown.md   # Markdown file with frontmatter
```

## Markdown Format

Markdown files should include YAML frontmatter for SEO metadata:

```markdown
---
title: Page Title
description: Page description for SEO
keywords: [tag1, tag2, tag3]
ogImage: /path/to/image.jpg
---

# Your Content Here

Regular markdown content...
```

## Configuration

Enable markdown support in `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import deadSimpleSEO from 'vite-deadsimpleseo';

export default defineConfig({
  plugins: [
    react(),
    deadSimpleSEO({
      pagesDir: 'src/seo-pages',
      markdown: true, // Enable markdown support
    }),
  ],
});
```

## Build Output

The markdown file generates:
- Static HTML at `/example-markdown/index.html`
- SEO meta tags from frontmatter
- Rendered markdown content
- Proper asset references (CSS/JS)
