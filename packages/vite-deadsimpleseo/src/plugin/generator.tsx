
import path from 'path';
import fs from 'fs';
import vm from 'vm';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import type { ResolvedConfig } from 'vite';
import type { SEOPageContentPair, SEOPageInfo, SEOPageMeta } from '../shared/types.js';
import { parseMarkdown } from '../shared/markdown.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isMonorepo = __dirname.includes('/packages/vite-deadsimpleseo/');

import { build } from 'esbuild';

import type { OnLoadArgs, OnLoadResult, OnResolveArgs, OnResolveResult, Plugin, PluginBuild } from 'esbuild';

/**
 * Remove the main React app JavaScript module from HTML for static pages
 * Uses the exact filename from Vite's bundle if available
 */
function removeMainModule(html: string, mainEntryFile: string | null): string {
  if (mainEntryFile) {
    // Use the exact filename from Vite's bundle
    // mainEntryFile might include 'assets/' prefix, so handle both cases
    const fileName = mainEntryFile.replace(/^assets\//, '');
    const escapedFileName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const scriptPattern = new RegExp(
      `<script\\s+type="module"\\s+crossorigin\\s+src="/assets/${escapedFileName}"></script>`,
      'g'
    );
    html = html.replace(scriptPattern, '');
  } else {
    // Fallback to pattern matching if we don't have the exact filename
    html = html.replace(
      /<script\s+type="module"\s+crossorigin\s+src="\/assets\/(?:index|main)-[^"]+\.js"><\/script>/g,
      ''
    );
  }

  return html;
}

/**
 * Generate static HTML content for an SEO page
 * Returns the HTML string instead of writing to disk
 */
export async function generateStaticPageHtml(
  viteConfig: ResolvedConfig,
  pageInfo: SEOPageInfo,
  pages: SEOPageInfo[],
  indexHtmlTemplate: string,
  mainEntryFile: string | null = null,
  bundle?: Record<string, any>
): Promise<string> {
  let html = indexHtmlTemplate;

  // Remove main React bundle - static pages don't need React runtime
  html = removeMainModule(html, mainEntryFile);

  // Inline CSS or make paths relative for static pages
  if (bundle) {
    // Find all CSS assets in the bundle
    const cssAssets: Array<{ fileName: string; source: string | Uint8Array }> = [];
    for (const [fileName, asset] of Object.entries(bundle)) {
      if (asset.type === 'asset' && fileName.endsWith('.css')) {
        cssAssets.push({
          fileName,
          source: asset.source
        });
      }
    }

    // Option 1: Inline CSS directly into the HTML
    if (cssAssets.length > 0) {
      const inlinedStyles = cssAssets.map(asset => {
        const cssContent = typeof asset.source === 'string'
          ? asset.source
          : new TextDecoder().decode(asset.source);
        return `<style data-vite-css="${asset.fileName}">\n${cssContent}\n</style>`;
      }).join('\n');

      // Remove external CSS link tags and replace with inlined styles
      html = html.replace(/<link\s+rel="stylesheet"\s+crossorigin\s+href="\/assets\/[^"]+\.css">/g, '');
      html = html.replace('</head>', `${inlinedStyles}\n</head>`);
    }
  }

  // Get main application directory from vite bundle or config
  const appDir = path.resolve(viteConfig.root, 'src');

  const appComponentPath = path.resolve(appDir, 'App.tsx');

  // Render the React component to static HTML
  const renderedContent = await renderSEOPageContentToStringInVm(
    appComponentPath,
    pageInfo,
    pages
  );

  // Inject rendered content into body
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">
      ${renderedContent}
    </div>`
  );

  return html;
}

export async function renderSEOPageContentToStringInVm(
  appComponentPath: string,
  pageInfo: SEOPageInfo,
  pages: SEOPageInfo[] = []
) {

  if (!pageInfo || (!pageInfo.componentPath && !pageInfo.childPages?.length)) {
    throw new Error('No pageInfo, componentPath or childPages provided for rendering SEO page');
  }

  let _output: string = '';
  const setOutput = (content: string) => {
    // console.log('Setting output in VM to:', content);
    _output = content;
  }

  const isMarkdown = pageInfo.isMarkdown || pageInfo.componentPath?.endsWith('.md');

  const importAndCachePage = (pageInfo: SEOPageInfo) => {
    if (pageInfo.isMarkdown) {
      return '';
    }

    const safePageName = pageInfo.name.replace(/[^a-zA-Z0-9_$]/g, '_');
    return `
      import ${safePageName} from '${pageInfo.componentPath}';
      cacheSEOComponent(${JSON.stringify(pageInfo)}, ${safePageName});
    `;
  };

  console.log(`[vite-deadsimpleseo] Rendering SEO page in VM (index type: ${pageInfo.indexType})`);

  const neededChildComponents = pageInfo.childPages?.length ? pageInfo.childPages : [pageInfo];
  const neededIndexComponent = pageInfo.indexType === 'index' ? [pageInfo] : [];

  console.log('[vite-deadsimpleseo] Needed child components:', neededChildComponents);
  console.log('[vite-deadsimpleseo] Needed index component:', neededIndexComponent);

  const neededComponents = [...neededChildComponents, ...neededIndexComponent];

  const importAndCache = !isMarkdown ?
    neededComponents.map(p => importAndCachePage(p)).join('\n') : '';

  const mainTsx = `
    import React from 'react';

    // Export it for components that don't use import React directly
    globalThis.React = React;

    import ReactDOMServer from 'react-dom/server';
    import { SEOPageProvider, cacheSEOComponent, cacheSEOContent, cacheMultipleSEOPages, setCurrentSEOPage } from 'deadsimpleseo-react';

    import App from '${appComponentPath}';

    // Force page component into require cache
    ${importAndCache}

    // Cache markdown content if applicable
    if (seoContentPairs?.length) {
      cacheMultipleSEOPages(...seoContentPairs);
    }

    setCurrentSEOPage(${JSON.stringify(pageInfo)});

    const html = ReactDOMServer.renderToString(
      <SEOPageProvider>
        <App />
      </SEOPageProvider>
    );

    // console.log('Rendered HTML in VM:', html);

    setOutput(html);
  `;

  console.log('[vite-deadsimpleseo] mainTsx for VM:', mainTsx);

  const appComponentDir = path.dirname(appComponentPath);

  const appModulePrefix = `${appComponentDir}/`;

  const resolveModule = (modulePath: string, resolveDir?: string) => {
    const extensions = ['.tsx', '.ts', '.jsx', '.js'];

    resolveDir = resolveDir || appComponentDir;
    const fullPath = path.isAbsolute(modulePath)
      ? modulePath
      : path.resolve(resolveDir, modulePath);

    const paths = [fullPath, ...extensions.map(ext => `${fullPath}${ext}`)];

    for (const p of paths) {
      // console.log('Resolving module path:', p);
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        // console.log('Resolved module path to:', p);
        return p;
      }
    }

    throw new Error(`Cannot resolve module: ${modulePath}`);
  };

  const resolveModuleWithArgs = async (args: OnResolveArgs): Promise<OnResolveResult> => {
    const importer = args.importer || appComponentDir;
    const importerDir = path.dirname(importer);
    const resolved = resolveModule(args.path, importerDir);
    // return resolved;
    return { path: resolved, namespace: 'vfs' };
  };

  const resolveDistModuleWithArgs = async (args: OnResolveArgs): Promise<OnResolveResult | undefined> => {
    const distDir = path.dirname(path.resolve(process.cwd(), '../../dist/index.js'));
    // const resolved = path.resolve(distDir, args.path);

    const pathDir = path.dirname(args.path);

    const importer = args.importer || distDir;
    const importerDir = path.dirname(importer);

    if (pathDir.startsWith(distDir) || importerDir.startsWith(distDir)) {
      // Resolve within dist dir
      const resolved = path.isAbsolute(args.path) ?
        args.path : path.resolve(importerDir, args.path);

      return { path: resolved, namespace: 'external' };
    }
  };

  const loadModuleWithArgs = async (args: OnLoadArgs): Promise<OnLoadResult> => {
    if (!path.isAbsolute(args.path) || !args.path.startsWith(appModulePrefix)) {
      throw new Error(`Cannot load module outside app component dir: ${args.path}`);
    }

    const contents = fs.readFileSync(args.path, 'utf-8');
    const ext = path.extname(args.path).toLowerCase();

    let loader: 'tsx' | 'jsx' | 'ts' | 'js' | 'css';

    if (ext === '.tsx') {
      loader = 'tsx';
    } else if (ext === '.ts') {
      loader = 'ts';
    } else if (ext === '.jsx') {
      loader = 'jsx';
    } else if (ext === '.js') {
      loader = 'js';
    } else if (ext === '.css') {
      loader = 'css';
    } else {
      throw new Error(`Unsupported file extension for module: ${args.path}`);
    }

    return { contents, loader };
  };

  const loadDistModuleWithArgs = async (args: OnLoadArgs): Promise<OnLoadResult | undefined> => {
    const distDir = path.dirname(path.resolve(process.cwd(), '../../dist/index.js'));
    if (args.path.startsWith(distDir)) {
      const contents = await fs.promises.readFile(args.path, 'utf-8');
      return { contents, loader: 'js' };
    }
  };

  const vfsPlugin: Plugin = {
    name: 'vfs',
    setup(build: PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: OnResolveArgs): Promise<OnResolveResult | undefined> => {
        // console.log(`onResolve called for: path: '${args.path}', namespace: '${args.namespace}', resolveDir: '${args.resolveDir}'`);
        // console.log('onResolve called with args:', args);

        if (args.path === 'main.tsx') {
          return { path: 'main.tsx', namespace: 'vfs' };
        }
        if (args.path === 'react') {
          return { path: 'react', namespace: 'external' };
        }
        if (args.path === 'react-dom/server') {
          return { path: 'react-dom/server', namespace: 'external' };
        }
        if (args.path === 'vite-deadsimpleseo') {
          throw new Error('vite-deadsimpleseo module not supported in VM');
        }

        // Resolve deadsimpleseo-react to its source entry point
        // In monorepo: use source files so they get bundled with VM's React
        // In production: use the published package from node_modules
        if (args.path === 'deadsimpleseo-react') {
          if (isMonorepo) {
            // Development: resolve to source in monorepo
            // From packages/vite-deadsimpleseo/dist -> packages/deadsimpleseo-react/src
            const dsrPath = path.resolve(__dirname, '../../../deadsimpleseo-react/src/index.ts');
            // console.log('[vite-deadsimpleseo] Resolving deadsimpleseo-react to monorepo source path:', dsrPath);
            if (fs.existsSync(dsrPath)) {
              return { path: dsrPath };
            }
            // Fallback if monorepo structure is different
            console.warn('[vite-deadsimpleseo] Could not find deadsimpleseo-react source, falling back to node_modules');
          }

          // Production or fallback: resolve from node_modules
          // Use the published ESM source (or CJS if ESM not available)
          try {
            const require = createRequire(import.meta.url);
            const pkgPath = require.resolve('deadsimpleseo-react/package.json');
            const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

            // Try to use the source entry if available, otherwise use module or main
            const dsrDir = path.dirname(pkgPath);
            let entryPath = path.join(dsrDir, 'src/index.ts');

            if (!fs.existsSync(entryPath)) {
              // Use the built module entry
              const moduleEntry = pkgJson.module || pkgJson.main;
              entryPath = path.join(dsrDir, moduleEntry);
            }

            return { path: entryPath };
          } catch (error) {
            console.error('[vite-deadsimpleseo] Failed to resolve deadsimpleseo-react:', error);
            throw new Error('Could not resolve deadsimpleseo-react. Make sure it is installed.');
          }
        }

        // deadsimpleseo-react should be bundled by esbuild, not treated as external
        // Only React and ReactDOMServer are external (provided by VM's require)

        if (args.path === appComponentPath) {
          return { path: appComponentPath, namespace: 'vfs' };
        }

        const appDir = args.importer ? path.dirname(args.importer) : appComponentDir;

        if (path.isAbsolute(args.path) && args.path.startsWith(appComponentDir)) {

          return resolveModuleWithArgs(args);

        } else if (!path.isAbsolute(args.path) && appDir.startsWith(appComponentDir)) {

          return resolveModuleWithArgs(args);
        }
      });

      const selfRequire = (packageName: string) => `
module.exports = (function() {
  var _require = typeof require !== 'undefined' ? require : function() { throw new Error('require not available'); };
  return _require('${packageName}');
})();
`;

      build.onLoad({ filter: /.*/, namespace: 'external' }, async (args: OnLoadArgs): Promise<OnLoadResult | undefined> => {
        // console.log(`onLoad called for namespace external: '${args.path}', namespace: '${args.namespace}'`);

        if (args.path === 'react') {
          return {
//             contents: `
// // React is provided via the VM sandbox's require function
// // We use a self-executing function with a renamed require to avoid circular reference
// module.exports = (function() {
//   var _require = typeof require !== 'undefined' ? require : function() { throw new Error('require not available'); };
//   return _require('react');
// })();
// `,
            
            contents: selfRequire('react'),
            loader: 'js',
          };
        }
        if (args.path === 'react-dom/server') {
          return {
//             contents: `
// // ReactDOMServer is provided via the VM sandbox's require function
// module.exports = (function() {
//   var _require = typeof require !== 'undefined' ? require : function() { throw new Error('require not available'); };
//   return _require('react-dom/server');
// })();
// `,
            contents: selfRequire('react-dom/server'),
            loader: 'js',
          };
        }
        // deadsimpleseo-react is bundled by esbuild, not loaded externally
      });

      build.onLoad({ filter: /.*/, namespace: 'vfs' }, async (args: OnLoadArgs): Promise<OnLoadResult | undefined> => {
        // console.log(`onLoad called for namespace vfs: '${args.path}', namespace: '${args.namespace}'`);

        if (args.path === 'main.tsx') {
          return {
            contents: mainTsx,
            loader: 'tsx',
          };
        }

        if (path.isAbsolute(args.path) && args.path.startsWith(appComponentDir)) {
          return loadModuleWithArgs(args);
        } else if (!path.isAbsolute(args.path) && args.path.startsWith(appComponentDir)) {
          return loadModuleWithArgs(args);
        }
      });
    },
  };

  // Create a require function that works from the project's directory (where the build is running)
  // This must be before the esbuild.build call so it can be used in onLoad handlers
  const projectPackageJson = path.join(process.cwd(), 'package.json');
  const nodeRequire = createRequire(projectPackageJson);

  // Pre-load React to ensure it's in Node's module cache
  nodeRequire('react');

  const buildOutput = await build({
    entryPoints: ['main.tsx'],
    plugins: [vfsPlugin],
    bundle: true,
    outfile: '_out.js',
    write: false,
    platform: 'node',
    format: 'cjs',
    treeShaking: true,
    // external: ['fsevents'],
  });

  const outputFile = buildOutput.outputFiles?.find(f => f.path.endsWith('_out.js'));
  if (!outputFile) {
    throw new Error('Esbuild output file not found');
  }

  const code = outputFile?.text || '';

  // console.log('Esbuild generated code:', code);

  // (no debug artifacts written)
  const require = (moduleName: string) => {
    if (moduleName === 'vite-deadsimpleseo') {
      throw new Error('vite-deadsimpleseo module not supported in VM');
    }

    if (moduleName === 'react' || moduleName === 'react-dom/server') {
      return nodeRequire(moduleName);
    }
  };

  const contentPairPromises: Promise<SEOPageContentPair>[] = pages?.map(pageInfo => {
    return (async () => {
      let content = '';
      if (pageInfo.isMarkdown) {
        content = await fs.promises.readFile(pageInfo.componentPath!, 'utf-8');

        const parsed = parseMarkdown(content);

        // Update pageInfo with frontmatter metadata
        if (!pageInfo.meta) {
          pageInfo.meta = parsed.frontmatter;
        }

        content = parsed.html;
      }
      return { pageInfo, content };
    })();
  });
  const seoContentPairs = await Promise.all(contentPairPromises);

  const sandbox: any = {
    require,
    exports: {},
    module: { exports: {} },
    process,
    console,
    // React: nodeReact, // Make React available globally for JSX
    setOutput,
    util: {
      deprecate: () => { },
    },
    seoContentPairs,
  };

  // console.log('DeadsimpleSEOReact in VM:', sandbox.require('deadsimpleseo-react'));

  vm.createContext(sandbox);

  const script = new vm.Script(code, {
    filename: 'main.js',
  });

  script.runInContext(sandbox);

  return _output;
};
