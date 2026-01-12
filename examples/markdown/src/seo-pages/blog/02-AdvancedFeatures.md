---
title: "Advanced Features"
description: "Explore advanced features of DeadSimpleSEO"
keywords: ["advanced", "features", "markdown", "routing"]
---

# Advanced Features

DeadSimpleSEO offers several advanced features for power users.

## Custom Route Transformation

You can customize how component names are converted to routes:

```typescript
deadSimpleSEO({
  routeTransform: (name) => {
    return name.toLowerCase().replace(/page$/i, '');
  }
})
```

## Preserved Words in URLs

Some words should stay together in URLs (like "JavaScript" or "TypeScript"):

```typescript
deadSimpleSEO({
  preserveInLinks: ['JavaScript', 'TypeScript', 'GraphQL']
})
```

This ensures "JavaScriptGuide" becomes `/javascript-guide/` instead of `/java-script-guide/`.

## Nested Pages

Organize your content in folders! Pages in subdirectories automatically get nested routes:

```
src/seo-pages/
  blog/
    01-getting-started.md  → /blog/getting-started/
    02-advanced.md         → /blog/advanced/
```

Files starting with numbers are sorted numerically for easy ordering.
