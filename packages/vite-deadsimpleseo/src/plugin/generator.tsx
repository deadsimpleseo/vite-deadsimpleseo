
import path from 'path';
import fs from 'fs';
import vm from 'vm';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import type { ResolvedConfig } from 'vite';
import type { SEOPageInfo, SEOPageMeta } from '../shared/types.js';
import { parseMarkdown } from '../shared/markdown.js';

// Detect if we're running in the monorepo (development) or from node_modules (production)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// In monorepo: packages/vite-deadsimpleseo/src/plugin/generator.tsx
// In production: node_modules/vite-deadsimpleseo/dist/plugin/generator.js
const isMonorepo = __dirname.includes('/packages/vite-deadsimpleseo/');

// import { SEOPageDataContext, SEOPageProvider, useSEOPage, useSEOPageComponent } from '../index.js';

// import * as DeadSimpleSEO from 'vite-deadsimpleseo';

// Commented out - should not bundle deadsimpleseo-react into the plugin
// import * as DeadSimpleSEOReact from '../../../deadsimpleseo-react/dist/cjs/index.js';

import { transformWithEsbuild } from 'vite';

import { build, transform } from 'esbuild';

import type { OnLoadArgs, OnLoadResult, OnResolveArgs, OnResolveResult, Plugin, PluginBuild } from 'esbuild';
import { deprecate } from 'util';

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
    
    // Option 2: Convert absolute paths to relative paths (commented out - using inlining instead)
    // const depth = pageInfo.route.split('/').filter(Boolean).length;
    // const relativePrefix = depth > 0 ? '../'.repeat(depth) : './';
    // html = html.replace(/href="\/assets\//g, `href="${relativePrefix}assets/`);
    // html = html.replace(/src="\/assets\//g, `src="${relativePrefix}assets/`);
  }
  
  // // Handle markdown files
  // if (pageInfo.isMarkdown) {
  //   const markdownContent = fs.readFileSync(pageInfo.componentPath, 'utf-8');
  //   const parsed = parseMarkdown(markdownContent);
    
  //   // Update pageInfo with frontmatter metadata
  //   if (!pageInfo.meta) {
  //     pageInfo.meta = parsed.frontmatter;
  //   }
    
  //   // Inject title and rendered markdown content
  //   html = html.replace(
  //     '</head>',
  //     `<title>${parsed.frontmatter.title || pageInfo.name}</title>
  //   ${parsed.frontmatter.description ? `<meta name="description" content="${parsed.frontmatter.description}">` : ''}
  //   ${parsed.frontmatter.ogImage ? `<meta property="og:image" content="${parsed.frontmatter.ogImage}">` : ''}
  //   </head>`
  //   );
    
  //   // Inject markdown HTML into body
  //   html = html.replace(
  //     '<div id="root"></div>',
  //     `<div id="root">
  //     <div class="markdown-content" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
  //       ${parsed.html}
  //     </div>
  //   </div>`
  //   );
  // } else {
  //   // React component - placeholder for now
  //   html = html.replace(
  //     '</head>',
  //     `<title>${pageInfo.meta?.title || pageInfo.name}</title></head>`
  //   );
  // }

  // Get main application directory from vite bundle or config
  const appDir = path.resolve(viteConfig.root, 'src');
  // const appDir = path.dirname(require.main ? require.main.filename : process.cwd());

  const appComponentPath = path.resolve(appDir, 'App.tsx');

  // const appComponent = (await import(/* @vite-ignore */ appComponentPath)).default;

  // Render the React component to static HTML
  const renderedContent = await renderSEOPageContentToStringInVm(
    appComponentPath,
    pageInfo
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

/**
 * Generate static HTML for an SEO page (legacy - writes to disk)
 * @deprecated Use generateStaticPageHtml instead for bundle integration
 */
export async function generateStaticPage(
  viteConfig: ResolvedConfig,
  pageInfo: SEOPageInfo,
  outDir: string,
  indexHtmlTemplate: string,
  mainEntryFile: string | null = null
): Promise<void> {
  // Create output directory for this route
  const routePath = path.join(outDir, pageInfo.route);
  fs.mkdirSync(routePath, { recursive: true });

  const outputPath = path.join(routePath, 'index.html');
  const html = await generateStaticPageHtml(viteConfig, pageInfo, indexHtmlTemplate, mainEntryFile);

  fs.writeFileSync(outputPath, html, 'utf-8');
}

/**
 * Extract SEO metadata from component file
 */
export function extractSEOMeta(content: string): SEOPageMeta | undefined {
  // Look for exported seoMeta object
  const metaRegex = /export\s+const\s+seoMeta\s*=\s*({[\s\S]*?});/;
  const match = content.match(metaRegex);
  
  if (!match) {
    return undefined;
  }

  try {
    // Simple extraction - in production, would use proper AST parsing
    const metaStr = match[1];
    // This is a simplified version - proper implementation would use babel to parse
    return undefined;
  } catch {
    return undefined;
  }
}

// /**
//  * Render React component to static HTML string
//  * This is a placeholder - will be implemented with ReactDOMServer
//  */
// export async function renderSEOPageContentToString(
//   // componentPath: string,
//   // pageInfo: SEOPageInfo
//   appComponentPath: string,
// ): Promise<string> {
//   // TODO: Implement actual ReactDOMServer.renderToString
//   // This will require:
//   // 1. Dynamic import of the component
//   // 2. Creating a proper React element
//   // 3. Using ReactDOMServer.renderToString
//   // 4. Handling the SEO context provider

//   const AppComponentModule = (await import(/* @vite-ignore */ appComponentPath)).default;
  
//   function Wrapper({children}: {children: React.ReactNode}) {
//     const context = useContext(SEOPageDataContext);
//     if (context) {
//       // Aleady within SEOPageProvider
//       return <>{children}</>;
//     }

//     return (
//       <SEOPageProvider>
//         {children}
//       </SEOPageProvider>
//     );
//   }

//   // function RenderPage() {
//   //   const pageContext = useSEOPage();
//   //   const render = pageContext.render;
//   //   if (render) {
//   //     return render();
//   //   }
//   // }

//   // return `<div id="root">
//   //   <h1>${pageInfo.name}</h1>
//   //   <p>Static SEO page placeholder</p>
//   // </div>`;

//   // const contentNode = (
//   //   <Wrapper>
//   //     <RenderPage />
//   //   </Wrapper>
//   // )

//   const html = ReactDOMServer.renderToString(
//     <Wrapper>
//       <AppComponentModule />
//     </Wrapper>
//   );

//   return html;
// }

export async function renderSEOPageContentToStringInVm(
  appComponentPath: string,
  pageInfo: SEOPageInfo
) {

  if (!pageInfo || !pageInfo.componentPath) {
    throw new Error('No pageInfo or componentPath provided for rendering SEO page');
  }

  // const appModuleSource = await fs.promises.readFile(appComponentPath, 'utf-8');

    // import React from 'react';
    // import { App } from '${appComponentPath}';

    // import { App } from '${appComponentPath}';

    // function App() {
    //   return <h1>${pageInfo.name}</h1>;
    // }

  // console.log('DeadSimpleSEOReact:', DeadSimpleSEOReact);
  // return '';

  let _output: string = '';
  const setOutput = (content: string) => {
    console.log('Setting output in VM to:', content);
    _output = content;
  }

  console.log('App component path: ', appComponentPath);
  // return '';

  // const components = seoPages

  const safePageName = pageInfo.name.replace(/[^a-zA-Z0-9_$]/g, '_');

  const isMarkdown = pageInfo.isMarkdown || pageInfo.componentPath?.endsWith('.md');

  const importAndCache = !isMarkdown ? `
    import ${safePageName} from '${pageInfo.componentPath}';
    cacheSEOComponent(${JSON.stringify(pageInfo)}, ${safePageName});
  ` : '';

  const debuggingStatements = `
    console.log('App component imported in VM:', App);
    console.log('SEOPageProvider imported in VM:', SEOPageProvider);
    console.log('Page component (${safePageName}) imported in VM:', ${safePageName});
    console.log('Page component (${safePageName}) === require("${pageInfo.componentPath}").default:', ${safePageName} === require('${pageInfo.componentPath}').default);
  `;

  const mainTsx = `
    import React from 'react';

    // Export it for components that don't use import React directly
    globalThis.React = React;

    import ReactDOMServer from 'react-dom/server';
    import { SEOPageProvider, cacheSEOComponent, setCurrentSEOPage } from 'deadsimpleseo-react';

    import App from '${appComponentPath}';

    // Force page component into require cache
    ${importAndCache}

    setCurrentSEOPage(${JSON.stringify(pageInfo)});

    const html = ReactDOMServer.renderToString(
      <SEOPageProvider>
        <App />
      </SEOPageProvider>
    );

    // console.log('Rendered HTML in VM:', html);

    setOutput(html);
  `;

  console.log('main.tsx content:', mainTsx);

  // const appModuleTransformed = await transformWithEsbuild(mainTsx, 'main.tsx', {
  //   // format: 'esm',
  //   // platform: 'node',
  //   loader: 'tsx',
  //   jsx: 'automatic',
  //   // external: ['fsevents'],
  //   treeShaking: true,
  // });

  const appComponentDir = path.dirname(appComponentPath);

  const appModulePrefix = `${appComponentDir}/`;

  const resolveModule = (modulePath: string, resolveDir?: string) => {
    const extensions = ['.tsx', '.ts', '.jsx', '.js'];

    resolveDir = resolveDir || appComponentDir;
    const fullPath = path.isAbsolute(modulePath)
        ? modulePath
        : path.resolve(resolveDir, modulePath);

    // const paths = [modulePath, ...extensions.map(ext => `${modulePath}${ext}`)];
    const paths = [fullPath, ...extensions.map(ext => `${fullPath}${ext}`)];

    for (const p of paths) {
      console.log('Resolving module path:', p);
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        console.log('Resolved module path to:', p);
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
        console.log('onResolve called with args:', args);

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
            console.log('[vite-deadsimpleseo] Resolving deadsimpleseo-react to monorepo source path:', dsrPath);
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
        // if (args.path === 'deadsimpleseo-react') {
        //   const distPath = path.resolve(process.cwd(), '../../packages/deadsimpleseo-react/dist/index.js');
        //   return { path: distPath };
        //   // return { path: 'deadsimpleseo-react', namespace: 'external' };
        // }
        // if (args.path === 'deadsimpleseo-react') {
        //   // return { path: 'deadsimpleseo-react', namespace: 'external', resolveDir: process.cwd() };
        // }
        if (args.path === appComponentPath) {
          return { path: appComponentPath, namespace: 'vfs' };
        }

        // if (args.path.startsWith(appComponentDir)) {
        //   const importer = args.importer || appComponentDir;
        //   const importerDir = path.dirname(importer);
        //   const resolved = resolveModule(args.path, importerDir);

        //   console.log('Resolved absolute module to:', resolved);
        //   return { path: resolved, namespace: 'vfs' };
        // }

        // const importer = args.importer || appComponentDir;
        const appDir = args.importer ? path.dirname(args.importer) : appComponentDir;

        if (path.isAbsolute(args.path) && args.path.startsWith(appComponentDir)) {
          // const resolved = resolveModuleWithArgs(args);
          // console.log('Resolved absolute module to:', resolved);
          // return { path: resolved, namespace: 'vfs' };

          return resolveModuleWithArgs(args);

        } else if (!path.isAbsolute(args.path) && appDir.startsWith(appComponentDir)) {
          // const resolved = resolveModuleWithArgs(args);
          // console.log('Resolved relative module to:', resolved);
          // return { path: resolved, namespace: 'vfs' };

          return resolveModuleWithArgs(args);
        }

        // const distDir = path.dirname(path.resolve(process.cwd(), '../../dist/index.js'));
        // const distImporterDir = args.importer ? path.dirname(args.importer) : distDir;

        // if (args.path.startsWith(distDir) || distImporterDir.startsWith(distDir)) {
        //   return resolveDistModuleWithArgs(args);
        // }

        // Default: let esbuild handle it
        return;
      });

      build.onLoad({ filter: /.*/, namespace: 'external' }, async (args: OnLoadArgs): Promise<OnLoadResult | undefined> => {
        console.log(`onLoad called for namespace external: '${args.path}', namespace: '${args.namespace}'`);

        if (args.path === 'react') {
          return {
            contents: `
// React is provided via the VM sandbox's require function
// We use a self-executing function with a renamed require to avoid circular reference
module.exports = (function() {
  var _require = typeof require !== 'undefined' ? require : function() { throw new Error('require not available'); };
  return _require('react');
})();
`,
            loader: 'js',
          };
        }
        if (args.path === 'react-dom/server') {
          return {
            contents: `
// ReactDOMServer is provided via the VM sandbox's require function
module.exports = (function() {
  var _require = typeof require !== 'undefined' ? require : function() { throw new Error('require not available'); };
  return _require('react-dom/server');
})();
`,
            loader: 'js',
          };
        }
        // deadsimpleseo-react is bundled by esbuild, not loaded externally

        // const distDir = path.dirname(path.resolve(process.cwd(), '../../dist/index.js'));
        // if (args.path.startsWith(distDir)) {
        //   const contents = await fs.promises.readFile(args.path, 'utf-8');
        //   return {
        //     contents,
        //     loader: 'js',
        //   };
        // }

        return;
      });

      build.onLoad({ filter: /.*/, namespace: 'vfs' }, async (args: OnLoadArgs): Promise<OnLoadResult | undefined> => {
        console.log(`onLoad called for namespace vfs: '${args.path}', namespace: '${args.namespace}'`);

        if (args.path === 'main.tsx') {
          return {
            contents: mainTsx,
            loader: 'tsx',
          };
        }

        if (path.isAbsolute(args.path) && args.path.startsWith(appComponentDir)) {
          // const resolved = resolveModuleWithArgs(args);
          // console.log('Resolved absolute module to:', resolved);
          // // return { path: resolved, namespace: 'vfs' };

          return loadModuleWithArgs(args);

        } else if (!path.isAbsolute(args.path) && args.path.startsWith(appComponentDir)) {
          // const resolved = resolveModuleWithArgs(args);
          // console.log('Resolved relative module to:', resolved);
          // return { path: resolved, namespace: 'vfs' };

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
  const nodeReact = nodeRequire('react');
  console.log('Pre-loaded React:', typeof nodeReact, 'createContext' in nodeReact);

  const buildOutput = await build({
    entryPoints: ['main.tsx'],
    plugins: [vfsPlugin],
    // stdin: {
    //   contents: mainTsx,
    //   // resolveDir: process.cwd(),
    //   resolveDir: appRoot,
    //   sourcefile: 'main.tsx',
    //   loader: 'tsx',
    // },
    bundle: true,
    // outdir: '_fake/dist',
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

  // Write to code.js
  await fs.promises.writeFile(`code-${Date.now()}.cjs`, code, 'utf-8');

  const require = (moduleName: string) => {
    console.log('VM require called for module:', moduleName);

    if (moduleName === 'vite-deadsimpleseo') {
      throw new Error('vite-deadsimpleseo module not supported in VM');
    }
    
    // Only React and ReactDOMServer are external - provided by nodeRequire
    // deadsimpleseo-react is bundled into the code by esbuild
    if (moduleName === 'react' || moduleName === 'react-dom/server') {
      const loaded = nodeRequire(moduleName);
      if (moduleName === 'react') {
        console.log('Loaded React in VM === Pre-loaded React:', loaded === nodeReact);
      }
      console.log(`Loaded ${moduleName}:`, typeof loaded, Object.keys(loaded || {}).slice(0, 5));
      return loaded;
    }

    // if (path.isAbsolute(moduleName) && fs.existsSync(moduleName)) {
    //   return nodeRequire(moduleName);
    // }
    
    console.log('Unhandled require in VM for module:', moduleName);
  };

  const sandbox: any = {
    require,
    exports: {},
    module: { exports: {} },
    process,
    console,
    // React: nodeReact, // Make React available globally for JSX
    setOutput,
    util: {
      deprecate: () => {},
    },
  };

  // console.log('DeadsimpleSEOReact in VM:', sandbox.require('deadsimpleseo-react'));

  vm.createContext(sandbox);

  const script = new vm.Script(code, {
    filename: 'main.js',
  });

  script.runInContext(sandbox);

  // const appModuleTransformed = await transform(mainTsx, {
  //   loader: 'tsx',
  //   format: 'cjs',
  //   platform: 'node',
  //   // jsx: 'automatic',
  //   jsx: 'transform',
  //   treeShaking: true,
  // });

  // let _output: string = '';

  // console.log('Transformed code:', appModuleTransformed.code);

  // const setOutput = (content: string) => {
  //   console.log('Setting output in VM to:', content);
  //   _output = content;
  // }

  // const require = async (moduleName: string) => {
  //   console.log('VM require called for module:', moduleName);

  //   if (moduleName === 'react') {
  //     return React;
  //   }
  //   if (moduleName === 'react-dom/server') {
  //     return ReactDOMServer;
  //   }
  //   console.log('Requiring module in VM:', moduleName);

  //   if (moduleName === appComponentPath) {
  //     // const mod = await import(/* @vite-ignore */ moduleName);
  //     // return mod;

  //     const moduleSource = await fs.promises.readFile(moduleName, 'utf-8');
  //     const moduleTransformed = await transform(moduleSource, {
  //       loader: 'tsx',
  //       format: 'cjs',
  //       platform: 'node',
  //       jsx: 'transform',
  //       treeShaking: true,
  //     });

  //     return (() => {
  //       const moduleExports: any = {};
  //       const module = { exports: moduleExports };
  //       const sandbox: any = {
  //         require,
  //         exports: moduleExports,
  //         module,
  //         process,
  //         console,
  //         React,
  //         ReactDOMServer,
  //       };
  //       vm.createContext(sandbox);
  //       const script = new vm.Script(moduleTransformed.code, {
  //         filename: path.basename(moduleName),
  //       });
  //       script.runInContext(sandbox);
  //       return module.exports;
  //     })();
  //   }

  //   // const module = await import(moduleName);
  //   // if (module && module.default) {
  //   //   return module.default;
  //   // }

  //   return function() { return `Missing module: ${moduleName}`; };
  // };

  // // const App = await import(/* @vite-ignore */ appComponentPath).then(mod => mod.default);

  // const sandbox: any = {
  //   require,
  //   exports: {},
  //   module: { exports: {} },
  //   process,
  //   console,
  //   React,
  //   ReactDOMServer,
  //   setOutput,
  // };

  // vm.createContext(sandbox);

  // const script = new vm.Script(appModuleTransformed.code, {
  //   filename: 'main.js',
  // });

  // script.runInContext(sandbox);

  // const module = new vm.SourceTextModule(appModuleTransformed.code, {
  //   context: sandbox,
  //   initializeImportMeta(meta) {
  //     meta.url = 'file:///' + path.resolve('main.js');
  //   },
  //   importModuleDynamically: async (specifier: string) => {
  //     if (specifier === 'react') {
  //       return { default: React };
  //     }
  //     if (specifier === 'react-dom/server') {
  //       return { default: ReactDOMServer };
  //     }
  //     const mod = await import(specifier);
  //     return mod;
  //   },
  // });

  // await 

  // script.runInContext(sandbox);

  // module.link(async (specifier: string) => {
  //   if (specifier === 'react') {
  //     return { default: React };
  //   }
  //   if (specifier === 'react-dom/server') {
  //     return { default: ReactDOMServer };
  //   }
  //   const mod = await import(specifier);
  //   return mod;
  // });

  // await module.evaluate();

  // const AppComponent = sandbox.module.exports.default;

  // const html = ReactDOMServer.renderToString(
  //   <SEOPageProvider value={undefined}>
  //     <AppComponent />
  //   </SEOPageProvider>
  // );

  console.log('Output: ', _output);

  return _output;
};
