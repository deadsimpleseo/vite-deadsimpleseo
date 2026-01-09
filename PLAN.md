# Implementation Plan: vite-deadsimpleseo

## Overview
A Vite plugin to generate static SEO pages from React components using ReactDOMServer.renderToString, without requiring complex SSR frameworks.

## Core Requirements

### 1. Component Discovery
- Scan a specific folder (e.g., `src/seo-pages/`) for React components
- Components must start with `"use static";` directive (any string format)
- Components with 'use static' cannot use stateful hooks (useState, useEffect, etc.)
- useContext is allowed if context providers exist in parent component hierarchy
- This restriction is more conservative than ReactDOMServer for predictability
- Extract component metadata (name, route, SEO data)

### 2. Static Page Generation
- Convert CamelCase component names to snake-case folder structure
  - Example: `AboutUs.tsx` → `/about-us/index.html` (with exceptions)
- Generate static HTML using ReactDOMServer.renderToString
- Reuse existing index.html template, stylesheets, and main.tsx
- Inject rendered content and SEO metadata into HTML

### 3. Developer Hooks & Utilities

#### useSEOPage()
- Returns: `{ pageTitle: string, pageContent: string }`
- Access current SEO page metadata within components
- Only works within SEO page components

#### useSEOPages()
- Returns: Array of SEO page objects with URLs
- Example: `[{ name: 'About Us', url: '/about-us/' }, ...]`
- Useful for generating sitemaps or navigation

#### isSEOPage()
- Returns: `boolean`
- Can be used outside React context (e.g., in main.tsx)
- Detect if current route is a static SEO page

### 4. Optional Features
- Markdown support using `marked` library
- Allow frontmatter for SEO metadata in markdown files
- Convert markdown to React components

## Technical Architecture

### Plugin Structure
```
vite-deadsimpleseo/
├── src/
│   ├── index.ts              # Main plugin entry
│   ├── scanner.ts            # Component discovery
│   ├── validator.ts          # Validate "use static" components
│   ├── generator.ts          # Static HTML generation
│   ├── hooks.ts              # React hooks (useSEOPage, useSEOPages)
│   ├── utils.ts              # isSEOPage and helpers
│   └── markdown.ts           # Optional markdown support
├── package.json
├── tsconfig.json
└── README.md
```

### Build Process Flow

1. **Pre-build Phase (Vite configResolved hook)**
   - Scan SEO pages directory
   - Parse components for "use static" directive
   - Validate component safety (no stateful hooks)
   - Build route manifest

2. **Build Phase (Vite generateBundle hook)**
   - For each SEO page:
     - Create temporary entry point
     - Render component to string with ReactDOMServer
     - Inject into index.html template
     - Preserve CSS/JS bundle references
     - Write to dist/{route}/index.html

3. **Dev Server Phase (Vite configureServer hook)**
   - Serve static pages during development
   - Hot reload SEO pages on file changes
   - Provide route manifest to client

## Implementation Phases

### Phase 1: Core Plugin Setup
- [ ] Initialize TypeScript plugin package
- [ ] Define plugin configuration interface
- [ ] Implement Vite plugin hooks (configResolved, buildStart, generateBundle)
- [ ] Create basic file scanner for SEO pages directory

### Phase 2: Component Discovery & Validation
- [ ] Implement "use static" directive parser
- [ ] Build AST-based validator to check for stateful hooks
- [ ] Create error reporting for invalid components
- [ ] Generate route manifest from component names

### Phase 3: Static HTML Generation
- [ ] Implement CamelCase → snake-case conversion (with optional exceptions, such as 'youtube' or 'linkedin' should not be hyphenated)
- [ ] Set up ReactDOMServer.renderToString rendering
- [ ] Template injection system for index.html (handlebars-like with `{{root}}` directive)
- [ ] Preserve Vite asset references (CSS, JS bundles) (execute other plugins first)
- [ ] Handle nested routes and folder structure (configure `page/index.html` or `page.html` output)

### Phase 4: Developer Hooks
- [ ] Implement useSEOPage() hook
- [ ] Implement useSEOPages() hook
- [ ] Implement isSEOPage() utility
- [ ] Create route context provider
- [ ] Export types for TypeScript users

### Phase 5: Dev Server Integration
- [ ] Configure middleware for serving static pages in dev mode
- [ ] Implement HMR for SEO page updates
- [ ] Add route debugging tools
- [ ] Virtual module for route manifest

### Phase 6: Markdown Support (Optional)
- [ ] Integrate marked library
- [ ] Parse markdown frontmatter for SEO metadata
- [ ] Convert markdown to React components
- [ ] Support .md/.mdx files in SEO pages directory

### Phase 7: Testing & Documentation
- [ ] Unit tests for scanner and validator
- [ ] Integration tests for build process
- [ ] E2E tests with sample Vite app
- [ ] Write comprehensive README
- [ ] Create example project
- [ ] API documentation

## Configuration Schema

```typescript
interface DeadSimpleSEOConfig {
  // Directory containing SEO page components
  pagesDir?: string; // default: 'src/seo-pages'
  
  // Output directory for static pages
  outDir?: string; // default: 'dist'
  
  // Enable markdown support
  markdown?: boolean; // default: false
  
  // Custom route transformation
  routeTransform?: (name: string) => string;
  
  // SEO metadata defaults
  defaults?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
}
```

## Example Usage

### Plugin Configuration (vite.config.ts)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import deadSimpleSEO from 'vite-deadsimpleseo';

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

### SEO Page Component (src/seo-pages/AboutUs.tsx)
```typescript
"use static";

import { useSEOPage } from 'vite-deadsimpleseo/hooks';

export default function AboutUs() {
  const { pageTitle, pageContent } = useSEOPage();
  
  return (
    <div>
      <h1>{pageTitle || 'About Us'}</h1>
      <p>Welcome to our company...</p>
    </div>
  );
}

export const seoMeta = {
  title: 'About Us - Company Name',
  description: 'Learn more about our company',
};
```

### Using in Main App (src/main.tsx)
```typescript
import { isSEOPage } from 'vite-deadsimpleseo/utils';

if (!isSEOPage()) {
  // Initialize React app normally
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
  );
}
```

## Technical Challenges & Solutions

### Challenge 1: Asset References
**Problem**: Vite generates hashed asset filenames; static pages need correct references.
**Solution**: Parse Vite's manifest.json and inject correct asset URLs into rendered HTML.

### Challenge 2: React Hydration
**Problem**: Pre-rendered static pages might cause hydration mismatches.
**Solution**: Mark SEO pages as non-hydrating; they're static and don't need client-side React.

### Challenge 3: Development Hot Reload
**Problem**: Changes to SEO pages need to reflect immediately.
**Solution**: Custom middleware that watches SEO pages directory and invalidates module cache.

### Challenge 4: Route Matching
**Problem**: Determine if current URL is an SEO page.
**Solution**: Generate route manifest at build time, expose via virtual module.

## Success Metrics
- ✅ Generate static HTML for SEO pages
- ✅ Zero hydration overhead for static pages
- ✅ Works with existing Vite/React setup
- ✅ Fast dev server with HMR
- ✅ Type-safe hooks and utilities
- ✅ Under 50KB plugin size
- ✅ Compatible with Vite 4+

## Future Enhancements
- Sitemap.xml generation
- RSS feed generation
- Automatic social media meta tags
- Image optimization for OG images
- Multi-language support
- Incremental static regeneration (ISR)
