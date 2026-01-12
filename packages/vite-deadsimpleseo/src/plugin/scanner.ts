import path from 'path';
import fs from 'fs';
import type { SEOPageInfo } from '../shared/types.js';
import { ucfirst } from '../shared/strings.js';
import { DEFAULT_PRESERVE_IN_LINKS } from './config.js';

/**
 * Sort filenames with priority:
 * 1. YYYYMMDD dates - reverse chronological (newest first)
 * 2. Numeric prefixes - numeric order
 * 3. Everything else - lexicographic
 */
function sortFiles(files: fs.Dirent[]): fs.Dirent[] {
  return files.sort((a, b) => {
    // Check for YYYYMMDD date format (8 digits)
    const aDateMatch = a.name.match(/^(\d{8})/);
    const bDateMatch = b.name.match(/^(\d{8})/);
    
    // Both have dates - sort in reverse chronological order (newest first)
    if (aDateMatch && bDateMatch) {
      const aDate = parseInt(aDateMatch[1], 10);
      const bDate = parseInt(bDateMatch[1], 10);
      return bDate - aDate; // Reverse order
    }
    
    // Only one has a date - date comes first
    if (aDateMatch) return -1;
    if (bDateMatch) return 1;
    
    // Check for other numeric prefixes (non-date)
    const aNumMatch = a.name.match(/^(\d+)/);
    const bNumMatch = b.name.match(/^(\d+)/);
    
    // Both start with numbers - compare numerically
    if (aNumMatch && bNumMatch) {
      const aNum = parseInt(aNumMatch[1], 10);
      const bNum = parseInt(bNumMatch[1], 10);
      return aNum - bNum;
    }
    
    // Only one starts with a number - number comes first
    if (aNumMatch) return -1;
    if (bNumMatch) return 1;
    
    // Neither starts with a number - lexicographic sort
    return a.name.localeCompare(b.name);
  });
}

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
 * Supports nested directories for organizing content like blogs
 */
export async function scanSEOPages(
  pagesDir: string,
  enableMarkdown: boolean = true,
  preserveInLinks?: string[],
  parentRoute: string = ''
): Promise<SEOPageInfo[]> {
  const absolutePath = path.resolve(process.cwd(), pagesDir);
  
  if (!fs.existsSync(absolutePath)) {
    console.warn(`[vite-deadsimpleseo] SEO pages directory not found: ${pagesDir}`);
    return [];
  }

  const pages: SEOPageInfo[] = [];
  const files = sortFiles(fs.readdirSync(absolutePath, { withFileTypes: true }));

  for (const file of files) {
    // Handle directories - create parent page with childPages
    if (file.isDirectory()) {
      // Skip directories starting with underscore or dot
      if (file.name.startsWith('_') || file.name.startsWith('.')) {
        continue;
      }

      const dirPath = path.join(absolutePath, file.name);
      const dirRoute = componentNameToRoute(file.name, preserveInLinks);
      const fullRoute = parentRoute ? `${parentRoute}/${dirRoute}` : `/${dirRoute}`;
      
      // Recursively scan the directory for child pages
      const childPages = await scanSEOPages(
        dirPath,
        enableMarkdown,
        preserveInLinks,
        fullRoute
      );

      // Create a parent page entry for the directory
      pages.push({
        name: ucfirst(file.name),
        componentPath: dirPath,
        route: fullRoute,
        childPages: childPages.length > 0 ? childPages : undefined,
      });
      
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

    // Strip YYYYMMDD date prefix or numeric prefix
    // e.g., "20240115-BlogPost" -> "BlogPost" or "01-GettingStarted" -> "GettingStarted"
    const nameWithoutPrefix = componentName.replace(/^(\d{8}|\d+)-/, '');
    const route = componentNameToRoute(nameWithoutPrefix, preserveInLinks);
    const fullRoute = parentRoute ? `${parentRoute}/${route}` : `/${route}`;
    const isMarkdown = ext === '.md' || ext === '.markdown';

    pages.push({
      name: ucfirst(componentName),
      componentPath,
      route: fullRoute,
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
