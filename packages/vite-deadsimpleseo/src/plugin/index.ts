import type { Plugin, ResolvedConfig } from 'vite';
import path from 'path';
import type { DeadSimpleSEOConfig } from './config.js';
import type { SEOPageInfo } from '../shared/types.js';
import { scanSEOPages, readFileContent } from './scanner.js';
import { validateSEOPage } from './validator.js';
import { generateStaticPageHtml, renderSEOPageContentToStringInVm } from './generator.js';

const PLUGIN_NAME = 'vite-deadsimpleseo';

/**
 * Virtual module IDs for injecting SEO page data at runtime
 */
const VIRTUAL_MODULE_ID = 'virtual:seo-pages';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

export function deadSimpleSEO(options: DeadSimpleSEOConfig = {}): Plugin {
  const config: Required<Omit<DeadSimpleSEOConfig, 'defaults' | 'routeTransform'>> & Pick<DeadSimpleSEOConfig, 'defaults' | 'routeTransform'> = {
    pagesDir: options.pagesDir || 'src/seo-pages',
    outDir: options.outDir || 'dist',
    markdown: options.markdown || false,
    defaults: options.defaults,
    routeTransform: options.routeTransform,
  };

  let viteConfig: ResolvedConfig;
  let seoPages: SEOPageInfo[] = [];
  let mainEntryFile: string | null = null;

  return {
    name: PLUGIN_NAME,

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    async buildStart() {
      // Scan for SEO pages
      console.log(`[${PLUGIN_NAME}] Scanning for SEO pages in ${config.pagesDir}...`);
      seoPages = await scanSEOPages(config.pagesDir, config.markdown);

      if (seoPages.length === 0) {
        console.warn(`[${PLUGIN_NAME}] No SEO pages found in ${config.pagesDir}`);
        return;
      }

      // Validate each page (skip validation for markdown files)
      const errors: Array<{ page: string; errors: string[] }> = [];
      
      for (const page of seoPages) {
        // Skip validation for markdown files
        if (page.isMarkdown) {
          continue;
        }
        
        const content = readFileContent(page.componentPath);
        const validation = validateSEOPage(content, page.componentPath);
        
        if (!validation.valid) {
          errors.push({
            page: page.name,
            errors: validation.errors,
          });
        }
      }

      // Report validation errors
      if (errors.length > 0) {
        console.error(`\n[${PLUGIN_NAME}] Validation errors found:\n`);
        for (const error of errors) {
          console.error(`  ${error.page}:`);
          for (const msg of error.errors) {
            console.error(`    - ${msg}`);
          }
        }
        throw new Error(`[${PLUGIN_NAME}] SEO page validation failed`);
      }

      console.log(`[${PLUGIN_NAME}] Found ${seoPages.length} valid SEO page(s):`);
      for (const page of seoPages) {
        console.log(`  - ${page.name} -> ${page.route}/`);
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        // Generate virtual module with SEO page routes and metadata
        const routes = seoPages.map(p => p.route);
        const pagesList = seoPages.map(p => ({
          name: p.name,
          url: p.route + '/',
          meta: p.meta,
        }));

        return `
export const seoPageRoutes = ${JSON.stringify(routes)};
export const seoPagesList = ${JSON.stringify(pagesList)};
`;
      }
    },

    generateBundle(options, bundle) {
      // Find the main entry chunk to get its filename
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) {
          mainEntryFile = fileName;
          break;
        }
      }
    },

    async writeBundle(options, bundle) {
      // Only generate static pages in build mode
      if (viteConfig.command !== 'build' || seoPages.length === 0) {
        return;
      }

      console.log(`\n[${PLUGIN_NAME}] Generating static SEO pages in bundle...`);

      // Find the index.html in the bundle
      const indexHtmlAsset = Object.entries(bundle).find(
        ([fileName, asset]) => asset.type === 'asset' && fileName === 'index.html'
      );

      if (!indexHtmlAsset) {
        console.warn(`[${PLUGIN_NAME}] index.html not found in bundle, skipping static page generation`);
        return;
      }

      const [, indexAsset] = indexHtmlAsset;
      if (indexAsset.type !== 'asset') {
        console.warn(`[${PLUGIN_NAME}] index.html is not an asset, skipping static page generation`);
        return;
      }

      const indexHtmlContent = typeof indexAsset.source === 'string'
        ? indexAsset.source
        : new TextDecoder().decode(indexAsset.source);

      const appComponentPath = path.resolve(viteConfig.root, 'src', 'App.tsx');

      // Generate static pages and write them to disk
      for (const page of seoPages) {

        const componentPath = path.resolve(viteConfig.root, page.componentPath);
        console.log(`  - Generating page: ${page.name}
              original component path: ${page.componentPath}
              resolved component path: ${componentPath}
        `);

        const pageInfo = {
          ...page,
          componentPath,
        };

        if (pageInfo.isMarkdown || pageInfo.componentPath?.trim() === '' || pageInfo.componentPath.endsWith('.md')) {
          console.log(`    (Skipping React rendering for markdown page or invalid component path)`);
          continue;
        }

        // const staticHtml = await generateStaticPageHtml(viteConfig, page, indexHtmlContent, mainEntryFile);
        const staticHtml = await renderSEOPageContentToStringInVm(
          appComponentPath,
          pageInfo,
        );
        const routePath = path.join(config.outDir, page.route);
        
        // Create directory and write file
        const fs = await import('fs');
        await fs.promises.mkdir(routePath, { recursive: true });
        await fs.promises.writeFile(
          path.join(routePath, 'index.html'),
          staticHtml,
          'utf-8'
        );
        
        console.log(`  ✓ Generated ${page.route}/index.html`);
      }

      console.log(`[${PLUGIN_NAME}] Successfully generated ${seoPages.length} static page(s)\n`);
    },

    configureServer(server) {
      // Add middleware for dev server to serve SEO pages
      return () => {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          
          // Check if this is an SEO page route
          const matchedPage = seoPages.find(page => {
            const routeWithSlash = page.route.endsWith('/') ? page.route : page.route + '/';
            const urlPath = url.split('?')[0];
            return urlPath === routeWithSlash || urlPath === page.route;
          });

          if (matchedPage) {
            // In dev mode, let Vite handle the SPA routing
            // The actual component will be loaded by React
            console.log(`[${PLUGIN_NAME}] Serving SEO page: ${matchedPage.route}`);
          }

          next();
        });
      };
    },
  };
}

// Export types
// export type { DeadSimpleSEOConfig, SEOPageMeta, SEOPageInfo, SEOPageContext, SEOPageListItem } from './types';

export type { DeadSimpleSEOConfig } from './config';

export default deadSimpleSEO;