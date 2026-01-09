import path from 'path';
import fs from 'fs';
import type { SEOPageInfo } from './types.js';

/**
 * Convert CamelCase component name to snake-case route
 * Example: AboutUs -> about-us
 */
export function componentNameToRoute(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Scan directory for React component files
 */
export async function scanSEOPages(pagesDir: string): Promise<SEOPageInfo[]> {
  const absolutePath = path.resolve(process.cwd(), pagesDir);
  
  if (!fs.existsSync(absolutePath)) {
    console.warn(`[vite-deadsimpleseo] SEO pages directory not found: ${pagesDir}`);
    return [];
  }

  const pages: SEOPageInfo[] = [];
  const files = fs.readdirSync(absolutePath, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      continue;
    }

    const ext = path.extname(file.name);
    const supportedExts = ['.tsx', '.jsx', '.ts', '.js'];
    
    if (!supportedExts.includes(ext)) {
      continue;
    }

    const componentPath = path.join(absolutePath, file.name);
    const componentName = path.basename(file.name, ext);
    
    // Skip index files or files starting with underscore
    if (componentName === 'index' || componentName.startsWith('_')) {
      continue;
    }

    const route = componentNameToRoute(componentName);

    pages.push({
      name: componentName,
      componentPath,
      route: `/${route}`,
    });
  }

  return pages;
}

/**
 * Read file content
 */
export function readFileContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}
