---
title: "Getting Started with DeadSimpleSEO"
description: "Learn how to get started with DeadSimpleSEO in your React projects"
keywords: ["getting started", "tutorial", "react", "seo"]
---

# Getting Started with DeadSimpleSEO

Welcome to DeadSimpleSEO! This guide will help you get up and running quickly.

## Installation

First, install the package:

```bash
npm install vite-deadsimpleseo deadsimpleseo-react
```

## Configuration

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { deadSimpleSEO } from 'vite-deadsimpleseo';

export default defineConfig({
  plugins: [
    react(),
    deadSimpleSEO({
      pagesDir: 'src/seo-pages',
      markdown: true,
    }),
  ],
});
```

## Your First Page

Create a simple SEO page component or markdown file in `src/seo-pages/`:

```tsx
import { SEOPage } from 'deadsimpleseo-react';

export default function MyPage() {
  return (
    <SEOPage
      title="My Page | My Site"
      description="This is my page description"
    >
      <h1>My Page</h1>
      <p>Content goes here!</p>
    </SEOPage>
  );
}
```

That's it! Your SEO page will be generated at build time.
