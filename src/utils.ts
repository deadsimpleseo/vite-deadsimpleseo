/**
 * Global registry of SEO page routes (populated at build time)
 */
let seoPageRoutes: Set<string> = new Set();

/**
 * Set the list of SEO page routes (called during build)
 */
export function _setSEOPageRoutes(routes: string[]): void {
  seoPageRoutes = new Set(routes);
}

/**
 * Check if the current path is an SEO page
 * Can be used outside of React context (e.g., in main.tsx)
 */
export function isSEOPage(pathname?: string): boolean {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
  
  // Normalize path (remove trailing slash)
  const normalizedPath = path.endsWith('/') && path.length > 1 
    ? path.slice(0, -1) 
    : path;
  
  return seoPageRoutes.has(normalizedPath) || seoPageRoutes.has(normalizedPath + '/');
}

/**
 * Get all SEO page routes
 */
export function getSEOPageRoutes(): string[] {
  return Array.from(seoPageRoutes);
}
