import path from 'path';
import fs from 'fs';
import type { SEOPageInfo } from '../shared/types.js';
import { DEFAULT_PRESERVE_IN_LINKS } from './config.js';

/**
 * Convert CamelCase component name to snake-case route
 * Example: AboutUs -> about-us
 * Preserves specified words from being hyphenated
 */
export function componentNameToRoute(name: string, preserveWords?: string[]): string {
  const wordsToPreserve = preserveWords || DEFAULT_PRESERVE_IN_LINKS;
  
  // Build regex pattern from preserved words (case-insensitive, word boundaries)
  const preservePattern = wordsToPreserve.length > 0
    ? new RegExp(`(${wordsToPreserve.join('|')})`, 'gi')
    : null;

  const preservePrefixPattern = wordsToPreserve.length > 0
    ? new RegExp(`^(${wordsToPreserve.join('|')})`, 'i')
    : null;
  
  // Split by preserved words or CamelCase boundaries
  const parts: string[] = [];
  let remaining = name;
  
  while (remaining.length > 0) {
    // Check if remaining starts with a preserved word
    if (preservePrefixPattern) {
      const match = remaining.match(preservePrefixPattern);
      if (match) {
        // Add preserved word as-is (lowercase)
        parts.push(match[0].toLowerCase());
        remaining = remaining.slice(match[0].length);
        continue;
      }
    }
    
    // Otherwise, extract next CamelCase component
    // Match: lowercase/digit followed by uppercase, OR sequence of uppercase followed by lowercase
    const camelMatch = remaining.match(/^([a-z0-9]+|[A-Z](?:[a-z0-9]+|(?=[A-Z])|$))/);
    if (camelMatch) {
      parts.push(camelMatch[0].toLowerCase());
      remaining = remaining.slice(camelMatch[0].length);
    } else {
      // Fallback: take first character
      parts.push(remaining[0].toLowerCase());
      remaining = remaining.slice(1);
    }
  }
  
  return parts.filter(p => p.length > 0).join('-');
}

// /**
//  * Convert CamelCase component name to snake-case route
//  * Example: AboutUs -> about-us
//  * Preserves specified words from being hyphenated
//  */
// export function componentNameToRoute(name: string, preserveWords?: string[]): string {
//   const wordsToPreserve = preserveWords || DEFAULT_PRESERVE_IN_LINKS;
  
//   // Store found preserved words and their positions
//   const foundWords: Array<{ word: string; index: number; length: number }> = [];
  
//   // Find all preserved words in the name (case-insensitive)
//   for (const word of wordsToPreserve) {
//     const regex = new RegExp(word, 'gi');
//     let match;
//     while ((match = regex.exec(name)) !== null) {
//       foundWords.push({
//         word: word.toLowerCase(),
//         index: match.index,
//         length: match[0].length
//       });
//     }
//   }
  
//   // Sort by index in reverse order to replace from end to start
//   foundWords.sort((a, b) => b.index - a.index);
  
//   // Replace preserved words with placeholders (from end to start to maintain positions)
//   let result = name;
//   const placeholders: Array<{ placeholder: string; word: string }> = [];
  
//   for (let i = 0; i < foundWords.length; i++) {
//     const { word, index, length } = foundWords[i];
//     const placeholder = `__P${i}__`;
//     placeholders.push({ placeholder, word });
//     result = result.slice(0, index) + placeholder + result.slice(index + length);
//   }
  
//   // Apply normal CamelCase to kebab-case transformation
//   result = result
//     .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
//     .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
//     .toLowerCase();
  
//   // Restore preserved words (lowercase) by replacing placeholders
//   for (const { placeholder, word } of placeholders) {
//     result = result.replace(placeholder.toLowerCase(), word);
//   }
  
//   return result;
// }

/**
 * Scan directory for React component files and optionally markdown files
 */
export async function scanSEOPages(
  pagesDir: string,
  enableMarkdown: boolean = true,
  preserveInLinks?: string[]
): Promise<SEOPageInfo[]> {
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
    
    // Add markdown extensions if enabled
    if (enableMarkdown) {
      supportedExts.push('.md', '.markdown');
    }
    
    if (!supportedExts.includes(ext)) {
      continue;
    }

    const componentPath = path.join(absolutePath, file.name);
    const componentName = path.basename(file.name, ext);
    
    // Skip index files or files starting with underscore
    if (componentName === 'index' || componentName.startsWith('_')) {
      continue;
    }

    const route = componentNameToRoute(componentName, preserveInLinks);
    const isMarkdown = ext === '.md' || ext === '.markdown';

    pages.push({
      name: componentName,
      componentPath,
      route: `/${route}`,
      isMarkdown,
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
