import type { Plugin, ResolvedConfig } from 'vite';
import path from 'path';
import type { DeadSimpleSEOConfig, SEOPageInfo } from './types.js';
import { scanSEOPages, readFileContent } from './scanner.js';
import { validateSEOPage } from './validator.js';
import { generateStaticPage } from './generator.js';

const PLUGIN_NAME = 'vite-deadsimpleseo';

/**
 * Virtual module IDs for injecting SEO page data at runtime
 */
const VIRTUAL_MODULE_ID = 'virtual:seo-pages';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

export default function deadSimpleSEO(options: DeadSimpleSEOConfig = {}): Plugin {
  const config: Required<Omit<DeadSimpleSEOConfig, 'defaults' | 'routeTransform'>> & Pick<DeadSimpleSEOConfig, 'defaults' | 'routeTransform'> = {
    pagesDir: options.pagesDir || 'src/seo-pages',
    outDir: options.outDir || 'dist',
    markdown: options.markdown || false,
    defaults: options.defaults,
    routeTransform: options.routeTransform,
  };

  let viteConfig: ResolvedConfig;
  let seoPages: SEOPageInfo[] = [];

  return {
    name: PLUGIN_NAME,

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    async buildStart() {
      // Scan for SEO pages
      console.log(`[${PLUGIN_NAME}] Scanning for SEO pages in ${config.pagesDir}...`);
      seoPages = await scanSEOPages(config.pagesDir);

      if (seoPages.length === 0) {
        console.warn(`[${PLUGIN_NAME}] No SEO pages found in ${config.pagesDir}`);
        return;
      }

      // Validate each page
      const errors: Array<{ page: string; errors: string[] }> = [];
      
      for (const page of seoPages) {
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

    async closeBundle() {
      // Only generate static pages in build mode
      if (viteConfig.command !== 'build' || seoPages.length === 0) {
        return;
      }

      console.log(`\n[${PLUGIN_NAME}] Generating static SEO pages...`);

      // Read the generated index.html from the output directory
      const indexHtmlPath = path.join(config.outDir, 'index.html');
      
      let indexHtmlContent: string;
      try {
        indexHtmlContent = await import('fs').then(fs => 
          fs.promises.readFile(indexHtmlPath, 'utf-8')
        );
      } catch (error) {
        console.warn(`[${PLUGIN_NAME}] Could not read index.html from ${indexHtmlPath}, skipping static page generation`);
        return;
      }

      // Generate static pages
      for (const page of seoPages) {
        await generateStaticPage(page, config.outDir, indexHtmlContent);
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
export type { DeadSimpleSEOConfig, SEOPageMeta, SEOPageInfo, SEOPageContext, SEOPageListItem } from './types.js';
