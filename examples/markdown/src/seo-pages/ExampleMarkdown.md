---
title: Example Markdown Page - DeadSimpleSEO
description: This is an example markdown page demonstrating the markdown support feature.
keywords: [markdown, seo, static, example]
ogImage: /images/example.jpg
---

# Example Markdown Page

This is a demonstration of **markdown support** in vite-deadsimpleseo.

## Features

Markdown files support:

- **Frontmatter** metadata (YAML format)
- All standard markdown syntax
- Automatic SEO meta tag injection
- Simple, clean content authoring

## How It Works

1. Create a `.md` file in your `src/seo-pages` directory
2. Add frontmatter at the top with `---` delimiters
3. Write your content in markdown
4. Build your site - the plugin converts it to static HTML

### Code Example

```javascript
// Enable markdown support in vite.config.ts
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

## Benefits

- 📝 **Easy authoring** - Write content in markdown
- 🎯 **SEO friendly** - Frontmatter metadata becomes meta tags
- ⚡ **Fast** - Static HTML generation
- 🔧 **Flexible** - Mix markdown and React components

## Links

Visit [GitHub](https://github.com) for more information.

---

*This page was generated from a markdown file.*
