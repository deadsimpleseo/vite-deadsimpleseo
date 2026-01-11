# vite-deadsimpleseo

A Vite plugin to generate static SEO pages from React components using ReactDOMServer.renderToString, without requiring complex SSR frameworks.

## Features

- ✅ Generate static HTML pages from React components
- ✅ Simple "use static" directive to mark SEO pages
- ✅ Automatic validation - prevents stateful React hooks
- ✅ CamelCase to snake-case route conversion
- ✅ Developer hooks for SEO metadata
- ✅ Works with existing Vite + React setup
- 🚧 Optional markdown support (coming soon)

## Installation

```bash
npm install vite-deadsimpleseo
# or
yarn add vite-deadsimpleseo
# or
pnpm add vite-deadsimpleseo
```

## Usage

### 1. Configure the plugin

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import deadSimpleSEO from 'vite-deadsimpleseo';

export default defineConfig({
  plugins: [
    react(),
    deadSimpleSEO({
      pagesDir: 'src/seo-pages', // default
      markdown: false,           // default
    }),
  ],
});
```

### 2. Create SEO page components

Create components in `src/seo-pages/` directory:

```typescript
// src/seo-pages/AboutUs.tsx
"use static";

export default function AboutUs() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Welcome to our company. We've been serving customers since 2020.</p>
    </div>
  );
}

export const seoMeta = {
  title: 'About Us - Company Name',
  description: 'Learn more about our company and mission',
};
```

This will generate a static page at `/about-us/index.html`.

### 3. Use the hooks (optional)

```typescript
// Access SEO page metadata
import { useSEOPage, useSEOPages } from 'vite-deadsimpleseo/hooks';

function MyComponent() {
  const { pageTitle, pageContent } = useSEOPage();
  const allPages = useSEOPages(); // List of all SEO pages
  
  return <div>{pageTitle}</div>;
}
```

```typescript
// Check if current route is an SEO page
import { isSEOPage } from 'vite-deadsimpleseo/utils';

// Can be used outside React context
if (!isSEOPage()) {
  // Initialize React app normally
  ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
}
```

## Configuration Options

```typescript
interface DeadSimpleSEOConfig {
  /**
   * Directory containing SEO page components
   * @default 'src/seo-pages'
   */
  pagesDir?: string;

  /**
   * Output directory for static pages
   * @default 'dist'
   */
  outDir?: string;

  /**
   * Enable markdown support
   * @default false
   */
  markdown?: boolean;

  /**
   * Custom route transformation function
   */
  routeTransform?: (name: string) => string;

  /**
   * SEO metadata defaults
   */
  defaults?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
}
```

## How It Works

1. **Discovery**: Scans `pagesDir` for React components
2. **Validation**: Checks for "use static" directive and validates no stateful hooks
3. **Route Generation**: Converts CamelCase names to snake-case routes
   - `AboutUs.tsx` → `/about-us/index.html`
   - `ContactPage.tsx` → `/contact-page/index.html`
4. **Static Generation**: Renders components to static HTML during build
5. **SEO Optimization**: Each page gets its own HTML file for better SEO

## Rules for SEO Pages

1. Page components may include `"use static";` directive at the top.

When present, the following React hook restrictions apply:
   - ✅ useContext - works if provider is in parent component hierarchy
   - ❌ useState, useEffect, useReducer, etc. - not allowed
   - **Note**: While ReactDOMServer supports these hooks, 'use static' components are intentionally more restrictive to keep SEO pages simple and predictable

2. Layout-based hooks (such as useLayoutEffect and useEffect) are not supported.

2. SEO page components must be default exports

3. Component names should be PascalCase

4. Files starting with `_` or named `index` are ignored

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode for development
npm run dev
```

## License

MIT

## Roadmap

- [ ] Full ReactDOMServer.renderToString integration
- [ ] Markdown support with frontmatter
- [ ] Sitemap.xml generation
- [ ] Social media meta tags
- [ ] Image optimization
- [ ] Multi-language support
