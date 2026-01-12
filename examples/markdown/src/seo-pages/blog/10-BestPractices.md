---
title: "Best Practices"
description: "Best practices for using DeadSimpleSEO effectively"
keywords: ["best practices", "tips", "seo", "performance"]
---

# Best Practices

Follow these best practices to get the most out of DeadSimpleSEO.

## SEO Meta Tags

Always include comprehensive meta tags:

```tsx
<SEOPage
  title="Page Title | Site Name"
  description="A clear, concise description (150-160 chars)"
  keywords="keyword1, keyword2, keyword3"
  ogImage="/images/og-image.jpg"
>
```

## Content Organization

- Use folders for related content (like blog posts)
- Prefix files with numbers for ordering (01-, 02-, etc.)
- Use descriptive component names (they become URLs)
- Skip underscore-prefixed files for drafts

## Performance Tips

1. **Keep pages static** - No JavaScript means faster loads
2. **Optimize images** - Use appropriate sizes and formats
3. **Minimize CSS** - CSS is inlined automatically
4. **Use markdown** - Faster to write and maintain

## URL Structure

Good URL structure helps SEO:

- ✅ `/blog/getting-started/` - Clear and descriptive
- ✅ `/javascript-guide/` - Preserved technical terms
- ❌ `/page1/` - Not descriptive
- ❌ `/java-script-guide/` - Incorrectly hyphenated
